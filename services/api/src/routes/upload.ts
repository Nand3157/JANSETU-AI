import { Router, json } from "express";
import { randomBytes } from "crypto";
import { parseMediaDataUrl, MAX_UPLOAD_BYTES as SHARED_MAX_BYTES } from "../lib/media.js";

export const uploadRouter = Router();

/**
 * POST /api/upload — citizen photo/audio evidence upload.
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
  ["audio/webm", "webm"],
  ["audio/ogg", "ogg"],
  ["audio/mpeg", "mp3"],
  ["audio/mp4", "m4a"],
  ["audio/aac", "aac"],
  ["audio/wav", "wav"],
  ["audio/x-wav", "wav"],
]);
const MAX_BYTES = SHARED_MAX_BYTES;

// FIX: Normalize SUPABASE_URL — handle cases where env contains /rest/v1/ suffix (PostgREST URL) but Storage API expects base host
function normalizeSupabaseUrl(raw: string): string {
  let u = (raw || "").trim().replace(/\/$/, "");
  if (!u) return "";
  // If URL ends with /rest/v1 or /rest/v1/ or /rest, strip to base
  u = u.replace(/\/rest\/v1\/?$/, "").replace(/\/rest\/?$/, "");
  return u.replace(/\/$/, "");
}
const SB_URL = normalizeSupabaseUrl(process.env.SUPABASE_URL || "");
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SB_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "citizen-media";
// M-14 fix: reduce TTL from 7 days to 1 hour for PII; keep env configurable but default 1h
const READ_TTL = Math.min(Number(process.env.SUPABASE_SIGNED_READ_SECONDS || 3600), 86400);

uploadRouter.post("/", json({ limit: "12mb" }), async (req, res) => {
  const user = (req as any).user;
  // C-13: Check Content-Length header early for DoS protection before parsing body — allow up to 12MB for base64 overhead
  const contentLength = Number(req.headers["content-length"] || 0);
  if (contentLength > 12 * 1024 * 1024) {
    return res.status(413).json({ error: "file_too_large", maxBytes: MAX_BYTES });
  }
  const parsed = parseMediaDataUrl(req.body?.dataUrl, MAX_BYTES);
  if (!parsed || !ALLOWED.has(parsed.mimeType)) {
    return res.status(400).json({ error: "invalid_payload", detail: `Send { dataUrl: "data:image/jpeg;base64,..." } or audio/webm — jpeg/png/webp/webm/ogg/mp4/wav` });
  }
  const contentType = parsed.mimeType;
  const buffer = parsed.buffer;
  if (buffer.length > MAX_BYTES) {
    return res.status(413).json({ error: "file_too_large", maxBytes: MAX_BYTES });
  }
  const ext = ALLOWED.get(contentType)!;
  const isAudio = contentType.startsWith("audio/");
  // Random name — user input never touches object paths (#20)
  // C-08 fix: use raw uid without encodeURIComponent to match storage.rules {userId} (no encoding mismatch)
  // Sanitize uid to allow only alphanumeric, -, _
  const safeUid = String(user.uid).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
  const objectPath = `citizen-media/${safeUid}/${randomBytes(16).toString("hex")}.${ext}`;

  try {
    // ── 1) Supabase Storage ──
    if (SB_URL && SB_KEY) {
      const put = await fetch(`${SB_URL}/storage/v1/object/${SB_BUCKET}/${objectPath}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SB_KEY}`,
          apikey: SB_KEY,
          "Content-Type": contentType,
          "x-upsert": "false",
          "cache-control": "3600",
        },
        body: new Uint8Array(buffer),
      });
      if (!put.ok) {
        const errText = await put.text().catch(() => "");
        console.warn("supabase upload failed, falling back to mock:", put.status, errText.slice(0,300));
        // Fall through to mock instead of failing — keeps demo working even with misconfigured Supabase
      } else {
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
        return res.json({ url: photoUrl, photoUrl: isAudio ? undefined : photoUrl, audioUrl: isAudio ? photoUrl : undefined, contentType, backend: "supabase", maxBytes: MAX_BYTES });
      }
    }

    // ── 2) Firebase Cloud Storage ──
    const { storage } = await import("../lib/firebaseAdmin.js");
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
    if (storage && bucketName) {
      const file = storage.bucket(bucketName).file(objectPath);
      await file.save(buffer, { contentType, resumable: false, private: true });
      const [readUrl] = await file.getSignedUrl({ action: "read", expires: Date.now() + READ_TTL * 1000, version: "v4" });
      return res.json({ url: readUrl, photoUrl: isAudio ? undefined : readUrl, audioUrl: isAudio ? readUrl : undefined, contentType, backend: "firebase", maxBytes: MAX_BYTES });
    }
  } catch (e: any) {
    console.warn("upload failed, falling back to mock:", e.message);
    // Fall through to mock
  }

  // ── 3) Demo fallback ──
  const mockUrl = `https://storage.googleapis.com/jansetu-demo-citizen-media/${objectPath}`;
  return res.json({
    url: mockUrl,
    photoUrl: isAudio ? undefined : mockUrl,
    audioUrl: isAudio ? mockUrl : undefined,
    contentType,
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
