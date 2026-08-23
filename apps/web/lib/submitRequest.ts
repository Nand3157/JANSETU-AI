import { api } from "./api";
import { uploadPhoto } from "./firebase";
import { saveLastRequestId } from "./draft";

export async function submitCitizenRequest(input: {
  text: string;
  category?: string;
  lang: string;
  lat: number | null;
  lng: number | null;
  locSource: string;
  audioUrl?: string | null;
  photoFile?: File | null;
  photoUrl?: string | null;
}) {
  let photoUrl = input.photoUrl || null;
  if (!photoUrl && input.photoFile) photoUrl = await uploadPhoto(input.photoFile);
  const created: any = await api("/api/requests", {
    method: "POST",
    body: JSON.stringify({
      originalText: input.text,
      category: input.category || "other",
      sourceLanguage: input.lang === "auto" ? undefined : input.lang,
      // H-10 fix: don't send fake default coords when GPS denied — send null and let backend handle it
      latitude: input.lat ?? null,
      longitude: input.lng ?? null,
      locationSource: input.locSource,
      photoUrl,
      audioUrl: input.audioUrl || null,
    }),
    headers: { "x-role": "citizen", "x-country": "IN" },
  });
  const analyzed: any = await api(`/api/requests/${created.requestId}/analyze`, { method: "POST" });
  saveLastRequestId(created.requestId);
  return analyzed;
}
