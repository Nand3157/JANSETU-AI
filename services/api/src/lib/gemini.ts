/**
 * Gemini access for the JANSETU API.
 *
 * Transport lives in `packages/shared/src/geminiVoice.ts` so the Express API and
 * the Next.js route handler speak to Gemini identically:
 *   - key authenticated with the `x-goog-api-key` header (accepts AIza… and AQ.…)
 *   - failures classified (auth / quota / model_not_found / …) instead of swallowed
 *   - real `gemini-3.5-transcribe` speech-to-text and real TTS
 *
 * Prompt files in docs/prompts/ are loaded as system instructions.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { generateText, transcribeAudio as transcribeShared, type TranscribeResult } from "@jansetu/shared/geminiVoice";
import { parseMediaDataUrl, MAX_TRANSCRIBE_BYTES } from "./media.js";

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

/**
 * Back-compat wrapper used by aiOrchestrator. Returns null when Gemini could not
 * answer so callers keep their deterministic path — but the reason is logged and
 * available on GET /api/debug/gemini (lastCall.code).
 */
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

  let inline: { mimeType: string; data: string } | undefined;
  if (opts.audioDataUrl) {
    const parsed = parseMediaDataUrl(opts.audioDataUrl, MAX_TRANSCRIBE_BYTES);
    if (!parsed || !parsed.mimeType.startsWith("audio/")) {
      console.warn("callGeminiReal: invalid audio dataUrl — skipping inline audio");
    } else {
      inline = { mimeType: parsed.mimeType, data: parsed.buffer.toString("base64") };
    }
  }

  const res = await generateText({
    model: (opts.model || process.env.GEMINI_MODEL || "gemini-3.7-flash").trim(),
    systemInstruction: opts.systemPrompt,
    userText: opts.userPrompt,
    jsonMode: opts.jsonMode !== false,
    responseSchema: opts.responseSchema,
    inline,
  });

  if (!res.ok) {
    // Actionable diagnostics: status + code separate AQ-vs-AIza auth failures,
    // wrong model names (404) and quota (429). Deterministic fallback still applies.
    console.warn(`Gemini call failed [${res.error.code}${res.error.status ? ` ${res.error.status}` : ""}] ${res.model}: ${res.error.message}`);
    return null;
  }
  await recordGeminiCall();
  return { text: res.text, raw: res.text };
}

/**
 * Real speech-to-text for citizen voice notes (Gemini 3.5 Transcribe).
 * Empty transcript + classified error when the engine cannot answer — silence
 * must never become a fabricated complaint.
 */
export async function transcribeAudio(audioDataUrl: string, langHint = "auto"): Promise<TranscribeResult> {
  return transcribeShared(audioDataUrl, langHint);
}

/** Diagnostics for GET /api/debug/gemini (no secrets, just shapes and outcomes). */
export { voiceDiagnostics } from "@jansetu/shared/geminiVoice";

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
