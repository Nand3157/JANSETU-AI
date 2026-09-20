/**
 * Firebase Admin — real wiring with graceful fallback to mock store
 * In prod: FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS + FIREBASE_PROJECT_ID
 * If not configured, falls back to in-memory store (dev/demo) and logs warning.
 *
 * firebase-admin v14 compatibility: root package only exports app management;
 * auth/firestore/storage moved to named sub-modules (firebase-admin/auth etc.),
 * and credential.cert flattened to top-level cert. Both shapes are handled here.
 */
import { createRequire } from "module";
import { existsSync } from "fs";
import { dirname, isAbsolute, join } from "path";
import { fileURLToPath } from "url";
const require = createRequire(import.meta.url);

const SERVICE_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", ".."); // services/api
const REPO_ROOT = join(SERVICE_DIR, "..", "..");

let admin: any = null;
let firestore: any = null;
let storage: any = null;
let authAdmin: any = null;
let isConfigured = false;
/** Set the first time Firestore proves it cannot authenticate; disables all writes. */
let disabledReason: string | null = null;

/**
 * `.env` writes GOOGLE_APPLICATION_CREDENTIALS as a relative path
 * (`./service-account.json`) while the file usually sits in `services/api/`.
 * google-auth-library resolves it against the process cwd, failed inside a
 * background Firestore write, and that unhandled rejection killed the whole API
 * milliseconds after boot — every screen then silently fell back to the
 * in-process stub. Resolve the path, or drop the variable so we stay in mock mode.
 */
function resolveCredentialPath(): void {
  const raw = (process.env.GOOGLE_APPLICATION_CREDENTIALS || "").trim();
  if (!raw) return;
  const candidates = isAbsolute(raw)
    ? [raw]
    : [join(process.cwd(), raw), join(SERVICE_DIR, raw), join(REPO_ROOT, raw)];
  const found = candidates.find((c) => existsSync(c));
  if (found) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = found;
    return;
  }
  console.log(`ℹ GOOGLE_APPLICATION_CREDENTIALS "${raw}" was not found (tried ${candidates.length} locations) — using the in-memory store.`);
  delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
}
resolveCredentialPath();

function req(name: string) { try { return require(name); } catch { return null; } }

try {
  const adm: any = req("firebase-admin");
  if (!adm && !adm.default) throw new Error("not installed");

  admin = adm.default ?? adm;
  const certFn = admin.credential?.cert ?? admin.cert;
  if (!certFn) throw new Error("no cert export found");

  const hasCreds = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_PROJECT_ID;
  const apps = admin.apps || [];
  if (hasCreds && !apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      // H-13 fix: validate JSON before parse, give actionable error
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON.trim();
      if (!raw.startsWith("{")) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON must be single-line JSON (not file path). Use GOOGLE_APPLICATION_CREDENTIALS for file path.");
      }
      let svc: any;
      try {
        svc = JSON.parse(raw);
      } catch (e: any) {
        throw new Error(`FIREBASE_SERVICE_ACCOUNT_JSON JSON parse failed: ${e.message} — check for truncated or single-quoted JSON`);
      }
      // Validate required fields
      if (!svc.project_id || !svc.private_key || !svc.client_email) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON missing required fields: project_id, private_key, client_email");
      }
      admin.initializeApp({ credential: certFn(svc), storageBucket: process.env.FIREBASE_STORAGE_BUCKET });
    } else {
      admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || "jansetu-demo" });
    }
    isConfigured = true;
  } else if (hasCreds) {
    isConfigured = true; // already initialized elsewhere
    console.log("✓ Firebase Admin already initialized");
  } else {
    console.log("ℹ Firebase Admin not configured — using in-memory mock store. Set FIREBASE_SERVICE_ACCOUNT_JSON to enable Firestore/Storage.");
  }

  if (isConfigured) {
    const app = admin.apps?.[0];
    // v14 sub-modules, with v12/v13 root-method fallbacks
    const fsMod = req("firebase-admin/firestore");
    firestore = fsMod?.getFirestore ? fsMod.getFirestore(app) : admin.firestore?.();
    const stMod = req("firebase-admin/storage");
    storage = stMod?.getStorage ? stMod.getStorage(app) : admin.storage?.();
    const auMod = req("firebase-admin/auth");
    authAdmin = auMod?.getAuth ? auMod.getAuth(app) : admin.auth?.();
    console.log("✓ Firebase Admin initialized (project:", process.env.FIREBASE_PROJECT_ID || "jansetu-demo", ")");
  }
} catch (e: any) {
  // H-13: warn with actionable message but don't crash
  if (process.env.NODE_ENV === "production") {
    console.error("✗ Firebase Admin init failed in production — check FIREBASE_SERVICE_ACCOUNT_JSON:", e.message);
  } else {
    console.log("ℹ Firebase Admin init failed — mock mode:", e.message);
  }
}

export { admin, firestore, storage, authAdmin, isConfigured };

/**
 * Record an auth-level Firestore failure and stop persisting. Without this a
 * misconfigured deployment keeps retrying (and logging) on every write instead
 * of quietly running on the in-memory store.
 */
export function noteFirestoreFailure(e: any) {
  const msg = String(e?.message || e || "unknown");
  const fatal = /ENOENT|does not exist|invalid_grant|Could not load the default credentials|PERMISSION_DENIED|UNAUTHENTICATED|invalid authentication/i.test(msg);
  if (!fatal || disabledReason) return;
  disabledReason = msg.slice(0, 240);
  console.warn("⚠ Firestore persistence disabled — running on the in-memory store:", disabledReason);
}

export function firebaseStatus() {
  return { configured: isConfigured, persistenceDisabled: !!disabledReason, reason: disabledReason };
}

export function isFirebaseEnabled() { return isConfigured && !!firestore && !disabledReason; }

export function col(name: string) {
  return isFirebaseEnabled() ? firestore.collection(name) : null;
}
