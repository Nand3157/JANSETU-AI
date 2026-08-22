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
const require = createRequire(import.meta.url);

let admin: any = null;
let firestore: any = null;
let storage: any = null;
let authAdmin: any = null;
let isConfigured = false;

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
      const svc = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
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
  console.log("ℹ Firebase Admin init failed — mock mode:", e.message);
}

export { admin, firestore, storage, authAdmin, isConfigured };

export function isFirebaseEnabled() { return isConfigured && !!firestore; }

export function col(name: string) {
  return isFirebaseEnabled() ? firestore.collection(name) : null;
}
