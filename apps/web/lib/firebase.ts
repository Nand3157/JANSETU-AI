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
// C-14 fix: validate mock user from localStorage — only allow known roles, sanitize
const ALLOWED_MOCK_ROLES = ["citizen", "policymaker", "analyst", "program_manager", "admin", "super_admin"] as const;
function sanitizeMockUser(raw: any): User | null {
  if (!raw || typeof raw !== "object") return null;
  const role = String(raw.role || "citizen").trim().toLowerCase();
  if (!(ALLOWED_MOCK_ROLES as readonly string[]).includes(role)) return null;
  const uid = String(raw.uid || "").trim().slice(0, 64);
  if (!uid) return null;
  // Basic uid format check — must start with mock- or be firebase-like
  if (!uid.startsWith("mock-") && !uid.startsWith("demo-") && uid.length < 6) return null;
  return { uid, displayName: String(raw.displayName || "").slice(0, 100), role, email: raw.email ? String(raw.email).slice(0, 200) : undefined };
}

export type User = { uid: string; displayName?: string; role?: string; email?: string };
let mockUser: User | null = null;
// hydrate from localStorage if available (persists role after login)
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("jansetu_mock_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      const sanitized = sanitizeMockUser(parsed);
      if (sanitized) mockUser = sanitized;
      else localStorage.removeItem("jansetu_mock_user");
    }
  } catch {}
}
function persistMock() {
  try { if (mockUser) localStorage.setItem("jansetu_mock_user", JSON.stringify(mockUser)); else localStorage.removeItem("jansetu_mock_user"); } catch {}
}
export function getCurrentUser(): User | null {
  // Re-hydrate mockUser from localStorage if needed — always validate
  if (!mockUser && typeof window !== "undefined") {
    try {
      const s = localStorage.getItem("jansetu_mock_user");
      if (s) {
        const parsed = JSON.parse(s);
        const sanitized = sanitizeMockUser(parsed);
        if (sanitized) mockUser = sanitized;
        else localStorage.removeItem("jansetu_mock_user");
      }
    } catch {}
  }
  if (auth?.currentUser) {
    const u: any = auth.currentUser;
    // FIX: govt UID XOdCkx09x2VoQqGssdpndNYSNAS2 was landing in citizen because
    // this returned (u as any).role || "citizen" — Firebase Auth user has no ".role".
    // Honor the server-authoritative role cached in mockUser/localStorage when uid matches.
    if (mockUser && mockUser.uid === u.uid && mockUser.role) {
      return { uid: u.uid, displayName: u.displayName || mockUser.displayName || u.email, role: mockUser.role, email: u.email || mockUser.email };
    }
    if (typeof window !== "undefined") {
      try {
        const s = localStorage.getItem("jansetu_mock_user");
        if (s) {
          const parsed = JSON.parse(s);
          const sanitized = sanitizeMockUser(parsed);
          if (sanitized && sanitized.uid === u.uid) {
            mockUser = sanitized;
            return { uid: u.uid, displayName: u.displayName || sanitized.displayName || u.email, role: sanitized.role, email: u.email || sanitized.email };
          }
        }
      } catch {}
    }
    return { uid: u.uid, displayName: u.displayName || u.email, role: (u as any).role || "citizen", email: u.email };
  }
  return mockUser;
}

