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
  lat: 22.3072,
  lng: 73.1812,
  locSource: "user_text",
  audioUrl: null,
  photoUrl: null,
};

export function loadDraft(): CitizenDraft {
  if (typeof window === "undefined") return { ...empty };
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return { ...empty };
    return { ...empty, ...JSON.parse(raw) };
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
