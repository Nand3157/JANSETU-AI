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

export async function callGeminiReal(opts: GeminiOpts): Promise<{ text: string; raw: any } | null> {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) return null;
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
    // H-03 fix: valid model names only — fallback to gemini-2.0-flash, not hallucinated 3.5
    const rawModel = opts.model || process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const validModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp"];
    const modelName = validModels.includes(rawModel) ? rawModel : "gemini-2.0-flash";
    if (rawModel !== modelName) {
      console.warn(`Invalid GEMINI_MODEL "${rawModel}" — using ${modelName} instead`);
    }
    const jsonMode = opts.jsonMode !== false;
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: opts.systemPrompt,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: Number(process.env.GEMINI_MAX_OUTPUT_TOKENS || 4096),
        responseMimeType: jsonMode ? "application/json" : "text/plain",
        ...(opts.responseSchema ? { responseSchema: opts.responseSchema } : {}),
        // Gemini 3.x thinking can consume the output budget; keep civic JSON calls cheap.
        thinkingConfig: { thinkingBudget: 0 },
      } as any,
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
    console.warn("Gemini real call failed, falling back to mock:", e.message);
    return null;
  }
}

export async function transcribeAudio(
  audioDataUrl: string,
  langHint = "auto",
): Promise<{ transcript: string; language: string; source: "gemini" | "mock" }> {
  const sys = "You transcribe civic citizen voice notes for JANSETU AI. Preserve the speaker's language and meaning. Never invent civic facts that were not spoken.";
  const user = `Transcribe the attached audio. langHint=${langHint}. Return ONLY JSON with keys transcript (string) and language (gu|hi|en|und).`;
  const real = await callGeminiReal({ systemPrompt: sys, userPrompt: user, audioDataUrl, jsonMode: true });
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
  return { transcript: "", language: langHint === "auto" ? "und" : langHint, source: "mock" };
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
