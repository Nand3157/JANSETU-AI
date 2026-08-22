/** Parse a data URL for citizen photo/audio uploads. Allows codec parameters (Chrome webm;codecs=opus). */

const MEDIA_RE =
  /^data:((?:image|audio)\/[a-z0-9.+-]+)((?:;[\w.=+\-]+)*);base64,([A-Za-z0-9+/=\s]+)$/i;

export function parseMediaDataUrl(dataUrl: string): { mimeType: string; buffer: Buffer } | null {
  const raw = String(dataUrl || "").trim();
  const m = MEDIA_RE.exec(raw);
  if (!m) return null;
  const mimeType = m[1].toLowerCase();
  const buffer = Buffer.from(m[3].replace(/\s/g, ""), "base64");
  if (!buffer.length) return null;
  return { mimeType, buffer };
}
