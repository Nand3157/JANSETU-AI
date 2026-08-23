const BASE = "";

// Build auth headers from firebase/localStorage (C-14/H-18 fix)
function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  try {
    // Try Firebase ID token if available (attached by caller via init.headers if they have it)
    // For client-side, we use x-role fallback for demo, but include it consistently
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("jansetu_mock_user");
      if (saved) {
        const u = JSON.parse(saved);
        if (u?.role) headers["x-role"] = u.role;
        // If user has Firebase token in localStorage (from login), it would be handled via firebase.ts
        // We do not store tokens in localStorage — caller should use getIdToken() when Firebase configured
      } else {
        // No mock user — default citizen for public endpoints, government pages will have mock from layout
        // Don't send x-role for unauthenticated public pages
      }
      const country = localStorage.getItem("jansetu_country");
      if (country) headers["x-country"] = country;
    }
  } catch {}
  return headers;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const authHeaders = getAuthHeaders();
  // Allow caller to override x-role via init.headers
  const mergedHeaders: Record<string, string> = { "Content-Type": "application/json", ...authHeaders, ...((init?.headers as Record<string,string>) || {}) };

  // H-09 / L-03 fix: add timeout via AbortController and safe error parsing
  const controller = new AbortController();
  const timeoutMs = 15000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: mergedHeaders,
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) {
      // Try to parse JSON error, fallback to clean text — never leak raw HTML or tags
      let detail = "";
      try {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const j: any = await res.json();
          detail = j.error || j.message || j.detail || JSON.stringify(j).slice(0, 300);
        } else {
          const text = await res.text();
          // If HTML page returned (e.g. 404/500), extract readable title or use clean status text
          const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleMatch && titleMatch[1]) {
            detail = titleMatch[1].trim();
          } else {
            const stripped = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
            detail = stripped.length > 0 && stripped.length < 150 ? stripped : res.statusText || `HTTP ${res.status}`;
          }
        }
      } catch {
        detail = res.statusText || `HTTP ${res.status}`;
      }
      throw new Error(`${res.status}: ${detail}`);
    }
    return res.json() as Promise<T>;
  } catch (e: any) {
    if (e.name === "AbortError") throw new Error("Request timed out — please retry");
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

// For callers that have a Firebase ID token, use this to ensure Authorization header
export async function apiWithToken<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  return api<T>(path, { ...init, headers: { ...(init?.headers as any), Authorization: `Bearer ${token}` } });
}
