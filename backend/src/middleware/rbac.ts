import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";

/**
 * Role-Based Access Control Middleware
 *creator: Can upload content, edit drafts, view suggestions, submit for review. CANNOT approve or modify guidelines.
 *brand-manager: Can review drafts, approve/reject, edit guidelines, manage rules.
 *admin: Full system control, user management, audit logs, security configuration.
 */
export function requireRole(allowedRoles: ("creator" | "brand-manager" | "admin")[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Role '${req.user.role}' lacks permission for this action. Required: [${allowedRoles.join(", ")}]`,
      });
    }

    next();
  };
}

