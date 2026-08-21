/**
 * Gemini via Firebase AI Logic / Gemini Developer API
 * Real call when GEMINI_API_KEY or GCP Vertex configured, else mock from aiOrchestrator heuristics.
 * Prompt files in docs/prompts/ are loaded as system instructions.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

type GeminiOpts = {
  systemPrompt: string;
  userPrompt: string;
  responseSchema?: any; // JSON schema for responseMimeType application/json
  model?: string;
};

function loadPrompt(name: string): string {
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
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai").catch(()=> ({ GoogleGenerativeAI: null })) as any;
    if (!GoogleGenerativeAI) return null;
    const genAI = new GoogleGenerativeAI(key);
    const modelName = opts.model || process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: opts.systemPrompt,
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      } as any,
    });
    const result = await model.generateContent(opts.userPrompt);
    const text = result.response.text();
    return { text, raw: result.response };
  } catch (e: any) {
    console.warn("Gemini real call failed, falling back to mock:", e.message);
    return null;
  }
}

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
