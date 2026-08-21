// Firebase client — real when NEXT_PUBLIC_FIREBASE_CONFIG is set, else mock
// Handles Auth, Firestore, Storage, and Firebase AI Logic (Gemini) for citizen intake preview

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
export async function signInWithEmail(email: string, pass: string) {
  if (!auth) return signInAnonymouslyMock();
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  const cred: any = await (signInWithEmailAndPassword as any)(auth, email, pass);
  return cred.user;
}
// Storage helper — real upload when configured, else mock URL
export async function uploadPhoto(file: File): Promise<string> {
  if (storage && firebaseConfig) {
    try {
      const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
      const r = (ref as any)(storage, `citizen_media/${Date.now()}-${file.name}`);
      await (uploadBytes as any)(r, file);
      return await (getDownloadURL as any)(r);
    } catch (e) { console.warn("Storage upload failed, mock URL", e); }
  }
  // fallback mock via backend /api/upload
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/upload`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ filename: file.name, contentType: file.type }) });
    const j: any = await res.json();
    return j.photoUrl || `mock://storage/${file.name}`;
  } catch { return `mock://storage/${file.name}`; }
}
export { app, auth, db, storage };
