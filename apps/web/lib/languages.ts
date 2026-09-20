/**
 * The three intake languages — named once for the whole web app.
 *
 * Labels are endonyms on purpose: a Gujarati speaker is never shown the word
 * "Gujarati". The BCP-47 tags are used for `lang` attributes, so a screen
 * reader switches to the right voice for the text that follows.
 *
 * (The server has the same table in packages/shared/src/geminiVoice.ts, with the
 * voice each language maps to; this one is the UI's copy and holds no secrets.)
 */
export type UiLang = "gu" | "hi" | "en";

export const LANG_NAME: Record<UiLang | "auto", string> = {
  gu: "ગુજરાતી",
  hi: "हिन्दी",
  en: "English",
  auto: "Auto-detect",
};

export const LANG_BCP47: Record<UiLang | "auto", string> = {
  gu: "gu-IN",
  hi: "hi-IN",
  en: "en-IN",
  auto: "en-IN",
};

/**
 * Which of the three languages a text is written in, by script. Devanagari is
 * Hindi, the Gujarati block is Gujarati; anything else with Latin letters is
 * English. Script beats guessing, and an unknown text is reported as such
 * rather than assumed to be English.
 */
export function scriptLang(text: string): UiLang | "und" {
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (/[A-Za-z]/.test(text)) return "en";
  return "und";
}

/** Human name for a language code, falling back to the code itself. */
export function langName(lang: string | null | undefined): string {
  const key = String(lang || "auto").toLowerCase();
  return (LANG_NAME as Record<string, string>)[key.slice(0, 2)] || (key === "auto" ? LANG_NAME.auto : key);
}
