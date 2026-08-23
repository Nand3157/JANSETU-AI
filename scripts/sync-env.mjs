// Copies the single root .env into the two places the toolchains actually read:
//   apps/web/.env.local      (Next.js) — ONLY NEXT_PUBLIC_* safe for browser
//   services/api/.env        (Express API) — SERVER-ONLY secrets
// FIX: C-03 — never leak GEMINI_API_KEY / SUPABASE_SERVICE_ROLE_KEY to browser build
import { readFileSync, writeFileSync } from "fs";

const root = new URL("../.env", import.meta.url);
let text;
try {
  text = readFileSync(root, "utf8");
} catch {
  console.error("✗ No root .env found — copy .env.example to .env first.");
  process.exit(1);
}

// Split by prefix: NEXT_PUBLIC_* goes to web, rest stays server-only
const lines = text.split(/\r?\n/);
const webLines = [];
const apiLines = [];
const serverOnlyPrefixes = [
  "GEMINI_API_KEY",
  "GEMINI_MODEL",
  "GEMINI_DAILY_CAP",
  "GEMINI_MAX_OUTPUT_TOKENS",
  "FIREBASE_SERVICE_ACCOUNT_JSON",
  "GOOGLE_APPLICATION_CREDENTIALS",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_STORAGE_BUCKET",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_STORAGE_BUCKET",
  "SUPABASE_SIGNED_READ_SECONDS",
  "ALLOW_DEMO_AUTH",
  "CORS_ORIGINS",
  "RATE_MAX_GENERAL",
  "RATE_MAX_AI",
  "RATE_WINDOW_MS",
  "MAX_BODY_BYTES",
  "MAX_UPLOAD_BYTES",
  "SHOW_ERRORS",
  "SKIP_SEED",
  "PORT",
  "NODE_ENV",
];

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    webLines.push(line);
    apiLines.push(line);
    continue;
  }
  const key = trimmed.split("=")[0].trim();
  const isServerOnly = serverOnlyPrefixes.includes(key);
  const isPublic = key.startsWith("NEXT_PUBLIC_");
  if (isPublic) webLines.push(line);
  if (!isPublic) apiLines.push(line);
  // Shared: NEXT_PUBLIC_API_URL is needed by both but safe; ensure api also gets it
  if (key === "NEXT_PUBLIC_API_URL") {
    if (!apiLines.includes(line)) apiLines.push(line);
  }
  // Guard: if someone accidentally adds NEXT_PUBLIC_GEMINI, block it
  if (key.startsWith("NEXT_PUBLIC_GEMINI") || key.startsWith("NEXT_PUBLIC_SUPABASE")) {
    console.error(`✗ SECURITY: ${key} must never be NEXT_PUBLIC_ — refusing to sync to web.`);
    process.exit(1);
  }
}

const webText = webLines.join("\n");
const apiText = apiLines.join("\n");

// Safety check: ensure webText does NOT contain server secrets
const leakCheck = ["GEMINI_API_KEY", "SUPABASE_SERVICE_ROLE_KEY", "FIREBASE_SERVICE_ACCOUNT_JSON", "GOOGLE_APPLICATION_CREDENTIALS"];
for (const secret of leakCheck) {
  if (webText.includes(secret + "=") && webText.match(new RegExp(`^${secret}=.+`, "m"))?.[0]?.split("=")[1]?.trim()) {
    // only fail if value is non-empty
    const val = webText.match(new RegExp(`^${secret}=(.*)`, "m"))?.[1]?.trim();
    if (val) {
      console.error(`✗ SECURITY: ${secret} would leak to web build — check .env partitioning.`);
      process.exit(1);
    }
  }
}

writeFileSync(new URL("../apps/web/.env.local", import.meta.url), webText);
writeFileSync(new URL("../services/api/.env", import.meta.url), apiText);
console.log("✓ Synced root .env → apps/web/.env.local (NEXT_PUBLIC_* only) + services/api/.env (server-only)");

// Verify no leak
if (webText.includes("GEMINI_API_KEY=") && webText.match(/GEMINI_API_KEY=.+/)) {
  const hasValue = webText.split("\n").some(l => l.startsWith("GEMINI_API_KEY=") && l.split("=")[1].trim().length > 0);
  if (hasValue) {
    console.error("✗ Web env leak detected — aborting");
    process.exit(1);
  }
}
