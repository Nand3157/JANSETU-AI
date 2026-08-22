import { Router, json } from "express";
import { transcribeAudio } from "../lib/gemini.js";
import { parseMediaDataUrl } from "../lib/media.js";

export const transcribeRouter = Router();

const MAX_BYTES = 8 * 1024 * 1024;

transcribeRouter.post("/", json({ limit: "8mb" }), async (req, res) => {
  const dataUrl = String(req.body?.dataUrl || "");
  const parsed = parseMediaDataUrl(dataUrl);
  if (!parsed || !parsed.mimeType.startsWith("audio/")) {
    return res.status(400).json({
      error: "invalid_payload",
      detail: 'Send { dataUrl: "data:audio/webm;base64,..." }',
    });
  }
  if (parsed.buffer.length > MAX_BYTES) {
    return res.status(413).json({ error: "file_too_large", maxBytes: MAX_BYTES });
  }
  const langHint = typeof req.body?.langHint === "string" ? req.body.langHint : "auto";
  try {
    const result = await transcribeAudio(dataUrl, langHint);
    res.json(result);
  } catch (e: any) {
    console.warn("transcribe failed:", e?.message);
    res.status(502).json({ error: "transcribe_failed", transcript: "", language: "und", source: "mock" });
  }
});
