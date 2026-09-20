import { Router } from "express";
import { translate } from "../lib/gemini.js";
import { MAX_TRANSLATE_CHARS, normalizeVoiceLang } from "@jansetu/shared/geminiVoice";

export const translateRouter = Router();

/**
 * POST /api/translate — the citizen's text in another of the three languages.
 *
 * Why this is server-side: the translation must come from the same governed
 * engine as intake (the prompt forbids answering or editorialising a report),
 * and the browser must never hold a Gemini key. The verbatim original stays
 * with the client and in the request record — this endpoint only renders it.
 *
 * Honest contract, matching /api/transcribe: a failure returns an empty
 * translation plus the *classified* reason, so the UI can say what actually
 * happened instead of quietly showing the untranslated text as if it were done.
 */
// The shared 100 KB /api body cap (index.ts) already covers MAX_TRANSLATE_CHARS,
// so this route parses nothing of its own and cannot widen the surface.
translateRouter.post("/", async (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text : "";
  const target = normalizeVoiceLang(req.body?.targetLang);
  if (target === "auto") {
    return res.status(400).json({
      error: "invalid_payload",
      detail: `Send { text: string, targetLang: "gu" | "hi" | "en" }`,
    });
  }
  if (!text.trim()) {
    return res.status(400).json({ error: "invalid_payload", detail: "text is required" });
  }
  if (text.length > MAX_TRANSLATE_CHARS) {
    return res.status(413).json({ error: "text_too_long", maxChars: MAX_TRANSLATE_CHARS });
  }

  const result = await translate(text, target, req.body?.sourceLang);

  if (!result.translation) {
    return res.json({
      translation: "",
      source: "unavailable",
      sourceLanguage: result.sourceLanguage,
      targetLanguage: result.targetLanguage,
      model: result.model,
      code: result.error?.code || "unsupported",
      status: result.error?.status ?? null,
      error: result.error?.message || "Translation unavailable.",
      hint: result.error?.hint || "Retry, or keep the text in the language you wrote it in.",
    });
  }

  res.json({
    translation: result.translation,
    source: result.alreadyTarget ? "already_target" : "gemini",
    sourceLanguage: result.sourceLanguage,
    targetLanguage: result.targetLanguage,
    model: result.model,
    latencyMs: result.latencyMs,
  });
});
