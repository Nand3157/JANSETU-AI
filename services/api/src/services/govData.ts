/**
 * Government of India — REAL data service.
 *
 * Three sources, in priority order:
 *  1. LIVE  — data.gov.in (Open Government Data Platform India) REST API.
 *             Enabled when DATA_GOV_IN_API_KEY is set (free key from data.gov.in/user/register).
 *  2. LIVE  — India Post PIN Code API (api.postalpincode.in) — keyless, official Department of Posts.
 *  3. BUNDLED — Census of India 2011 district facts (Primary Census Abstract, Office of the
 *             Registrar General & Census Commissioner, MoHA). Public domain. Used as the offline
 *             ground truth for enrichment so the demo never fabricates population figures.
 *
 * Governance: every fact carries `source` + `source_date` + verify URL. Nothing here is invented;
 * when a figure is unknown we return null rather than a guess.
 */

const OGD_BASE = "https://api.data.gov.in/resource";
const PIN_BASE = "https://api.postalpincode.in/pincode";

// ---------------------------------------------------------------- Census 2011 (bundled, public domain)

export interface DistrictFact {
  district: string;        // canonical Census name
  aliases: string[];       // common spellings we accept
  population: number;      // total persons, Census 2011
  householdsApprox: number; // pop ÷ avg household size (rounded)
  source: string;
  sourceDate: string;
  verifyUrl: string;
}

export const GUJARAT_STATE_CENSUS_2011 = {
  state: "Gujarat",
  population: 60439692,
  literacyRatePct: 78.03,
  sexRatioPer1000Males: 919,
  densityPerKm2: 308,
  source: "Census of India 2011 — Office of the Registrar General & Census Commissioner, Ministry of Home Affairs, Government of India",
  sourceDate: "2011-01-01",
  verifyUrl: "https://censusindia.gov.in/census.website/data/population-finder",
} as const;

// High-confidence Primary Census Abstract figures for demo-relevant districts only.
// Unknown districts intentionally absent → callers must handle null (never estimate silently).
const CENSUS_2011_DISTRICTS: DistrictFact[] = [
  { district: "Ahmadabad", aliases: ["ahmedabad", "ahmadabad", "amdavad"], population: 7214225, householdsApprox: 1514000, source: "Census of India 2011 — Primary Census Abstract", sourceDate: "2011-01-01", verifyUrl: "https://censusindia.gov.in/census.website/data/population-finder" },
  { district: "Surat", aliases: ["surat"], population: 6081322, householdsApprox: 1278000, source: "Census of India 2011 — Primary Census Abstract", sourceDate: "2011-01-01", verifyUrl: "https://censusindia.gov.in/census.website/data/population-finder" },
  { district: "Vadodara", aliases: ["vadodara", "baroda"], population: 4165616, householdsApprox: 874000, source: "Census of India 2011 — Primary Census Abstract", sourceDate: "2011-01-01", verifyUrl: "https://censusindia.gov.in/census.website/data/population-finder" },
  { district: "Rajkot", aliases: ["rajkot"], population: 3804558, householdsApprox: 799000, source: "Census of India 2011 — Primary Census Abstract", sourceDate: "2011-01-01", verifyUrl: "https://censusindia.gov.in/census.website/data/population-finder" },
  { district: "Bhavnagar", aliases: ["bhavnagar"], population: 2880496, householdsApprox: 605000, source: "Census of India 2011 — Primary Census Abstract", sourceDate: "2011-01-01", verifyUrl: "https://censusindia.gov.in/census.website/data/population-finder" },
  { district: "Gandhinagar", aliases: ["gandhinagar"], population: 1391753, householdsApprox: 292000, source: "Census of India 2011 — Primary Census Abstract", sourceDate: "2011-01-01", verifyUrl: "https://censusindia.gov.in/census.website/data/population-finder" },
];

export function districtFact(name?: string | null): DistrictFact | null {
  if (!name) return null;
  const q = String(name).trim().toLowerCase();
  if (!q) return null;
  return CENSUS_2011_DISTRICTS.find(d => d.district.toLowerCase() === q || d.aliases.includes(q)) || null;
}

export function listDistrictFacts(): DistrictFact[] {
  return CENSUS_2011_DISTRICTS;
}

/**
 * Evidence label for a cluster — e.g. "Census of India 2011: Vadodara district pop 41,65,616".
 * Returns null when the district is not in the verified set (callers skip instead of guessing).
 */
export function censusEvidenceLabel(districtId?: string | null): string | null {
  const f = districtFact(districtId);
  if (!f) return null;
  return `Census of India 2011 · ${f.district} district pop ${f.population.toLocaleString("en-IN")} (${f.source})`;
}

// ---------------------------------------------------------------- data.gov.in (live, optional API key)

export function isOgdEnabled(): boolean {
  return Boolean(process.env.DATA_GOV_IN_API_KEY);
}

interface CacheEntry { at: number; data: any }
const ogdCache = new Map<string, CacheEntry>();
const OGD_TTL_MS = 10 * 60 * 1000;

/**
 * Fetch a dataset resource from data.gov.in.
 * Resource IDs are listed on each dataset page, e.g.
 *   https://data.gov.in/resource/<resource-id>  → use that UUID here.
 * Returns { ok:false, reason:"no_api_key" } when DATA_GOV_IN_API_KEY is not configured.
 */
