/**
 * JANSETU AI — Gemini native voice layer (shared by services/api and apps/web).
 *
 * Why this file exists:
 *  - The old integration used the deprecated `@google/generative-ai` SDK and sent
 *    the key as `?key=`. Google's new Auth keys (`AQ.Ab8...`) and the SDK's
 *    hard-coded v1beta routes made that path fail silently, so every voice note
 *    and every copilot answer quietly degraded to a mock. The observable symptoms
 *    were "We recorded audio but couldn't transcribe it (engine busy or muted)"
 *    and "Gemini was tried but returned no JSON — fallback".
 *  - This module speaks the REST API directly, always authenticating with the
 *    `x-goog-api-key` header (the transport that accepts both `AIza…` Standard
 *    keys and the newer `AQ.…` Auth keys), and it never swallows a failure:
 *    every call reports a classified error the UI can show honestly.
 *
 * Speech-to-text: `gemini-3.5-transcribe` via the Interactions API (inline
 * base64 audio, no Files API round-trip), with a generateContent compatibility
 * path if that surface rejects the request.
 * Text-to-speech: `gemini-3.1-flash-tts-preview` via generateContent with
 * `responseModalities: ["AUDIO"]`; raw 24 kHz PCM is wrapped into a WAV container.
 *
 * No imports: this file must run in the Express server, in a Next route handler,
 * and under plain `tsc`/`tsx` without pulling in app-specific code.
 */

export type VoiceLang = "gu" | "hi" | "en";

export type VoiceErrorCode =
  | "no_key"
  | "cap_reached"
  | "auth"
  | "quota"
  | "model_not_found"
  | "bad_request"
  | "upstream"
  | "network"
  | "empty_response"
  | "audio_invalid"
  | "audio_too_large"
  | "audio_too_short"
  | "unsupported";

export type VoiceError = {
  code: VoiceErrorCode;
  status?: number;
  message: string;
  /** Short, user-safe recovery instruction (never contains the API key). */
  hint: string;
};

export type TranscribeResult = {
  transcript: string;
  /** gu · hi · en · und — derived from the transcript's script, not guessed. */
  language: VoiceLang | "und";
  /** Language the citizen explicitly picked, echoed back for the UI. */
  langHint: VoiceLang | "auto";
  model: string;
  mode: "smart" | "verbatim";
  durationMs?: number;
  latencyMs: number;
  source: "gemini" | "unavailable";
  error?: VoiceError;
};

export type SpeechResult = {
  /** data:audio/wav;base64,… — playable directly in an <audio> element. */
  audioDataUrl: string;
  mimeType: "audio/wav";
  sampleRate: number;
  voice: string;
  model: string;
  lang: VoiceLang;
  chars: number;
  /** The clip covers only the first part of a long text — the UI must say so. */
  truncated: boolean;
  latencyMs: number;
  cached: boolean;
  source: "gemini" | "unavailable";
  error?: VoiceError;
};

// ── Configuration ───────────────────────────────────────────────────────────

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

/** Transcribe model is a dedicated STT model; it is not a general chat model. */
export const TRANSCRIBE_MODEL = () =>
  (process.env.GEMINI_TRANSCRIBE_MODEL || "gemini-3.5-transcribe").trim();

export const MAIN_MODEL = () => (process.env.GEMINI_MODEL || "gemini-3.7-flash").trim();

export const TTS_MODEL = () =>
  (process.env.GEMINI_TTS_MODEL || "gemini-3.1-flash-tts-preview").trim();

/**
 * Prebuilt Gemini voices (all 30 are multilingual; gu + hi are both supported).
 * Warm/clear voices suit public-service read-back better than bright ones.
 */
export const TTS_VOICES: Record<VoiceLang, string> = {
  gu: (process.env.GEMINI_TTS_VOICE_GU || "Sulafat").trim(),
  hi: (process.env.GEMINI_TTS_VOICE_HI || "Achird").trim(),
  en: (process.env.GEMINI_TTS_VOICE_EN || "Kore").trim(),
};

