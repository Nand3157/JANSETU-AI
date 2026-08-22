// Firebase client — real when NEXT_PUBLIC_FIREBASE_CONFIG is set, else mock
// Handles Auth, Firestore, and role resolution. File storage goes through the backend API (Supabase/Firebase).

import { API as API_BASE } from "./utils";

export const firebaseConfig = (() => {
  try { return JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG || "null"); } catch { return null; }
})();

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

export function isFirebaseConfigured() { return !!firebaseConfig; }

async function init() {
  if (app || !firebaseConfig) return;
  try {
    const { initializeApp } = await import("firebase/app").catch(()=> ({ initializeApp: null })) as any;
    const { getAuth } = await import("firebase/auth").catch(()=> ({ getAuth: null })) as any;
    const { getFirestore } = await import("firebase/firestore").catch(()=> ({ getFirestore: null })) as any;
    const { getStorage } = await import("firebase/storage").catch(()=> ({ getStorage: null })) as any;
    if (!initializeApp) return;
    app = initializeApp(firebaseConfig);
    if (getAuth) auth = getAuth(app);
    if (getFirestore) db = getFirestore(app);
    if (getStorage) storage = getStorage(app);
    console.log("✓ Firebase client initialized");
  } catch (e) { console.warn("Firebase client init failed (mock mode)", e); }
}
if (firebaseConfig) init();

// Mock auth for demo when Firebase not configured — public is unauthenticated, dashboards require login
export type User = { uid: string; displayName?: string; role?: string; email?: string };
let mockUser: User | null = null;
// hydrate from localStorage if available (persists role after login)
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("jansetu_mock_user");
    if (saved) mockUser = JSON.parse(saved);
  } catch {}
}
function persistMock() {
  try { if (mockUser) localStorage.setItem("jansetu_mock_user", JSON.stringify(mockUser)); else localStorage.removeItem("jansetu_mock_user"); } catch {}
}
export function getCurrentUser(): User | null {
  if (auth?.currentUser) {
    const u: any = auth.currentUser;
    return { uid: u.uid, displayName: u.displayName || u.email, role: (u as any).role || "citizen", email: u.email };
  }
  // re-hydrate on call in case localStorage was set after init
  if (!mockUser && typeof window !== "undefined") {
    try { const s = localStorage.getItem("jansetu_mock_user"); if (s) mockUser = JSON.parse(s); } catch {}
  }
  return mockUser;
}
export function setMockRole(role: "citizen" | "government") {
  const r = role === "government" ? "policymaker" : "citizen";
  mockUser = { uid: `mock-${r}-${Math.random().toString(36).slice(2,6)}`, displayName: r==="citizen" ? "Demo Citizen" : "Demo Policymaker", role: r, email: `${r}@jansetu.ai` };
  persistMock();
  return mockUser;
}
export async function signInAnonymouslyMock() {
  if (auth) {
    try {
      const { signInAnonymously } = await import("firebase/auth");
      const cred: any = await (signInAnonymously as any)(auth);
      mockUser = { uid: cred.user.uid, role: "citizen", email: cred.user.email || undefined };
      persistMock();
      return mockUser;
    } catch {}
  }
  mockUser = { uid: "demo-citizen-" + Math.random().toString(36).slice(2,6), role: "citizen" };
  persistMock();
  return mockUser;
}
export async function signOutMock() {
  if (auth) try { const { signOut } = await import("firebase/auth"); await (signOut as any)(auth); } catch {}
  mockUser = null;
  persistMock();
}

// ── Real portal auth — used when NEXT_PUBLIC_FIREBASE_CONFIG is set ─────────
// Passwords never touch our servers; Firebase Auth handles hashing/verification.
// Role is resolved server-authoritatively: custom claim → users/{uid}.doc → citizen.
export async function signInPortal(email: string, pass: string): Promise<{ role: "citizen" | "policymaker"; uid: string }> {
  if (!auth) { setMockRole(email.includes("gov") ? "government" : "citizen"); return { role: getCurrentUser()?.role === "policymaker" ? "policymaker" : "citizen", uid: getCurrentUser()!.uid }; }
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  const cred: any = await (signInWithEmailAndPassword as any)(auth, email.trim(), pass);
  const token = await cred.user.getIdTokenResult();
  let role: string = (token.claims as any)?.role;
  if (!role && db) {
    try {
      const { doc, getDoc } = await import("firebase/firestore");
      const snap: any = await (getDoc as any)((doc as any)(db, "users", cred.user.uid));
      role = snap?.get?.("role") || "citizen";
    } catch { role = "citizen"; }
  }
  const r = role === "policymaker" || role === "analyst" || role === "program_manager" || role === "admin" || role === "super_admin" ? "policymaker" : "citizen";
  mockUser = { uid: cred.user.uid, displayName: cred.user.displayName || cred.user.email, role: r, email: cred.user.email || undefined };
  persistMock();
  return { role: r as any, uid: cred.user.uid };
}

export async function registerPortal(input: { name: string; email: string; mobile: string; language: string; city: string; password: string }): Promise<{ verificationEmailSent: boolean }> {
  if (!auth) { setMockRole("citizen"); return { verificationEmailSent: false }; }
  const { createUserWithEmailAndPassword, sendEmailVerification } = await import("firebase/auth");
  const cred: any = await (createUserWithEmailAndPassword as any)(auth, input.email.trim(), input.password);
  try { await (sendEmailVerification as any)(cred.user); } catch {}
  if (db) {
    try {
      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
      await (setDoc as any)((doc as any)(db, "users", cred.user.uid), {
        displayName: input.name,
        email: input.email,
        mobile: input.mobile,
        preferredLanguage: input.language,
        cityDistrict: input.city,
        role: "citizen",
        identityVerified: false,
        createdAt: (serverTimestamp as any)(),
      });
    } catch (e: any) { console.warn("profile doc failed:", e.message); }
  }
  mockUser = { uid: cred.user.uid, displayName: input.name, role: "citizen", email: input.email };
  persistMock();
  return { verificationEmailSent: true };
}
export async function signInWithEmail(email: string, pass: string) {
  if (!auth) return signInAnonymouslyMock();
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  const cred: any = await (signInWithEmailAndPassword as any)(auth, email, pass);
  return cred.user;
}
// Storage helper — uploads bytes through the backend API (server holds the storage keys).
// API backend priority: Supabase Storage → Firebase Storage → mock URL.
export async function uploadPhoto(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(file);
  });
  try {
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type, dataUrl }),
    });
    const j: any = await res.json();
    if (res.ok && j.photoUrl) return j.photoUrl;
    console.warn("upload rejected:", j?.error || res.status);
  } catch (e: any) { console.warn("upload failed:", e.message); }
  return `mock://storage/${file.name}`;
}
export { app, auth, db, storage };
