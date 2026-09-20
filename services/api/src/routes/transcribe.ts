import { Router, json } from "express";
import { transcribeAudio } from "../lib/gemini.js";
import { parseMediaDataUrl, MAX_TRANSCRIBE_BYTES } from "../lib/media.js";

export const transcribeRouter = Router();

const MAX_BYTES = MAX_TRANSCRIBE_BYTES;

transcribeRouter.post("/", json({ limit: "12mb" }), async (req, res) => {
  const dataUrl = String(req.body?.dataUrl || "");
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
  const result = await transcribeAudio(dataUrl, langHint);
  // Honest contract (DESIGN.md): never substitute canned road text for real audio.
  // A missing transcript carries the *classified* reason (auth / quota / no speech)
  // so VoiceRecorder can show what actually happened instead of "engine busy".
  if (!result.transcript) {
    return res.json({
      transcript: "",
      language: result.language,
      source: "unavailable",
      model: result.model,
      code: result.error?.code || "unsupported",
      status: result.error?.status ?? null,
      error: result.error?.message || "Transcription unavailable.",
      hint: result.error?.hint || "Please retry, or type your request below.",
    });
  }
  res.json({
    transcript: result.transcript,
    language: result.language,
    source: "gemini",
    model: result.model,
    mode: result.mode,
    latencyMs: result.latencyMs,
  });
});
