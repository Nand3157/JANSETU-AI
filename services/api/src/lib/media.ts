/** Parse a data URL for citizen photo/audio uploads. Allows codec parameters (Chrome webm;codecs=opus). */

// Shared constant for upload limits (H-02/H-11/C-13 fix)
export const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024);
export const MAX_TRANSCRIBE_BYTES = 8 * 1024 * 1024;

// Regex: allow codec parameters (e.g. audio/webm;codecs=opus) and tolerate whitespace/newlines in base64
const MEDIA_RE =
  /^data:((?:image|audio)\/[a-z0-9.+-]+)((?:;[\w.=+\-]+)*);base64,([A-Za-z0-9+/=\s]+)$/;

// Estimate decoded size before allocating Buffer (C-13 OOM fix)
// Base64 length * 3/4 minus padding = decoded bytes
function estimateDecodedSize(b64Length: number, padding: number): number {
  return Math.floor(b64Length * 3 / 4) - padding;
}

export function parseMediaDataUrl(dataUrl: string, maxBytes: number = MAX_UPLOAD_BYTES): { mimeType: string; buffer: Buffer } | null {
  const raw = String(dataUrl || "").trim();
  // Pre-check total length to avoid regex DoS on huge strings (C-13)
  // Max wire size ~ 8MB base64 = ~10.6MB string; reject > 14MB upfront (12MB for 8MB decoded + header)
  if (raw.length > 14 * 1024 * 1024) return null;
  // Quick estimate before regex to avoid allocating huge Buffer (C-13 OOM)
  const commaIdxEarly = raw.indexOf(",");
  if (commaIdxEarly !== -1 && raw.length > maxBytes * 4 / 3 + 200) {
    const b64PartEarly = raw.slice(commaIdxEarly + 1).replace(/\s/g, "");
    const padEarly = b64PartEarly.endsWith("==") ? 2 : b64PartEarly.endsWith("=") ? 1 : 0;
    const estEarly = estimateDecodedSize(b64PartEarly.length, padEarly);
    if (estEarly > maxBytes) return null;
  }
  const m = MEDIA_RE.exec(raw);
  if (!m) return null;
  const mimeType = m[1].toLowerCase();
  let b64 = m[3].replace(/\s/g, ""); // strip whitespace/newlines that FileReader may inject
  // Auto-pad base64 if missing padding (some encoders omit ==)
  const rem = b64.length % 4;
  if (rem === 1) return null; // invalid
  if (rem === 2) b64 += "==";
  else if (rem === 3) b64 += "=";
  // Additional size check before Buffer allocation
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  const estimated = estimateDecodedSize(b64.length, padding);
  if (estimated > maxBytes) return null;
  try {
    const buffer = Buffer.from(b64, "base64");
    if (!buffer.length) return null;
    if (buffer.length > maxBytes) return null;
    // Validate round-trip: ensure base64 was valid (Buffer.from is forgiving)
    if (buffer.length < 10 && estimated > 100) return null; // suspicious
    return { mimeType, buffer };
  } catch {
    return null;
  }
}