export async function fetchOgdResource(resourceId: string, opts?: { limit?: number; filters?: Record<string, string> }): Promise<{ ok: true; data: any; cached: boolean } | { ok: false; reason: "no_api_key" | "upstream_error"; detail?: string }> {
  if (!isOgdEnabled()) return { ok: false, reason: "no_api_key" };
  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 500);
  const params = new URLSearchParams({ "api-key": process.env.DATA_GOV_IN_API_KEY!, format: "json", limit: String(limit) });
  for (const [k, v] of Object.entries(opts?.filters || {})) params.set(k, v);
  const cacheKey = `${resourceId}?${params.toString()}`;
  const hit = ogdCache.get(cacheKey);
  if (hit && Date.now() - hit.at < OGD_TTL_MS) return { ok: true, data: hit.data, cached: true };
  try {
    const ctrl = new AbortController();
    const t = setTimeout(()=> ctrl.abort(), 12000);
    const res = await fetch(`${OGD_BASE}/${encodeURIComponent(resourceId)}?${params.toString()}`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return { ok: false, reason: "upstream_error", detail: `HTTP ${res.status}` };
    const data = await res.json();
    ogdCache.set(cacheKey, { at: Date.now(), data });
    return { ok: true, data, cached: false };
  } catch (e: any) {
    return { ok: false, reason: "upstream_error", detail: e?.message };
  }
}

/** Curated registry of GoI datasets relevant to civic infrastructure. Extend with real resource IDs from data.gov.in. */
export const OGD_DATASETS = [
  {
    id: "pmgsy_rural_roads",
    label: "PMGSY — Rural road works & connectivity (Ministry of Rural Development)",
    theme: "roads",
    note: "Add the dataset's resource UUID on data.gov.in to enable live fetch; otherwise roads evidence falls back to Census + citizen demand.",
  },
  {
    id: "jal_jeevan_mission",
    label: "Jal Jeevan Mission — household tap water connections (Jal Shakti)",
    theme: "water",
    note: "Resource UUID required for live mode.",
  },
  {
    id: "nhm_health",
    label: "National Health Mission — PHC/CHC infrastructure (MoHFW)",
    theme: "healthcare",
    note: "Resource UUID required for live mode.",
  },
] as const;

// ---------------------------------------------------------------- India Post PIN API (live, keyless)

export interface PinLookupResult {
  ok: boolean;
  pin: string;
  district?: string;
  state?: string;
  block?: string;
  offices?: string[];
  source: "India Post PIN Code API (Department of Posts, Government of India)";
  sourceUrl: string;
}

const pinCache = new Map<string, CacheEntry>();

/** Validate a 6-digit PIN against the official India Post directory. Keyless, cached 10 min. */
export async function lookupPin(pinRaw: string): Promise<PinLookupResult> {
  const pin = String(pinRaw).replace(/\D/g, "").slice(0, 6);
  const base: PinLookupResult = { ok: false, pin, source: "India Post PIN Code API (Department of Posts, Government of India)", sourceUrl: `https://api.postalpincode.in/pincode/${pin}` };
  if (!/^[1-9]\d{5}$/.test(pin)) return { ...base, ok: false };

  const hit = pinCache.get(pin);
  if (hit && Date.now() - hit.at < OGD_TTL_MS) {
    const d = hit.data as PinLookupResult;
    return d.ok ? d : { ...base };
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(()=> ctrl.abort(), 10000);
    const res = await fetch(`${PIN_BASE}/${pin}`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return base;
    const arr: any = await res.json();
    const rec = Array.isArray(arr) ? arr[0] : null;
    const offices: any[] = rec?.PostOffice || [];
    if (rec?.Status !== "Success" || !offices.length) return base;
    const first = offices[0];
    const result: PinLookupResult = {
      ...base,
      ok: true,
      district: first.District,
      state: first.State,
      block: first.Block,
      offices: offices.slice(0, 5).map((o: any)=> o.Name),
    };
    pinCache.set(pin, { at: Date.now(), data: result });
    return result;
  } catch {
    return base;
  }
}

// ---------------------------------------------------------------- Source status (for transparency UI)

export function govSourcesStatus() {
  return [
    {
      id: "census_2011",
      label: "Census of India 2011",
      publisher: "Office of the Registrar General & Census Commissioner, MoHA, GoI",
      mode: "bundled_public_domain",
      usedFor: "District population ground truth for priority evidence",
      verifyUrl: GUJARAT_STATE_CENSUS_2011.verifyUrl,
    },
    {
      id: "india_post_pin",
      label: "India Post PIN Code API",
      publisher: "Department of Posts, GoI",
      mode: "live_keyless",
      usedFor: "Citizen location verification (PIN → district)",
      verifyUrl: "https://api.postalpincode.in",
    },
    {
      id: "ogd_platform",
      label: "Open Government Data Platform (data.gov.in)",
      publisher: "National Informatics Centre, MeitY, GoI",
      mode: isOgdEnabled() ? "live_api_key" : "not_configured",
      usedFor: "PMGSY / JJM / NHM scheme datasets (optional live layer)",
      verifyUrl: "https://data.gov.in",
    },
  ];
}
