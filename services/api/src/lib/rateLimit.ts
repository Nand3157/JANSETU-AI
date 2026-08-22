import type { Request, Response, NextFunction } from "express";

/**
 * Server-side rate limiting (directive #6) — in-memory sliding window.
 * Single-instance safe (Cloud Run keeps ≥1 warm instance); for multi-instance
 * deployments swap the Map for Redis/Memorystore using the same interface.
 */
type Bucket = { hits: number[]; };
const buckets = new Map<string, Bucket>();

const WINDOW_MS = Number(process.env.RATE_WINDOW_MS || 15 * 60 * 1000);

function key(req: Request, scope: string) {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  return `${scope}:${ip}`;
}

export function rateLimit(opts: { scope: string; max: number }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const k = key(req, opts.scope);
    const now = Date.now();
    const b = buckets.get(k) || { hits: [] };
    b.hits = b.hits.filter(t => now - t < WINDOW_MS);
    if (b.hits.length >= opts.max) {
      const retryAfter = Math.ceil((WINDOW_MS - (now - b.hits[0])) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({ error: "rate_limited", retryAfterSeconds: retryAfter });
    }
    b.hits.push(now);
    buckets.set(k, b);
    next();
  };
}

/** Periodically evict stale buckets to bound memory */
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) {
    if (!b.hits.length || now - b.hits[b.hits.length - 1] > WINDOW_MS) buckets.delete(k);
  }
}, WINDOW_MS).unref?.();

/**
 * Gemini daily spend cap (directive #6) — hard ceiling on paid AI calls per UTC day,
 * persisted to Firestore ai_usage/{yyyy-mm-dd} when configured for cross-restart audit.
 */
const DAILY_CAP = Number(process.env.GEMINI_DAILY_CAP || 500);
let dayKey = new Date().toISOString().slice(0, 10);
let used = 0;

export function geminiQuota() {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== dayKey) { dayKey = today; used = 0; }
  return { cap: DAILY_CAP, used, remaining: Math.max(0, DAILY_CAP - used), exceeded: used >= DAILY_CAP };
}

export async function recordGeminiCall(costUnits = 1) {
  const q = geminiQuota();
  if (q.exceeded) return false;
  used += costUnits;
  try {
    const { firestore, isFirebaseEnabled } = await import("../lib/firebaseAdmin.js");
    if (isFirebaseEnabled() && firestore) {
      firestore.collection("ai_usage").doc(dayKey).set(
        { date: dayKey, calls: used, cap: DAILY_CAP, updatedAt: new Date().toISOString() },
        { merge: true }
      ).catch(() => {});
    }
  } catch {}
  return true;
}
