/**
 * Firebase Admin — real wiring with graceful fallback to mock store
 * In prod: FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS + FIREBASE_PROJECT_ID
 * If not configured, falls back to in-memory store (dev/demo) and logs warning.
 */
import { createRequire } from "module";
const require = createRequire(import.meta.url);

let admin: any = null;
let firestore: any = null;
let storage: any = null;
let isConfigured = false;

try {
  const adm: any = (()=> { try { return require("firebase-admin"); } catch { return null; }})();
  if (adm) {
    admin = adm;
    const hasCreds = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_PROJECT_ID;
    const apps = (admin as any).apps || [];
    if (hasCreds && !apps.length) {
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const svc = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        admin.initializeApp({ credential: admin.credential.cert(svc), storageBucket: process.env.FIREBASE_STORAGE_BUCKET });
      } else {
        admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || "jansetu-demo" });
      }
      isConfigured = true;
      firestore = admin.firestore();
      try { storage = admin.storage(); } catch {}
      console.log("✓ Firebase Admin initialized (project:", process.env.FIREBASE_PROJECT_ID || "jansetu-demo", ")");
    } else if (hasCreds) {
      // already initialized
      isConfigured = true;
      try { firestore = admin.firestore(); } catch {}
      console.log("✓ Firebase Admin already initialized");
    } else {
      console.log("ℹ Firebase Admin not configured — using in-memory mock store. Set FIREBASE_SERVICE_ACCOUNT_JSON to enable Firestore/Storage.");
    }
  } else {
    console.log("ℹ firebase-admin not available — mock mode");
  }
} catch (e: any) {
  console.log("ℹ Firebase Admin init failed — mock mode", e.message);
}

export { admin, firestore, storage, isConfigured };

export function isFirebaseEnabled() { return isConfigured && !!firestore; }

export function col(name: string) {
  return isFirebaseEnabled() ? firestore.collection(name) : null;
}
