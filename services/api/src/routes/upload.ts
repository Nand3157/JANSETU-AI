import { Router, json } from "express";
import { randomBytes } from "crypto";

export const uploadRouter = Router();

/**
 * POST /api/upload — citizen photo/evidence upload.
 * Storage backends, in priority order:
 *   1. Supabase Storage  (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY) — free tier friendly
 *   2. Firebase Cloud Storage (FIREBASE_STORAGE_BUCKET + Admin SDK)
 *   3. Demo mock URLs (no config)
 *
 * Hardening (#20): MIME whitelist verified from the data URL itself,
 * decoded-size cap, random object names, uid-prefixed paths.
 */
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const MAX_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024);

const SB_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SB_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "citizen-media";
const READ_TTL = Number(process.env.SUPABASE_SIGNED_READ_SECONDS || 60 * 60 * 24 * 7);

function parseDataUrl(dataUrl: string): { contentType: string; buffer: Buffer } | null {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || "");
  if (!m) return null;
  return { contentType: m[1], buffer: Buffer.from(m[2], "base64") };
}

uploadRouter.post("/", json({ limit: "8mb" }), async (req, res) => {
  const user = (req as any).user;
  const parsed = parseDataUrl(req.body?.dataUrl);
  if (!parsed) {
    return res.status(400).json({ error: "invalid_payload", detail: `Send { dataUrl: "data:image/jpeg;base64,..." } — jpeg/png/webp only` });
  }
  if (parsed.buffer.length > MAX_BYTES) {
    return res.status(413).json({ error: "file_too_large", maxBytes: MAX_BYTES });
  }
  const ext = ALLOWED.get(parsed.contentType)!;
  // Random name — user input never touches object paths (#20)
  const objectPath = `citizen-media/${encodeURIComponent(user.uid)}/${randomBytes(16).toString("hex")}.${ext}`;

  try {
    // ── 1) Supabase Storage ──
    if (SB_URL && SB_KEY) {
      const put = await fetch(`${SB_URL}/storage/v1/object/${SB_BUCKET}/${objectPath}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SB_KEY}`,
          apikey: SB_KEY,
          "Content-Type": parsed.contentType,
          "x-upsert": "false",
          "cache-control": "3600",
        },
        body: new Uint8Array(parsed.buffer),
      });
      if (!put.ok) {
        console.error("supabase upload failed:", await put.text().catch(() => ""));
        return res.status(502).json({ error: "storage_unavailable" });
      }
      // Private bucket → time-limited signed read URL
      const sign = await fetch(`${SB_URL}/storage/v1/object/sign/${SB_BUCKET}/${objectPath}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${SB_KEY}`, apikey: SB_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ expiresIn: READ_TTL }),
      });
      let photoUrl = "";
      if (sign.ok) {
        const j: any = await sign.json().catch(() => null);
        photoUrl = j?.signedURL ? `${SB_URL}/storage/v1${j.signedURL}` : "";
      }
      if (!photoUrl) photoUrl = `${SB_URL}/storage/v1/object/public/${SB_BUCKET}/${objectPath}`;
      return res.json({ photoUrl, backend: "supabase", maxBytes: MAX_BYTES });
    }

    // ── 2) Firebase Cloud Storage ──
    const { storage } = await import("../lib/firebaseAdmin.js");
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    if (storage && bucketName) {
      const file = storage.bucket(bucketName).file(objectPath);
      await file.save(parsed.buffer, { contentType: parsed.contentType, resumable: false, private: true });
      const [readUrl] = await file.getSignedUrl({ action: "read", expires: Date.now() + READ_TTL * 1000, version: "v4" });
      return res.json({ photoUrl: readUrl, backend: "firebase", maxBytes: MAX_BYTES });
    }
  } catch (e: any) {
    console.error("upload failed:", e.message);
    return res.status(502).json({ error: "storage_unavailable" });
  }

  // ── 3) Demo fallback ──
  return res.json({
    photoUrl: `https://storage.googleapis.com/jansetu-demo-citizen-media/${objectPath}`,
    backend: "mock",
    maxBytes: MAX_BYTES,
    note: "No storage configured — set SUPABASE_* or FIREBASE_STORAGE_BUCKET for real uploads",
  });
});

uploadRouter.get("/health", (_req, res) => res.json({
  ok: true,
  service: "storage",
  backend: SB_URL && SB_KEY ? "supabase" : process.env.FIREBASE_STORAGE_BUCKET ? "firebase" : "mock",
}));
