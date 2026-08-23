// Usage: node scripts/set-role.mjs <UID> [role]
// Example: node scripts/set-role.mjs XOdCkx09x2VoQqGssdpndNYSNAS2 policymaker
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const [uid, role = "policymaker"] = process.argv.slice(2);
if (!uid) {
  console.error("Usage: node scripts/set-role.mjs <UID> [role]\nRoles: citizen | analyst | policymaker | program_manager | admin | super_admin");
  process.exit(1);
}

// firebase-admin v12+ may resolve as ESM namespace; v14 moved auth/firestore to sub-modules
let admin = require("firebase-admin");
admin = admin.default ?? admin;
const certFn = admin.credential?.cert ?? admin.cert;
if (!certFn) throw new Error("firebase-admin resolved oddly — reinstall with: npm install");

const sa = require("../services/api/service-account.json");
admin.initializeApp({ credential: certFn(sa) });

const authMod = (()=> { try { return require("firebase-admin/auth"); } catch { return null; }})();
const getAuthFn = authMod?.getAuth ?? admin.auth;
if (!getAuthFn) throw new Error("cannot resolve firebase-admin/auth");

try {
  await getAuthFn().setCustomUserClaims(uid, { role });
  console.log(`✓ UID ${uid} customClaim set to "${role}"`);
  const user = await getAuthFn().getUser(uid);
  console.log(`  (${user.email || "no email"}) claims:`, user.customClaims);
  // Sync Firestore users/{uid} doc so client fallback (and stale-token case) also sees correct role
  try {
    const fsMod = (()=> { try { return require("firebase-admin/firestore"); } catch { return null; }})();
    const getFs = fsMod?.getFirestore ?? admin.firestore;
    const fs = getFs();
    await fs.doc(`users/${uid}`).set({ role, updatedAt: new Date().toISOString() }, { merge: true });
    console.log(`✓ Firestore users/${uid} role synced to "${role}"`);
  } catch (e) {
    console.warn("⚠ Firestore sync failed (non-fatal):", e.message);
  }
  // Revoke refresh tokens so client is forced to get new ID token with fresh claims next sign-in
  try {
    await getAuthFn().revokeRefreshTokens(uid);
    console.log(`  ↻ Refresh tokens revoked — user must re-login to pick up new role (or wait ~1h).`);
  } catch {}
  console.log(`✓ Done — ask user to log out and back in. If still landing in citizen, clear localStorage key "jansetu_mock_user" and reload.`);
} catch (e) {
  console.error("✗", e.message);
  process.exit(1);
}
