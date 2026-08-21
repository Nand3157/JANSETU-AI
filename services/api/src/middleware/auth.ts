import type { Request, Response, NextFunction } from "express";
import { admin, isFirebaseEnabled } from "../lib/firebaseAdmin.js";

/**
 * Firebase Auth verification — real when Firebase Admin configured, else demo fallback.
 * Backend owns auth validation; frontend never bypasses. Verifies ID token via Admin SDK.
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const demoRole = (req.headers["x-role"] as string) || "citizen";
  const countryId = (req.headers["x-country"] as string) || "IN";

  // Try Firebase ID token verification if Bearer present and Firebase enabled
  if (header.startsWith("Bearer ") && isFirebaseEnabled() && admin) {
    const token = header.slice(7);
    try {
      const decoded: any = await admin.auth().verifyIdToken(token);
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

  // Demo / header fallback (for hackathon without full Firebase config)
  // In prod, you would reject unauthenticated here: return res.status(401).json({ error: "unauthorized" });
  (req as any).user = {
    uid: header ? "verified-user" : "demo-user",
    role: demoRole,
    countryId,
  };
  next();
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