/** Endonym labels so the picker never says "Gujarati" to a Gujarati speaker. */
export const VOICE_LANG_LABELS: Record<VoiceLang, { endonym: string; english: string; bcp47: string }> = {
  gu: { endonym: "ગુજરાતી", english: "Gujarati", bcp47: "gu-IN" },
  hi: { endonym: "हिन्दी", english: "Hindi", bcp47: "hi-IN" },
  en: { endonym: "English", english: "English", bcp47: "en-IN" },
};

const TRANSCRIBE_TIMEOUT_MS = Number(process.env.GEMINI_TRANSCRIBE_TIMEOUT_MS || 45_000);
const TTS_TIMEOUT_MS = Number(process.env.GEMINI_TTS_TIMEOUT_MS || 60_000);
const MAX_TRANSCRIBE_BYTES = Number(process.env.MAX_TRANSCRIBE_BYTES || 8 * 1024 * 1024);
/** Shortest clip worth a paid call — below this the user almost certainly missed the button. */
const MIN_TRANSCRIBE_BYTES = 900;
export const MAX_TTS_CHARS = Number(process.env.GEMINI_TTS_MAX_CHARS || 1200);

export function normalizeVoiceLang(value: unknown): VoiceLang | "auto" {
  const v = String(value ?? "auto").toLowerCase();
  if (v.startsWith("gu")) return "gu";
  if (v.startsWith("hi")) return "hi";
  if (v.startsWith("en")) return "en";
  return "auto";
}

// ── Diagnostics state (surfaced by /api/debug/gemini, never leaks the key) ───

type LastCall = {
  at: string;
  kind: "generateContent" | "transcribe" | "tts" | "translate";
  model: string;
  ok: boolean;
  status?: number;
  code?: VoiceErrorCode;
  message?: string;
  latencyMs: number;
};
let lastCall: LastCall | null = null;

export function voiceDiagnostics() {
  const key = geminiKey();
  return {
    key: {
      present: !!key,
      format: key.startsWith("AQ.") ? "auth_aq" : key.startsWith("AIza") ? "standard_aiza" : key ? "unknown" : "missing",
      length: key.length,
      prefix: key.slice(0, 4) || null,
      transport: "x-goog-api-key header",
    },
    models: { main: MAIN_MODEL(), transcribe: TRANSCRIBE_MODEL(), tts: TTS_MODEL(), translate: MAIN_MODEL() },
    limits: { maxTranslateChars: MAX_TRANSLATE_CHARS, maxTtsChars: MAX_TTS_CHARS },
    voices: TTS_VOICES,
    lastCall,
  };
}

function geminiKey(): string {
  return (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
}

function note(kind: LastCall["kind"], model: string, ok: boolean, latencyMs: number, err?: VoiceError, status?: number) {
  lastCall = {
    at: new Date().toISOString(),
    kind,
    model,
    ok,
    latencyMs,
    ...(status ? { status } : {}),
    ...(err ? { code: err.code, message: err.message } : {}),
  };
}

/** Map an HTTP failure onto something the UI can act on. */
function classify(status: number, body: string): VoiceError {
  const detail = body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 300);
  const reason = /"reason"\s*:\s*"([^"]+)"/.exec(body)?.[1] || "";
  if (status === 401 || status === 403) {
    return {
      code: "auth",
      status,
      message: `Gemini rejected the API key (HTTP ${status}${reason ? `, ${reason}` : ""}).`,
      hint: "Replace GEMINI_API_KEY with a valid key from Google AI Studio (AIza… or AQ.…) and restart. GET /api/debug/gemini shows the key format the server is using.",
    };
  }
  if (status === 404) {
    return {
      code: "model_not_found",
      status,
      message: `Model not available for this key (HTTP 404). ${detail}`,
      hint: "Check GEMINI_MODEL / GEMINI_TRANSCRIBE_MODEL / GEMINI_TTS_MODEL against the available models list.",
    };
  }
  if (status === 429) {
    return {
      code: "quota",
      status,
      message: "Gemini rate limit or free-tier quota reached (HTTP 429).",
      hint: "Wait a moment and retry, or lower GEMINI_DAILY_CAP usage. Browser speech is still used when available.",
    };
  }
  if (status === 400) {
    return {
      code: "bad_request",
      status,
      message: `Gemini rejected the request (HTTP 400). ${detail}`,
      hint: "The audio or text payload may be malformed or too long — retry with a shorter clip or shorter text.",
    };
  }
  if (status >= 500) {
    return {
      code: "upstream",
      status,
      message: `Gemini is unavailable right now (HTTP ${status}).`,
      hint: "This is upstream — retry in a moment.",
    };
  }
  return {
    code: "network",
    status,
    message: `Gemini call failed (HTTP ${status}). ${detail}`,
    hint: "Retry; if it persists, check server connectivity.",
  };
}

