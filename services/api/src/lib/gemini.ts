/**
 * Gemini via Firebase AI Logic / Gemini Developer API
 * Real call when GEMINI_API_KEY or GCP Vertex configured, else mock from aiOrchestrator heuristics.
 * Prompt files in docs/prompts/ are loaded as system instructions.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { parseMediaDataUrl } from "./media.js";

type GeminiOpts = {
  systemPrompt: string;
  userPrompt: string;
  /** Optional inline media (audio for transcription) as a data URL: data:audio/webm;base64,... */
  audioDataUrl?: string;
  responseSchema?: any; // JSON schema for responseMimeType application/json
  model?: string;
  jsonMode?: boolean;
};

function loadPrompt(name: string): string {
  // L-07 fix: use import.meta.url relative resolution with fallback to cwd
  try {
    const urlBased = new URL(`../../../../docs/prompts/${name}`, import.meta.url);
    if (existsSync(urlBased.pathname)) return readFileSync(urlBased.pathname, "utf8");
  } catch {}
  const candidates = [
    join(process.cwd(), "..", "..", "docs", "prompts", name),
    join(process.cwd(), "docs", "prompts", name),
    join(process.cwd(), "services", "api", "..", "..", "docs", "prompts", name),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return readFileSync(p, "utf8");
  }
  return "";
}

export const MAIN_SYSTEM = (()=> {
  const p = loadPrompt("00_MAIN_SYSTEM_PROMPT.md");
  if (p) return p.slice(0,8000);
  try {
    const alt = join(process.cwd(), "..", "..", "JANSETU_AI_Complete_Hackathon_Spec", "00_MAIN_SYSTEM_PROMPT.md");
    if (existsSync(alt)) return readFileSync(alt, "utf8").slice(0,8000);
  } catch {}
  return "You are JANSETU AI — citizen-first, evidence-first, human-governed. Evidence-first, no fabrication, privacy-preserving, fairness, multilingual, uncertainty-aware.";
})();

function isValidGeminiKey(key: string): boolean {
  if (!key || key.length < 10) return false;
  // Accept both AI Studio (AIza...) and newer (AQ...) formats, but warn if unexpected
  if (!key.startsWith("AIza") && !key.startsWith("AQ.")) {
    console.warn(`GEMINI_API_KEY has unexpected prefix "${key.slice(0,4)}..." — expected AIza or AQ. — trying anyway`);
  }
  return true;
}

export async function callGeminiReal(opts: GeminiOpts): Promise<{ text: string; raw: any } | null> {
  const key = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
  if (!key || !isValidGeminiKey(key)) {
    if (!key) console.warn("GEMINI_API_KEY missing — using deterministic mock");
    return null;
  }
  // Daily spend cap — refuse paid calls once the ceiling is hit (mock fallback takes over)
  const { geminiQuota, recordGeminiCall } = await import("./rateLimit.js");
  const q = geminiQuota();
  if (q.exceeded) {
    console.warn(`Gemini daily cap reached (${q.used}/${q.cap}) — using deterministic fallback for the rest of ${dayKeySafe()}`);
    return null;
  }
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai").catch(()=> ({ GoogleGenerativeAI: null })) as any;
    if (!GoogleGenerativeAI) return null;
    const genAI = new GoogleGenerativeAI(key);
    // Model allowlist removed (2026-09 fix): Gemini ships 3.8/3.7/3.6/3.5 + 2.5
    // families and new names appear monthly. Hard-coding validModels caused
    // silent fallback to mock whenever .env used a newer valid name.
    // Sanitize format only (lowercase, gemini-/learnlm- prefix) and pass through.
    const rawModel = (opts.model || process.env.GEMINI_MODEL || "gemini-2.5-flash").trim();
    const looksValid = /^(gemini|learnlm)-[a-z0-9][a-z0-9._-]*$/i.test(rawModel);
    const modelName = looksValid ? rawModel : "gemini-2.5-flash";
    if (!looksValid) {
      console.warn(`Invalid GEMINI_MODEL "${rawModel}" — using ${modelName} instead`);
    }
    const jsonMode = opts.jsonMode !== false;
    // Only set thinkingConfig for models that support it (gemini-2.5+); 2.0-flash ignores it but some SDK versions throw
    const generationConfig: any = {
      temperature: 0.2,
      maxOutputTokens: Number(process.env.GEMINI_MAX_OUTPUT_TOKENS || 4096),
      responseMimeType: jsonMode ? "application/json" : "text/plain",
      ...(opts.responseSchema ? { responseSchema: opts.responseSchema } : {}),
    };
    // thinkingBudget=0 (fast, cheap) is supported on 2.5+ and all 3.x models.
    // 2.0/1.5 ignore it — set only where supported to avoid SDK throws.
    if (/2\.5|3\.\d+|^gemini-3|^gemini-flash-latest/.test(modelName)) {
      generationConfig.thinkingConfig = { thinkingBudget: 0 };
    }
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: opts.systemPrompt,
      generationConfig,
    });
    // Prompt-injection guardrail: cap user-supplied text length before it reaches the model
    const userPrompt = String(opts.userPrompt).slice(0, 12000);

    const parts: any[] = [{ text: userPrompt }];
    if (opts.audioDataUrl) {
      const { MAX_TRANSCRIBE_BYTES } = await import("./media.js");
      const parsed = parseMediaDataUrl(opts.audioDataUrl, MAX_TRANSCRIBE_BYTES);
      if (!parsed || !parsed.mimeType.startsWith("audio/")) throw new Error("invalid audio dataUrl");
      if (parsed.buffer.length > MAX_TRANSCRIBE_BYTES) throw new Error("audio too large");
      parts.push({ inlineData: { mimeType: parsed.mimeType, data: parsed.buffer.toString("base64") } });
    }

    const result = await model.generateContent(parts);
    const text = result.response.text();
    if (!text) return null;
    await recordGeminiCall();
    return { text, raw: result.response };
  } catch (e: any) {
    // Surface actionable diagnostics: status + body snippet tells AQ-vs-AIza
    // auth failures, 404 wrong model, 429 quota apart. Mock fallback still applies.
    const status = e?.status || e?.response?.status;
    const body = e?.response?.data || e?.errorDetails;
    console.warn("Gemini real call failed, falling back to mock:", e.message, status ? `(status ${status})` : "", body ? String(JSON.stringify(body)).slice(0, 300) : "");
    return null;
  }
}

