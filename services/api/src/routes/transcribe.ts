import { Router, json } from "express";
import { transcribeAudio } from "../lib/gemini.js";
import { parseMediaDataUrl, MAX_TRANSCRIBE_BYTES } from "../lib/media.js";

export const transcribeRouter = Router();

const MAX_BYTES = MAX_TRANSCRIBE_BYTES;

transcribeRouter.post("/", json({ limit: "12mb" }), async (req, res) => {
  const dataUrl = String(req.body?.dataUrl || "");
  // Allow empty dataUrl for testing? No, validate
  if (!dataUrl || dataUrl.length < 30) {
    return res.status(400).json({
      error: "invalid_payload",
      detail: 'Send { dataUrl: "data:audio/webm;base64,..." }',
    });
  }
  const parsed = parseMediaDataUrl(dataUrl, MAX_BYTES);
  if (!parsed || !parsed.mimeType.startsWith("audio/")) {
    return res.status(400).json({
      error: "invalid_payload",
      detail: 'Send { dataUrl: "data:audio/webm;base64,..." } - got ' + (parsed?.mimeType || "unparseable"),
    });
  }
  if (parsed.buffer.length > MAX_BYTES) {
    return res.status(413).json({ error: "file_too_large", maxBytes: MAX_BYTES });
  }
  const langHint = typeof req.body?.langHint === "string" ? req.body.langHint : "auto";
  try {
    const result = await transcribeAudio(dataUrl, langHint);
    // Honest contract (DESIGN.md): never substitute canned road text for real
    // audio. Empty transcript + error lets VoiceRecorder keep browser speech
    // or show a retry message — silence must never become a fake complaint.
    if (!result.transcript) {
      const hint = (langHint || "auto").toLowerCase();
      const lang = ["gu", "gu-in", "hi", "hi-in", "en", "en-in"].includes(hint) ? hint.slice(0, 2) : "und";
      return res.json({ transcript: "", language: lang, source: "unavailable", error: "Transcription unavailable — Gemini returned no transcript. Browser speech (if any) is preserved; otherwise please retry or type your request." });
    }
    res.json(result);
  } catch (e: any) {
    console.warn("transcribe failed:", e?.message);
    // Honest error — no fabricated fallback transcript.
    const hint = (typeof req.body?.langHint === "string" ? req.body.langHint : "auto").toLowerCase();
    const lang = ["gu", "hi", "en"].includes(hint) ? hint : "und";
    res.json({ transcript: "", language: lang, source: "unavailable", error: "Transcription failed: " + (e?.message || "unknown") + " — please retry or type your request." });
  }
});
