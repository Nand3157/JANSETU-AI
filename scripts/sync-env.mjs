// Copies the single root .env into the two places the toolchains actually read:
//   apps/web/.env.local      (Next.js)
//   services/api/.env        (Express API)
import { readFileSync, writeFileSync } from "fs";

const root = new URL("../.env", import.meta.url);
let text;
try {
  text = readFileSync(root, "utf8");
} catch {
  console.error("✗ No root .env found — copy .env.example to .env first.");
  process.exit(1);
}

writeFileSync(new URL("../apps/web/.env.local", import.meta.url), text);
writeFileSync(new URL("../services/api/.env", import.meta.url), text);
console.log("✓ Synced root .env → apps/web/.env.local + services/api/.env");