export async function transcribeAudio(
  audioDataUrl: string,
  langHint = "auto",
): Promise<{ transcript: string; language: string; source: "gemini" | "mock" }> {
  const sys = "You transcribe civic citizen voice notes for JANSETU AI. Preserve the speaker's language and meaning. Never invent civic facts that were not spoken.";
  const user = `Transcribe the attached audio. langHint=${langHint}. Return ONLY JSON with keys transcript (string) and language (gu|hi|en|und).`;
  // Dedicated speech-to-text model (2026: gemini-3.5-transcribe stable).
  // Falls back to the main model if unset — never hardcode an allowlist.
  const transcribeModel = (process.env.GEMINI_TRANSCRIBE_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash").trim() || "gemini-2.5-flash";
  const real = await callGeminiReal({ systemPrompt: sys, userPrompt: user, audioDataUrl, jsonMode: true, model: transcribeModel });
  if (real?.text) {
    try {
      let parsed: any;
      try { parsed = JSON.parse(real.text); } catch {
        const m = real.text.match(/\{[\s\S]*\}/);
        if (m) parsed = JSON.parse(m[0]);
      }
      const transcript = String(parsed?.transcript || parsed?.text || "").trim();
      const language = String(parsed?.language || langHint || "und").slice(0, 8);
      if (transcript) return { transcript, language, source: "gemini" };
    } catch {}
    const fallback = real.text.replace(/```json|```/g, "").trim();
    if (fallback && !fallback.startsWith("{")) return { transcript: fallback, language: langHint === "auto" ? "und" : langHint, source: "gemini" };
  }
  // Honest fallback — never fabricate a transcript from silence/failure.
  // DESIGN.md honesty rules: if transcription fails, say so; the caller
  // (transcribe route / VoiceRecorder) surfaces an honest retry message and
  // keeps any browser SpeechRecognition result instead of canned road text.
  const hint = (langHint || "auto").toLowerCase();
  const detectedLang =
    hint === "gu" || hint === "gu-in" ? "gu"
    : hint === "hi" || hint === "hi-in" ? "hi"
    : hint === "en" || hint === "en-in" ? "en"
    : "und";
  return { transcript: "", language: detectedLang, source: "mock" };
}

function dayKeySafe() { return new Date().toISOString().slice(0, 10); }

export function getPrompt(name: string) { return loadPrompt(name); }
export const promptFiles = {
  citizenIntake: getPrompt("01_CITIZEN_INTAKE_PROMPT.txt"),
  normalization: getPrompt("02_REQUEST_NORMALIZATION_PROMPT.txt"),
  dedup: getPrompt("03_DEDUPLICATION_CLUSTERING_PROMPT.txt"),
  priority: getPrompt("04_PRIORITY_SCORING_PROMPT.txt"),
  recommendation: getPrompt("05_PROJECT_RECOMMENDATION_PROMPT.txt"),
  copilot: getPrompt("06_POLICY_COPILOT_PROMPT.txt"),
  impact: getPrompt("07_IMPACT_REPORT_PROMPT.txt"),
  brief: getPrompt("08_POLICY_BRIEF_PROMPT.txt"),
};