// Async helper: resolves role server-authoritatively via fresh ID token + Firestore doc.
// Use in layouts when getCurrentUser() returns stale "citizen" but user may be govt.
export async function getVerifiedUser(): Promise<User | null> {
  if (auth?.currentUser && db) {
    const u: any = auth.currentUser;
    try {
      // Force refresh to pick up custom claims set via Admin SDK (set-role.mjs)
      let token: any = null;
      try { token = await u.getIdTokenResult(true); } catch { token = await u.getIdTokenResult().catch(()=>null); }
      let role: string | undefined = (token?.claims as any)?.role;
      // If claim missing or still citizen, check Firestore doc (covers stale-token + doc-only roles)
      if ((!role || role === "citizen") && db) {
        try {
          const { doc, getDoc } = await import("firebase/firestore");
          const snap: any = await (getDoc as any)((doc as any)(db, "users", u.uid));
          const docRole = snap?.get?.("role");
          if (docRole) role = docRole;
        } catch {}
      }
      if (!role) role = "citizen";
      const allowed = ALLOWED_MOCK_ROLES as readonly string[];
      const finalRole = allowed.includes(role) ? role : "citizen";
      // Map gov group to policymaker for legacy callers, but preserve original for layouts
      // We store original role so GovLayout can distinguish policymaker/analyst etc.
      const user: User = { uid: u.uid, displayName: u.displayName || u.email, role: finalRole, email: u.email };
      // Sync cache so sync getCurrentUser() is correct next time
      mockUser = user;
      persistMock();
      (u as any).role = finalRole;
      return user;
    } catch {}
  }
  return getCurrentUser();
}
export function setMockRole(role: "citizen" | "government") {
  const r = role === "government" ? "policymaker" : "citizen";
  mockUser = { uid: `mock-${r}-${Math.random().toString(36).slice(2,6)}`, displayName: r==="citizen" ? "Demo Citizen" : "Demo Policymaker", role: r, email: `${r}@jansetu.ai` };
  persistMock();
  return mockUser;
}
// Helper to get Firebase ID token when configured (for apiWithToken)
export async function getIdToken(): Promise<string | null> {
  if (auth?.currentUser) {
    try { return await auth.currentUser.getIdToken(); } catch { return null; }
  }
  return null;
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
// FIX: gov UID XOdCkx09x2VoQqGssdpndNYSNAS2 was stuck as citizen due to stale token + getCurrentUser ignoring mockUser.
// Now: force token refresh, merge Firestore doc (doc can upgrade stale citizen→gov), and persist precise role.
export async function signInPortal(email: string, pass: string): Promise<{ role: "citizen" | "policymaker"; uid: string }> {
  if (!auth) { setMockRole(email.includes("gov") ? "government" : "citizen"); return { role: getCurrentUser()?.role === "policymaker" ? "policymaker" : "citizen", uid: getCurrentUser()!.uid }; }
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  const cred: any = await (signInWithEmailAndPassword as any)(auth, email.trim(), pass);
  // Force token refresh so customClaims set via set-role.mjs are visible immediately
  let token: any = null;
  try { await cred.user.getIdToken(true); token = await cred.user.getIdTokenResult(true); } catch { try { token = await cred.user.getIdTokenResult(); } catch {} }
  let role: string | undefined = (token?.claims as any)?.role;
  // If claim missing or stale citizen, check Firestore doc — doc is synced by set-role.mjs
  if ((!role || role === "citizen") && db) {
    try {
      const { doc, getDoc } = await import("firebase/firestore");
      const snap: any = await (getDoc as any)((doc as any)(db, "users", cred.user.uid));
      const docRole = snap?.get?.("role");
      if (docRole) role = docRole;
    } catch {}
  }
  if (!role) role = "citizen";
  const allowed = ALLOWED_MOCK_ROLES as readonly string[];
  const finalRole = allowed.includes(role) ? role : "citizen";
  const isGov = ["policymaker","analyst","program_manager","admin","super_admin"].includes(finalRole);
  const r = isGov ? "policymaker" : "citizen";
  // Persist precise role so getCurrentUser() returns correct value (was ignoring mockUser before)
  mockUser = { uid: cred.user.uid, displayName: cred.user.displayName || cred.user.email, role: finalRole as any, email: cred.user.email || undefined };
  try { (cred.user as any).role = finalRole; } catch {}
  try { (auth.currentUser as any).role = finalRole; } catch {}
  persistMock();
  return { role: r as any, uid: cred.user.uid };
}

// ── Google OAuth — real popup/redirect, with mock fallback ─────────
export async function signInWithGoogle(): Promise<{ role: "citizen" | "policymaker"; uid: string }> {
  // Mock mode when Firebase not configured
  if (!auth || !firebaseConfig) {
    setMockRole("citizen");
    return { role: "citizen", uid: getCurrentUser()!.uid };
  }
  try {
    const { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } = await import("firebase/auth");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    // Try to consume any pending redirect result first (handles redirect flow)
    try {
      const redirectRes: any = await (getRedirectResult as any)(auth).catch(() => null);
      if (redirectRes?.user) {
        const u = redirectRes.user;
        let token: any = null;
        try { await u.getIdToken(true); token = await u.getIdTokenResult(true); } catch { token = await u.getIdTokenResult().catch(() => null); }
        let role: string | undefined = token?.claims?.role;
        if ((!role || role === "citizen") && db) {
          try {
            const { doc, getDoc } = await import("firebase/firestore");
            const snap: any = await (getDoc as any)((doc as any)(db, "users", u.uid));
            if (!snap?.exists?.()) {
              try {
                const { doc: doc2, setDoc, serverTimestamp } = await import("firebase/firestore");
                await (setDoc as any)((doc2 as any)(db, "users", u.uid), {
                  displayName: u.displayName || u.email,
                  email: u.email,
                  photoURL: u.photoURL || null,
                  role: "citizen",
                  provider: "google",
                  identityVerified: u.emailVerified || false,
                  createdAt: (serverTimestamp as any)(),
                });
              } catch {}
              role = "citizen";
            } else {
              const docRole = snap?.get?.("role");
              if (docRole) role = docRole;
              else role = role || "citizen";
            }
          } catch { role = role || "citizen"; }
        }
        if (!role) role = "citizen";
        const allowed = ALLOWED_MOCK_ROLES as readonly string[];
        const finalRole = allowed.includes(role) ? role : "citizen";
        const isGov = ["policymaker","analyst","program_manager","admin","super_admin"].includes(finalRole);
        const r = isGov ? "policymaker" : "citizen";
        mockUser = { uid: u.uid, displayName: u.displayName || u.email, role: finalRole as any, email: u.email || undefined };
        try { (u as any).role = finalRole; } catch {}
        persistMock();
        return { role: r as any, uid: u.uid };
      }
    } catch {}
    let cred: any;
    try {
      cred = await (signInWithPopup as any)(auth, provider);
    } catch (e: any) {
      const code = String(e?.code || "");
      if (code.includes("popup-blocked") || code.includes("popup-closed") || code.includes("cancelled-popup-request") || code.includes("popup-closed-by-user")) {
        await (signInWithRedirect as any)(auth, provider);
        const redirectErr: any = new Error("redirecting");
        redirectErr.code = "redirecting";
        throw redirectErr;
      }
      throw e;
    }
    const u = cred.user;
    let role: string | undefined;
    try {
      let t: any = null;
      try { await u.getIdToken(true); t = await u.getIdTokenResult(true); } catch { t = await u.getIdTokenResult().catch(()=>null); }
      role = (t?.claims as any)?.role;
    } catch {}
    if ((!role || role === "citizen") && db) {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const snap: any = await (getDoc as any)((doc as any)(db, "users", u.uid));
        if (!snap?.exists?.()) {
          try {
            const { doc: doc2, setDoc, serverTimestamp } = await import("firebase/firestore");
            await (setDoc as any)((doc2 as any)(db, "users", u.uid), {
              displayName: u.displayName || u.email,
              email: u.email,
              photoURL: u.photoURL || null,
              role: "citizen",
              provider: "google",
              identityVerified: u.emailVerified || false,
              createdAt: (serverTimestamp as any)(),
            });
          } catch {}
          role = "citizen";
        } else {
          const docRole = snap?.get?.("role");
          if (docRole) role = docRole;
        }
      } catch { role = role || "citizen"; }
    }
    if (!role) role = "citizen";
    const allowed2 = ALLOWED_MOCK_ROLES as readonly string[];
    const finalRole2 = allowed2.includes(role) ? role : "citizen";
    const isGov2 = ["policymaker","analyst","program_manager","admin","super_admin"].includes(finalRole2);
    const r2 = isGov2 ? "policymaker" : "citizen";
    mockUser = { uid: u.uid, displayName: u.displayName || u.email || u.email, role: finalRole2 as any, email: u.email || undefined };
    try { (u as any).role = finalRole2; } catch {}
    persistMock();
    return { role: r2 as any, uid: u.uid };
  } catch (e: any) {
    if (e?.code === "redirecting") throw e;
    throw e;
  }
}

