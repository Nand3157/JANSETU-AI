export type CitizenDraft = {
  text: string;
  lang: string;
  locText: string;
  lat: number | null;
  lng: number | null;
  locSource: string;
  audioUrl: string | null;
  photoUrl: string | null;
};

const DRAFT_KEY = "jansetu_citizen_draft";
const LAST_KEY = "jansetu_last_request_id";

const empty: CitizenDraft = {
  text: "",
  lang: "auto",
  locText: "Village X, Vadodara District, Gujarat",
  // H-10 fix: default to null, not Vadodara centroid, to avoid skewing hotspots
  lat: null,
  lng: null,
  locSource: "user_text",
  audioUrl: null,
  photoUrl: null,
};

export function loadDraft(): CitizenDraft {
  if (typeof window === "undefined") return { ...empty };
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return { ...empty };
    const parsed = JSON.parse(raw);
    // M-06 fix: validate parsed draft — reject injected script or invalid fields
    if (typeof parsed !== "object" || parsed === null) return { ...empty };
    const safe: any = {};
    if (typeof parsed.text === "string") safe.text = parsed.text.slice(0, 5000);
    if (typeof parsed.lang === "string" && ["auto","en","hi","gu"].includes(parsed.lang)) safe.lang = parsed.lang;
    if (typeof parsed.locText === "string") safe.locText = parsed.locText.slice(0, 200);
    if (parsed.lat === null || (typeof parsed.lat === "number" && Number.isFinite(parsed.lat) && parsed.lat >= -90 && parsed.lat <= 90)) safe.lat = parsed.lat;
    if (parsed.lng === null || (typeof parsed.lng === "number" && Number.isFinite(parsed.lng) && parsed.lng >= -180 && parsed.lng <= 180)) safe.lng = parsed.lng;
    if (typeof parsed.locSource === "string") safe.locSource = parsed.locSource.slice(0, 20);
    if (parsed.audioUrl === null || (typeof parsed.audioUrl === "string" && parsed.audioUrl.startsWith("http"))) safe.audioUrl = parsed.audioUrl;
    if (parsed.photoUrl === null || (typeof parsed.photoUrl === "string" && parsed.photoUrl.startsWith("http"))) safe.photoUrl = parsed.photoUrl;
    return { ...empty, ...safe };
  } catch {
    return { ...empty };
  }
}

export function saveDraft(patch: Partial<CitizenDraft>): CitizenDraft {
  const next = { ...loadDraft(), ...patch };
  try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next)); } catch {}
  return next;
}

export function clearDraft() {
  try { sessionStorage.removeItem(DRAFT_KEY); } catch {}
}

export function saveLastRequestId(id: string) {
  try { sessionStorage.setItem(LAST_KEY, id); } catch {}
}

export function loadLastRequestId(): string | null {
  try { return sessionStorage.getItem(LAST_KEY); } catch { return null; }
}
