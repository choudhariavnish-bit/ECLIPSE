import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { governanceDB } from "@/lib/governanceStore";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const user = await governanceDB.findUserByEmail(payload.email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { password: _, ...userSafe } = user;

    // RBAC permissions summary
    const permissions = {
      canUploadContent: true,
      canEditDrafts: true,
      canViewAISuggestions: true,
      canSubmitForReview: true,
      canApproveContent: user.role === "brand-manager" || user.role === "admin",
      canRejectContent: user.role === "brand-manager" || user.role === "admin",
      canModifyGuidelines: user.role === "brand-manager" || user.role === "admin",
      canManageRules: user.role === "brand-manager" || user.role === "admin",
      canManageUsers: user.role === "admin",
      canConfigureSecurity: user.role === "admin",
      canAccessAuditLogs: user.role === "admin",
    };

    return NextResponse.json({
      user: userSafe,
      permissions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Auth error" }, { status: 500 });
  }
}