// Call this on app mount to finish a redirect flow (e.g., in LoginClient useEffect)
export async function consumeGoogleRedirect(): Promise<{ role: "citizen" | "policymaker"; uid: string } | null> {
  if (!auth || !firebaseConfig) return null;
  try {
    const { getRedirectResult } = await import("firebase/auth");
    const res: any = await (getRedirectResult as any)(auth);
    if (!res?.user) return null;
    const u = res.user;
    let role: string = "citizen";
    try {
      let t: any = null;
      try { await u.getIdToken(true); t = await u.getIdTokenResult(true); } catch { t = await u.getIdTokenResult().catch(()=>null); }
      role = (t?.claims as any)?.role || role;
    } catch {}
    if ((!role || role === "citizen") && db) {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const snap: any = await (getDoc as any)((doc as any)(db, "users", u.uid));
        if (snap?.exists?.()) {
          const docRole = snap?.get?.("role");
          if (docRole) role = docRole;
        }
      } catch {}
    }
    const allowed = ALLOWED_MOCK_ROLES as readonly string[];
    const finalRole = allowed.includes(role) ? role : "citizen";
    const isGov = ["policymaker","analyst","program_manager","admin","super_admin"].includes(finalRole);
    const r = isGov ? "policymaker" : "citizen";
    mockUser = { uid: u.uid, displayName: u.displayName || u.email, role: finalRole as any, email: u.email || undefined };
    try { (u as any).role = finalRole; } catch {}
    persistMock();
    return { role: r as any, uid: u.uid };
  } catch { return null; }
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
    if (res.ok && (j.photoUrl || j.url)) return j.photoUrl || j.url;
    console.warn("upload rejected:", j?.error || res.status);
  } catch (e: any) { console.warn("upload failed:", e.message); }
  return `https://storage.googleapis.com/jansetu-demo-citizen-media/local/${encodeURIComponent(file.name)}`;
}
export { app, auth, db, storage };
