import { Router, json } from "express";
import { MAX_TTS_CHARS, TTS_VOICES, normalizeVoiceLang, synthesizeSpeech } from "@jansetu/shared/geminiVoice";

/**
 * Text-to-speech for all three product languages (ગુજરાતી · हिन्दी · English).
 *
 * POST /api/tts            → JSON { audioDataUrl, voice, model, lang, chars }
 * POST /api/tts?raw=1      → audio/wav bytes (used by the player: no base64 inflation)
 */
export const ttsRouter = Router();

ttsRouter.post("/", json({ limit: "128kb" }), async (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text : "";
  const lang = normalizeVoiceLang(req.body?.lang);
  if (!text.trim()) {
    return res.status(400).json({ error: "invalid_payload", detail: "Send { text: string, lang: 'gu'|'hi'|'en' }" });
  }
  if (text.length > MAX_TTS_CHARS * 12) {
    return res.status(413).json({ error: "text_too_long", maxChars: MAX_TTS_CHARS * 12 });
  }

  const result = await synthesizeSpeech(text, lang);
  if (result.source !== "gemini" || !result.audioDataUrl) {
    // Honest failure: the player shows the reason instead of playing silence.
    return res.json({
      source: "unavailable",
      lang: result.lang,
      voice: result.voice,
      model: result.model,
      audioDataUrl: "",
      code: result.error?.code || "unsupported",
      status: result.error?.status ?? null,
      error: result.error?.message || "Speech synthesis unavailable.",
      hint: result.error?.hint || "Please retry.",
    });
  }

  const { recordGeminiCall } = await import("../lib/rateLimit.js");
  await recordGeminiCall();

  const wantsRaw = String(req.query?.raw || "") === "1" || String(req.headers.accept || "").startsWith("audio/");
  if (wantsRaw) {
    const b64 = result.audioDataUrl.slice(result.audioDataUrl.indexOf(",") + 1);
    const buffer = Buffer.from(b64, "base64");
    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Content-Length", String(buffer.length));
    // Private: answers are dataset-derived internal content.
    res.setHeader("Cache-Control", "private, max-age=600");
    return res.send(buffer);
  }

  res.json({ ...result, source: "gemini" });
});

/** Voice catalogue so the client picker and the server agree on names. */
ttsRouter.get("/voices", (_req, res) => {
  res.json({ voices: TTS_VOICES, maxChars: MAX_TTS_CHARS });
});
