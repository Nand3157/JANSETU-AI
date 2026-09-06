/**
 * Env bootstrap — MUST be the first import in src/index.ts.
 *
 * Loads `services/api/.env` (written by `scripts/sync-env.mjs` from the root
 * `.env`) before any other module reads `process.env`. Route modules such as
 * the upload route capture the Supabase and Gemini keys at import time, so
 * without this the configured keys sat unused and every backend silently
 * fell back to mocks — even with a fully populated `.env` file.
 *
 * Missing file is fine (Cloud Run / Vercel inject env directly); existing
 * process env is never overridden.
 */
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const here = dirname(fileURLToPath(import.meta.url));
// src/lib/env.ts -> up two levels -> services/api/.env
dotenv.config({ path: join(here, "..", "..", ".env") });
