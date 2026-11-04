import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "inkloom-brand-governance-super-secret-key-2026";

export interface AuthUser {
  userId: string;
  email: string;
  role: "creator" | "brand-manager" | "admin";
  organizationId: string;
}

export type AuthenticatedRequest = Request & {
  user?: AuthUser;
};

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. Bearer token missing." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired JWT token." });
  }
}
