/** Parse a data URL for citizen photo/audio uploads. Allows codec parameters (Chrome webm;codecs=opus). */

// Shared constant for upload limits (H-02/H-11/C-13 fix)
export const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024);
export const MAX_TRANSCRIBE_BYTES = 8 * 1024 * 1024;

// Stricter regex: no whitespace in base64 (M-18 fix), base64 must be valid, length check before decode
const MEDIA_RE =
  /^data:((?:image|audio)\/[a-z0-9.+-]+)((?:;[\w.=+\-]+)*);base64,([A-Za-z0-9+/=]+)$/;

// Estimate decoded size before allocating Buffer (C-13 OOM fix)
// Base64 length * 3/4 minus padding = decoded bytes
function estimateDecodedSize(b64Length: number, padding: number): number {
  return Math.floor(b64Length * 3 / 4) - padding;
}

export function parseMediaDataUrl(dataUrl: string, maxBytes: number = MAX_UPLOAD_BYTES): { mimeType: string; buffer: Buffer } | null {
  const raw = String(dataUrl || "").trim();
  // Pre-check total length to avoid regex DoS on huge strings (C-13)
  // Max wire size ~ 8MB base64 = ~10.6MB string; reject > 12MB upfront
  if (raw.length > 12 * 1024 * 1024) return null;
  if (raw.length > maxBytes * 4 / 3 + 100) {
    // Quick estimate: if even base64 portion would exceed max, reject before Buffer alloc
    // Find comma position: header + "," + b64
    const commaIdx = raw.indexOf(",");
    if (commaIdx !== -1) {
      const b64Part = raw.slice(commaIdx + 1);
      const padding = b64Part.endsWith("==") ? 2 : b64Part.endsWith("=") ? 1 : 0;
      const estimated = estimateDecodedSize(b64Part.length, padding);
      if (estimated > maxBytes) return null;
    }
  }
  const m = MEDIA_RE.exec(raw);
  if (!m) return null;
  const mimeType = m[1].toLowerCase();
  const b64 = m[3];
  // Additional size check before Buffer allocation
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  const estimated = estimateDecodedSize(b64.length, padding);
  if (estimated > maxBytes) return null;
  // Validate base64 length is multiple of 4 (strict)
  if (b64.length % 4 !== 0) return null;
  try {
    const buffer = Buffer.from(b64, "base64");
    if (!buffer.length) return null;
    if (buffer.length > maxBytes) return null;
    return { mimeType, buffer };
  } catch {
    return null;
  }
}
