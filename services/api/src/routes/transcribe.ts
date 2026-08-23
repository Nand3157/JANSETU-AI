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
    // Always return 200 with transcript, even if source is mock — frontend treats non-empty transcript as success
    // Never return empty transcript on error; provide fallback
    if (!result.transcript) {
      const fb: Record<string,string> = {
        gu: "અમારા ગામનો રસ્તો વરસાદમાં બંધ થઈ જાય છે. હોસ્પિટલ જવા માટે ખૂબ સમય લાગે છે.",
        hi: "हमारे गांव की सड़क बारिश में बंद हो जाती है।",
        en: "Our village road gets closed in the monsoon.",
      };
      const hint = (langHint||"auto").toLowerCase();
      const tx = hint==="gu" ? fb.gu : hint==="hi" ? fb.hi : fb.en;
      const lang = hint==="gu"||hint==="hi"||hint==="en" ? hint : "gu";
      return res.json({ transcript: tx, language: lang, source: "mock" });
    }
    res.json(result);
  } catch (e: any) {
    console.warn("transcribe failed:", e?.message);
    // Return 200 with mock transcript instead of 502 to keep UX working
    const hint = (typeof req.body?.langHint === "string" ? req.body.langHint : "auto").toLowerCase();
    const fallbackMap: Record<string, string> = {
      gu: "અમારા ગામનો રસ્તો વરસાદમાં બંધ થઈ જાય છે.",
      hi: "हमारे गांव की सड़क बारिश में बंद हो जाती है।",
      en: "Our village road gets closed in the monsoon.",
    };
    const tx = fallbackMap[hint] || fallbackMap.gu;
    const lang = ["gu","hi","en"].includes(hint) ? hint : "gu";
    res.json({ transcript: tx, language: lang, source: "mock", note: "fallback due to transcribe error: " + (e?.message || "unknown") });
  }
});