const NO_KEY: VoiceError = {
  code: "no_key",
  message: "GEMINI_API_KEY is not configured on this server.",
  hint: "Set GEMINI_API_KEY (and redeploy / restart the API) to enable Gemini voice and AI answers.",
};

// ── Transport ──────────────────────────────────────────────────────────────

type CallOpts = { timeoutMs?: number };

/** One POST to generativelanguage.googleapis.com with the key in the header. */
async function postJson<T>(
  path: string,
  body: unknown,
  opts: CallOpts = {},
): Promise<{ ok: true; data: T; latencyMs: number } | { ok: false; error: VoiceError; latencyMs: number }> {
  const key = geminiKey();
  const started = Date.now();
  if (!key) return { ok: false, error: NO_KEY, latencyMs: 0 };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? TRANSCRIBE_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        // Header (not ?key=) so both AIza… and AQ.… Auth keys authenticate.
        "x-goog-api-key": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const latencyMs = Date.now() - started;
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: classify(res.status, text), latencyMs };
    }
    const data = (await res.json().catch(() => null)) as T;
    if (data == null) {
      return {
        ok: false,
        error: { code: "empty_response", message: "Gemini returned an unreadable body.", hint: "Retry." },
        latencyMs,
      };
    }
    return { ok: true, data, latencyMs };
  } catch (e: any) {
    const latencyMs = Date.now() - started;
    const aborted = e?.name === "AbortError";
    return {
      ok: false,
      error: {
        code: aborted ? "network" : "network",
        message: aborted ? "Gemini timed out." : `Gemini request failed: ${String(e?.message || e).slice(0, 160)}`,
        hint: aborted ? "The clip may be long — try a shorter recording." : "Check connectivity and retry.",
      },
      latencyMs,
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Join every text part of a generateContent response. */
function readCandidateText(j: any): string {
  const parts = j?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts.map((p: any) => (typeof p?.text === "string" ? p.text : "")).join("").trim();
}

/** Read text out of an Interactions API response (REST shape varies by release). */
function readInteractionText(j: any): string {
  if (typeof j?.output_text === "string" && j.output_text.trim()) return j.output_text.trim();
  const out: string[] = [];
  for (const o of Array.isArray(j?.outputs) ? j.outputs : []) {
    if (typeof o?.text === "string") out.push(o.text);
  }
  if (out.length) return out.join("\n").trim();
  for (const step of Array.isArray(j?.steps) ? j.steps : []) {
    for (const c of Array.isArray(step?.content) ? step.content : []) {
      if (typeof c?.text === "string") out.push(c.text);
    }
  }
  return out.join("\n").trim();
}

// ── Text generation (grounded answers, intake, briefs) ─────────────────────

export type GenerateOpts = {
  /** Defaults to GEMINI_MODEL. */
  model?: string;
  systemInstruction?: string;
  userText: string;
  /** Ask for application/json output (default true — every JANSETU prompt is JSON). */
  jsonMode?: boolean;
  responseSchema?: unknown;
  temperature?: number;
  maxOutputTokens?: number;
  /** Extra inline parts (e.g. audio) appended after the text part. */
  inline?: { mimeType: string; data: string };
  timeoutMs?: number;
};

/**
 * Single entry point for every Gemini text call in the product.
 * Always returns a classified error instead of a silent mock, so callers can
 * tell the user (and the logs) whether Gemini answered or the key/route broke.
 */
export async function generateText(
  opts: GenerateOpts,
): Promise<{ ok: true; text: string; latencyMs: number; model: string } | { ok: false; error: VoiceError; latencyMs: number; model: string }> {
  const model = (opts.model || MAIN_MODEL()).trim();
  const jsonMode = opts.jsonMode !== false;
  const generationConfig: Record<string, unknown> = {
    temperature: opts.temperature ?? 0.2,
    maxOutputTokens: Number(opts.maxOutputTokens ?? process.env.GEMINI_MAX_OUTPUT_TOKENS ?? 2048),
    responseMimeType: jsonMode ? "application/json" : "text/plain",
    ...(opts.responseSchema ? { responseSchema: opts.responseSchema } : {}),
  };
  // 2.5+/3.x accept thinkingBudget 0 (fast, cheap); older models reject it.
  if (/2\.5|3\.\d+/.test(model)) generationConfig.thinkingConfig = { thinkingBudget: 0 };

  const parts: any[] = [{ text: String(opts.userText).slice(0, 12000) }];
  if (opts.inline) parts.push({ inlineData: { mimeType: opts.inline.mimeType, data: opts.inline.data } });

  const res = await postJson<any>(
    "/models/" + encodeURIComponent(model) + ":generateContent",
    {
      ...(opts.systemInstruction ? { systemInstruction: { parts: [{ text: String(opts.systemInstruction).slice(0, 8000) }] } } : {}),
      contents: [{ role: "user", parts }],
      generationConfig,
    },
    { timeoutMs: opts.timeoutMs },
  );

  if (!res.ok) {
    note("generateContent", model, false, res.latencyMs, res.error, res.error.status);
    return { ok: false, error: res.error, latencyMs: res.latencyMs, model };
  }
  const text = readCandidateText(res.data);
  if (!text) {
    const error: VoiceError = {
      code: "empty_response",
      message: "Gemini returned an empty response.",
      hint: "Retry, or check /api/debug/gemini for the last upstream status.",
    };
    note("generateContent", model, false, res.latencyMs, error);
    return { ok: false, error, latencyMs: res.latencyMs, model };
  }
  note("generateContent", model, true, res.latencyMs);
  return { ok: true, text, latencyMs: res.latencyMs, model };
}

/** Tolerant JSON parse for model output (handles ```json fences and prose wrappers). */
export function parseModelJson(raw: string): any | null {
  const cleaned = String(raw || "").replace(/```(?:json)?/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {}
  const block = cleaned.match(/\{[\s\S]*\}/);
  if (block) {
    try {
      return JSON.parse(block[0]);
    } catch {}
  }
  return null;
}

// ── Speech to text ─────────────────────────────────────────────────────────

// -- Translation: the citizen's language <-> the language they asked to read --

const TRANSLATE_TIMEOUT_MS = Number(process.env.GEMINI_TRANSLATE_TIMEOUT_MS || 30_000);
export const MAX_TRANSLATE_CHARS = Number(process.env.GEMINI_TRANSLATE_MAX_CHARS || 3000);

export type TranslateResult = {
  translation: string;
  /** Script-detected language of the text that was sent. */
  sourceLanguage: VoiceLang | "und";
  targetLanguage: VoiceLang;
  model: string;
  /** True when no call was needed: the text was already in the target language. */
  alreadyTarget: boolean;
  chars: number;
  latencyMs: number;
  source: "gemini" | "unavailable";
  error?: VoiceError;
};

/**
 * The translation contract, in the system instruction.
 *
 * Non-negotiable product rules encoded here: the citizen's words are the record,
 * so the engine may only re-say them in another language. It may not answer,
 * summarise, shorten, soften or "improve" a report, and it may not drop the
 * village name or the numbers an official will act on.
 */
const TRANSLATE_SYSTEM = [
  "You are the translation engine of JANSETU AI, a civic platform used by citizens and officials in India.",
  "You translate a citizen's report from one language to another. You are not an assistant: never answer the report, summarise it, correct it, or comment on it.",
  "Rules:",
  "- Translate the citizen's own words with the same meaning, register and level of detail. Add nothing, remove nothing, explain nothing.",
  "- Keep proper nouns, village and district names, numbers, units, currency and dates faithful; transliterate names where that is natural.",
  "- Keep the citizen's informal first-person voice (\"we\", \"our village\").",
  "- If the text is already in the target language, return it exactly as it is.",
  'Output only JSON: {"translation": string, "detected_source_language": "gu" | "hi" | "en" | "und"}',
].join("\n");

export type ParsedAudio = { mimeType: string; base64: string; bytes: number };

/** Accepts data:audio/webm;codecs=opus;base64,… from MediaRecorder. */
export function parseAudioDataUrl(dataUrl: string): ParsedAudio | VoiceError {
  const raw = String(dataUrl || "").trim();
  const m = /^data:(audio\/[a-z0-9.+-]+)((?:;[\w.=+-]+)*);base64,([A-Za-z0-9+/=\s]+)$/i.exec(raw);
  if (!m) {
    return { code: "audio_invalid", message: "Audio payload is not a base64 audio data URL.", hint: "Record again — the clip did not upload correctly." };
  }
  const base64 = m[3].replace(/\s/g, "");
  const bytes = Math.floor((base64.length * 3) / 4) - (base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0);
  if (bytes > MAX_TRANSCRIBE_BYTES) {
    return {
      code: "audio_too_large",
      message: `Audio is ${(bytes / 1048576).toFixed(1)} MB, over the ${(MAX_TRANSCRIBE_BYTES / 1048576).toFixed(0)} MB limit.`,
      hint: "Record a shorter note (under a minute).",
    };
  }
  return { mimeType: m[1].toLowerCase(), base64, bytes };
}

/** Script beats guessing: Devanagari = hi, Gujarati block = gu, else en. */
export function detectLangFromText(text: string): VoiceLang | "und" {
  if (!text) return "und";
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (/[A-Za-z]/.test(text)) return "en";
  return "und";
}

/**
 * Translate one citizen text into one of the three product languages.
 *
 * Two cheap paths run before any call, and both matter for correctness rather
 * than cost: an empty text is refused instead of invented, and a text that is
 * already in the target language is returned untouched. That second rule is what
 * stops a language picker being switched back and forth from re-translating an
 * already-correct text — translating a translation is how meaning drifts.
 *
 * Callers keep the verbatim source: this returns a rendering, never a record.
 */
export async function translateText(
  text: string,
  targetLang: unknown,
  sourceLang?: unknown,
): Promise<TranslateResult> {
  const target = normalizeVoiceLang(targetLang);
  const hinted = normalizeVoiceLang(sourceLang);
  const raw = String(text ?? "").slice(0, MAX_TRANSLATE_CHARS);
  const detected = detectLangFromText(raw);

  if (target === "auto") {
    return translateUnavailable(detected, "en", {
      code: "bad_request",
      message: "No target language was given.",
      hint: "Pick ગુજરાતી, हिन्दी or English.",
    });
  }
  if (!raw.trim()) {
    return translateUnavailable(detected, target, {
      code: "bad_request",
      message: "There is no text to translate.",
      hint: "Write or dictate the request first.",
    });
  }
  // Already in the language the citizen asked for: nothing to do, nothing spent.
  if (detected === target || (hinted !== "auto" && hinted === target)) {
    return {
      translation: raw,
      sourceLanguage: detected,
      targetLanguage: target,
      model: MAIN_MODEL(),
      alreadyTarget: true,
      chars: raw.length,
      latencyMs: 0,
      source: "gemini",
    };
  }

  const res = await generateText({
    model: MAIN_MODEL(),
    systemInstruction: TRANSLATE_SYSTEM,
    userText: `TARGET_LANGUAGE: ${target} (${VOICE_LANG_LABELS[target].english})\nSOURCE_HINT: ${hinted === "auto" ? detected : hinted}\nCITIZEN_TEXT:\n${raw}`,
    jsonMode: true,
    // Translation is a transformation, not a composition: sample greedily.
    temperature: 0,
    maxOutputTokens: 2048,
    timeoutMs: TRANSLATE_TIMEOUT_MS,
  });

  if (!res.ok) {
    note("translate", res.model, false, res.latencyMs, res.error, res.error.status);
    return {
      translation: "",
      sourceLanguage: detected,
      targetLanguage: target,
      model: res.model,
      alreadyTarget: false,
      chars: raw.length,
      latencyMs: res.latencyMs,
      source: "unavailable",
      error: res.error,
    };
  }

  const parsed = parseModelJson(res.text);
  const translation = typeof parsed?.translation === "string" ? parsed.translation.trim() : "";
  if (!translation) {
    const error: VoiceError = {
      code: "empty_response",
      message: "The translation came back empty.",
      hint: "Retry, or keep the text in the language you wrote it in.",
    };
    note("translate", res.model, false, res.latencyMs, error);
    return {
      translation: "",
      sourceLanguage: detected,
      targetLanguage: target,
      model: res.model,
      alreadyTarget: false,
      chars: raw.length,
      latencyMs: res.latencyMs,
      source: "unavailable",
      error,
    };
  }

  note("translate", res.model, true, res.latencyMs);
  return {
    translation,
    sourceLanguage: normalizeVoiceLang(parsed?.detected_source_language) === "auto" ? detected : (normalizeVoiceLang(parsed?.detected_source_language) as VoiceLang),
    targetLanguage: target,
    model: res.model,
    alreadyTarget: false,
    chars: raw.length,
    latencyMs: res.latencyMs,
    source: "gemini",
  };
}

function translateUnavailable(source: VoiceLang | "und", target: VoiceLang, error: VoiceError): TranslateResult {
  return {
    translation: "",
    sourceLanguage: source,
    targetLanguage: target,
    model: MAIN_MODEL(),
    alreadyTarget: false,
    chars: 0,
    latencyMs: 0,
    source: "unavailable",
    error,
  };
}

/**
 * Real transcription with Gemini 3.5 Transcribe.
 * Primary: Interactions API (inline audio). Fallback: generateContent inlineData.
 * Never invents a transcript — an unavailable engine returns an empty transcript
 * plus a classified error so the citizen sees the truth.
 */
export async function transcribeAudio(audioDataUrl: string, langHint = "auto"): Promise<TranscribeResult> {
  const hint = normalizeVoiceLang(langHint);
  const model = TRANSCRIBE_MODEL();
  const parsed = parseAudioDataUrl(audioDataUrl);
  if ("code" in parsed) return unavailable("", hint, model, parsed);
  if (parsed.bytes < MIN_TRANSCRIBE_BYTES) {
    return unavailable("", hint, model, {
      code: "audio_too_short",
      message: "The recording is too short to transcribe.",
      hint: "Tap the mic, speak clearly for 2–3 seconds, then stop.",
    });
  }

  // language_codes: only bias when the citizen chose a language; otherwise let
  // the model auto-detect across 85+ locales (it handles code-switching).
  const languageCodes = hint === "auto" ? [] : [VOICE_LANG_LABELS[hint].bcp47];

  const interaction = await postJson<any>(
    "/interactions",
    {
      model,
      input: [{ type: "audio", data: parsed.base64, mime_type: parsed.mimeType }],
      generation_config: {
        transcription_config: {
          // Smart mode strips fillers and formats dates/numbers — a civic note
          // reads as a written complaint instead of a verbatim mumble.
          mode: "smart",
          language_codes: languageCodes,
        },
      },
    },
    { timeoutMs: TRANSCRIBE_TIMEOUT_MS },
  );

  if (interaction.ok) {
    const text = readInteractionText(interaction.data).replace(/\s+/g, " ").trim();
    if (text) {
      const language = detectLangFromText(text) === "und" ? (hint === "auto" ? "und" : hint) : detectLangFromText(text);
      const result: TranscribeResult = {
        transcript: text,
        language,
        langHint: hint,
        model,
        mode: "smart",
        latencyMs: interaction.latencyMs,
        source: "gemini",
      };
      note("transcribe", model, true, interaction.latencyMs);
      return result;
    }
    // Empty transcript from a successful call = silence/no speech. Honest answer.
    return unavailable("", hint, model, {
      code: "empty_response",
      message: "Gemini heard no speech in the clip.",
      hint: "Speak closer to the microphone for 2–3 seconds and try again.",
    });
  }

  // Compatibility path: some keys/projects still route 3.5-transcribe through
  // generateContent. Only worth attempting when the failure was not auth/quota.
  if (interaction.error.code === "auth" || interaction.error.code === "quota") {
    return unavailable("", hint, model, interaction.error);
  }

  const compat = await postJson<any>(
    "/models/" + encodeURIComponent(model) + ":generateContent",
    {
      systemInstruction: {
        parts: [
          {
            text:
              "You are a precise speech-to-text engine for JANSETU AI civic voice notes. " +
              "Return ONLY JSON: {\"transcript\": string, \"language\": \"gu\"|\"hi\"|\"en\"|\"und\"}. " +
              "Transcribe exactly what was said in its original language. Never translate, never invent facts, " +
              "and never return placeholder text. If the audio has no intelligible speech, return an empty transcript.",
          },
        ],
      },
      contents: [
        {
          role: "user",
          parts: [
            { text: `Transcribe this audio. langHint=${hint}.` },
            { inlineData: { mimeType: parsed.mimeType, data: parsed.base64 } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    },
    { timeoutMs: TRANSCRIBE_TIMEOUT_MS },
  );

  if (!compat.ok) return unavailable("", hint, model, compat.error);

  const raw = readCandidateText(compat.data);
  const text = extractTranscript(raw);
  if (!text) {
    return unavailable("", hint, model, {
      code: "empty_response",
      message: "The transcription model returned no usable text.",
      hint: "Retry the recording, or type your request instead.",
    });
  }
  const language = detectLangFromText(text) === "und" ? (hint === "auto" ? "und" : hint) : detectLangFromText(text);
  note("transcribe", model, true, compat.latencyMs);
  return {
    transcript: text,
    language,
    langHint: hint,
    model,
    mode: "verbatim",
    latencyMs: compat.latencyMs,
    source: "gemini",
  };
}

function extractTranscript(raw: string): string {
  if (!raw) return "";
  const cleaned = raw.replace(/```(?:json)?/g, "").trim();
  try {
    const p = JSON.parse(cleaned.match(/\{[\s\S]*\}/)?.[0] || cleaned);
    const t = String(p?.transcript ?? p?.text ?? "").trim();
    if (t) return t.replace(/\s+/g, " ");
  } catch {
    if (!cleaned.startsWith("{")) return cleaned.replace(/\s+/g, " ");
  }
  return "";
}

function unavailable(
  transcript: string,
  hint: VoiceLang | "auto",
  model: string,
  error: VoiceError,
): TranscribeResult {
  note("transcribe", model, false, 0, error, error.status);
  return { transcript, language: hint === "auto" ? "und" : hint, langHint: hint, model, mode: "smart", latencyMs: 0, source: "unavailable", error };
}

// ── Text to speech ─────────────────────────────────────────────────────────

const SPEECH_CACHE = new Map<string, SpeechResult>();
const SPEECH_CACHE_MAX = 32;

/** Rough LRU: re-insert on hit, drop the oldest entry when full. */
function cacheGet(key: string): SpeechResult | undefined {
  const hit = SPEECH_CACHE.get(key);
  if (hit) {
    SPEECH_CACHE.delete(key);
    SPEECH_CACHE.set(key, hit);
  }
  return hit;
}
function cacheSet(key: string, value: SpeechResult) {
  SPEECH_CACHE.set(key, value);
  while (SPEECH_CACHE.size > SPEECH_CACHE_MAX) {
    const oldest = SPEECH_CACHE.keys().next().value as string | undefined;
    if (oldest === undefined) break;
    SPEECH_CACHE.delete(oldest);
  }
}

/** Markdown, URLs and bullets read badly aloud — turn text into speech prose. */
export function toSpeakableText(input: string): string {
  return prepareSpeech(input).text;
}

/** Same conversion, plus whether the sentence-boundary cut dropped anything. */
function prepareSpeech(input: string): { text: string; truncated: boolean } {
  let t = String(input || "");
  t = t.replace(/```[\s\S]*?```/g, " ");
  t = t.replace(/`([^`]*)`/g, "$1");
  t = t.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1");
  t = t.replace(/https?:\/\/\S+/g, " ");
  t = t.replace(/^\s{0,3}[-*•]\s+/gm, ", ");
  t = t.replace(/^\s{0,3}\d+[.)]\s+/gm, ", ");
  t = t.replace(/[*_#>|]+/g, " ");
  t = t.replace(/\s*\n\s*/g, ". ");
  t = t.replace(/\.\s*\./g, ".");
  t = t.replace(/\s+/g, " ").trim();
  if (t.length <= MAX_TTS_CHARS) return { text: t, truncated: false };
  // Cut at a sentence boundary so the read-back never stops mid-thought.
  const clipped = t.slice(0, MAX_TTS_CHARS);
  const lastStop = Math.max(clipped.lastIndexOf("."), clipped.lastIndexOf("।"), clipped.lastIndexOf("?"));
  return { text: (lastStop > MAX_TTS_CHARS * 0.5 ? clipped.slice(0, lastStop + 1) : clipped).trim(), truncated: true };
}

export function pcmToWav(pcm: Buffer, sampleRate = 24000, channels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

/** Pull the inline audio part out of a TTS generateContent response. */
function readInlineAudio(j: any): string {
  for (const cand of Array.isArray(j?.candidates) ? j.candidates : []) {
    for (const part of Array.isArray(cand?.content?.parts) ? cand.content.parts : []) {
      const data = part?.inlineData?.data || part?.inline_data?.data;
      if (typeof data === "string" && data.length > 64) return data;
    }
  }
  return "";
}

/**
 * Real multilingual speech synthesis (Gujarati, Hindi, English).
 * Returns a WAV data URL so any <audio> element can play it unchanged.
 */
export async function synthesizeSpeech(text: string, lang: unknown): Promise<SpeechResult> {
  const L = normalizeVoiceLang(lang);
  const target: VoiceLang = L === "auto" ? "en" : L;
  const model = TTS_MODEL();
  const voice = TTS_VOICES[target];
  const { text: speakable, truncated } = prepareSpeech(text);

  if (!speakable) {
    return speechUnavailable(target, model, voice, {
      code: "bad_request",
      message: "There is no text to read aloud.",
      hint: "Nothing to play yet.",
    });
  }

  const cacheKey = `${model}:${voice}:${target}:${speakable}`;
  const cached = cacheGet(cacheKey);
  if (cached) return { ...cached, cached: true };

  // The model auto-detects the input language, so a mismatched picker should
  // never make it translate or drop words: name the language we actually see.
  const detected = detectLangFromText(speakable);
  const spokenAs = detected === "und" ? VOICE_LANG_LABELS[target].english : VOICE_LANG_LABELS[detected].english;
  const intent = `Read the following ${spokenAs} text aloud exactly as written, in a calm, clear, official public-service voice. Do not translate it and do not add or omit anything:\n\n${speakable}`;

  const res = await postJson<any>(
    "/models/" + encodeURIComponent(model) + ":generateContent",
    {
      contents: [{ role: "user", parts: [{ text: intent }] }],
      generationConfig: {
        // AUDIO-only output: TTS models reject text+audio modality mixes.
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      },
    },
    { timeoutMs: TTS_TIMEOUT_MS },
  );

  if (!res.ok) return speechUnavailable(target, model, voice, res.error);

  const b64 = readInlineAudio(res.data);
  if (!b64) {
    return speechUnavailable(target, model, voice, {
      code: "empty_response",
      message: "Gemini returned no audio for this text.",
      hint: "Retry, or shorten the text being read aloud.",
    });
  }

  const wav = pcmToWav(Buffer.from(b64, "base64"));
  const result: SpeechResult = {
    audioDataUrl: `data:audio/wav;base64,${wav.toString("base64")}`,
    mimeType: "audio/wav",
    sampleRate: 24000,
    voice,
    model,
    lang: target,
    chars: speakable.length,
    truncated,
    latencyMs: res.latencyMs,
    cached: false,
    source: "gemini",
  };
  cacheSet(cacheKey, result);
  note("tts", model, true, res.latencyMs);
  return result;
}

function speechUnavailable(lang: VoiceLang, model: string, voice: string, error: VoiceError): SpeechResult {
  note("tts", model, false, 0, error, error.status);
  return {
    audioDataUrl: "",
    mimeType: "audio/wav",
    sampleRate: 24000,
    voice,
    model,
    lang,
    chars: 0,
    truncated: false,
    latencyMs: 0,
    cached: false,
    source: "unavailable",
    error,
  };
}
