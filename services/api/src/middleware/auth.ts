import type { Request, Response, NextFunction } from "express";
import { authAdmin, isFirebaseEnabled } from "../lib/firebaseAdmin.js";

/**
 * Firebase Auth verification — real when Firebase Admin configured, else demo fallback.
 * Backend owns auth validation; frontend never bypasses. Verifies ID token via Admin SDK.
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const demoRole = (req.headers["x-role"] as string) || "citizen";
  const countryId = (req.headers["x-country"] as string) || "IN";

  // Try Firebase ID token verification if Bearer present and Firebase enabled
  if (header.startsWith("Bearer ") && isFirebaseEnabled() && authAdmin) {
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
      console.warn("Firebase ID token verification failed, falling back to demo:", e.message);
    }
  }

  // Demo / header fallback — ONLY when explicitly enabled.
  // Production sets ALLOW_DEMO_AUTH=false (or unsets it): unauthenticated calls are rejected here (#4, #5).
  const demoAllowed = process.env.ALLOW_DEMO_AUTH === "true" || (!process.env.ALLOW_DEMO_AUTH && process.env.NODE_ENV !== "production");
  if (demoAllowed) {
    (req as any).user = {
      uid: header ? "verified-user" : "demo-user",
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
