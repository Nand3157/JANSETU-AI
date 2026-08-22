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
  console.log(`✓ UID ${uid} is now "${role}" — log out of the app and back in.`);
  const user = await getAuthFn().getUser(uid);
  console.log(`  (${user.email || "no email"})`);
} catch (e) {
  console.error("✗", e.message);
  process.exit(1);
}
