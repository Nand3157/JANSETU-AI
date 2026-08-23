import type { Request, Response, NextFunction } from "express";
import { authAdmin, isFirebaseEnabled } from "../lib/firebaseAdmin.js";

/**
 * Firebase Auth verification — real when Firebase Admin configured, else demo fallback.
 * Backend owns auth validation; frontend never bypasses. Verifies ID token via Admin SDK.
 */
const ALLOWED_ROLES = ["citizen", "analyst", "policymaker", "program_manager", "admin", "super_admin"] as const;

// Sanitize x-role: only allow known roles, never trust arbitrary strings
function sanitizeRole(raw: string | undefined): string {
  const r = (raw || "citizen").trim().toLowerCase();
  return (ALLOWED_ROLES as readonly string[]).includes(r) ? r : "citizen";
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const rawRole = req.headers["x-role"] as string | undefined;
  const demoRole = sanitizeRole(rawRole);
  const countryId = (req.headers["x-country"] as string) || "IN";

  // If Bearer token present, MUST verify — never silently fall back to demo on failure (H-08)
  if (header.startsWith("Bearer ")) {
    if (isFirebaseEnabled() && authAdmin) {
      const token = header.slice(7);
      try {
        const decoded: any = await authAdmin.verifyIdToken(token);
        (req as any).user = {
          uid: decoded.uid,
          role: decoded.role || decoded.claims?.role || demoRole,
          email: decoded.email,
          countryId: decoded.countryId || countryId,
          token: decoded,
        };
        return next();
      } catch (e: any) {
        // Bearer was provided but invalid/expired — do NOT fall back to demo, return 401
        // This prevents audit log pollution and token forgery masking (H-08, C-04)
        return res.status(401).json({ error: "unauthorized", hint: "Invalid or expired Firebase ID token", detail: process.env.NODE_ENV !== "production" ? e.message : undefined });
      }
    } else {
      // Bearer sent but Firebase not configured — in prod this is an error; in dev allow but log
      const demoAllowedForBearer = process.env.ALLOW_DEMO_AUTH === "true" || (!process.env.ALLOW_DEMO_AUTH && process.env.NODE_ENV !== "production");
      if (demoAllowedForBearer) {
        // Still warn but allow for local dev without Firebase
        console.warn("Bearer sent but Firebase not configured — using demo identity (dev only)");
        (req as any).user = { uid: "verified-user", role: demoRole, countryId };
        return next();
      }
      return res.status(401).json({ error: "unauthorized", hint: "Firebase not configured for Bearer verification" });
    }
  }

  // No Bearer — demo/header fallback ONLY when explicitly enabled.
  // Production sets ALLOW_DEMO_AUTH=false (or unsets it): unauthenticated calls are rejected here (#4, #5).
  const demoAllowed = process.env.ALLOW_DEMO_AUTH === "true" || (!process.env.ALLOW_DEMO_AUTH && process.env.NODE_ENV !== "production");
  if (demoAllowed) {
    (req as any).user = {
      uid: "demo-user",
      role: demoRole,
      countryId,
    };
    return next();
  }
  return res.status(401).json({ error: "unauthorized", hint: "Send a Firebase ID token via Authorization: Bearer" });
}

export function requireRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: "forbidden", required: roles });
    }
    next();
  };
}
