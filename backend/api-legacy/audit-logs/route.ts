import { NextRequest, NextResponse } from "next/server";
import { governanceDB } from "@/lib/governanceStore";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let userRole = "admin";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const payload = verifyToken(authHeader.split(" ")[1]);
      if (payload) {
        userRole = payload.role;
      }
    }

    // RBAC: Only Admin can inspect immutable audit logs
    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Only administrators are authorized to access immutable audit logs." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const logs = await governanceDB.getAuditLogs(limit);
    return NextResponse.json({ logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch audit logs" }, { status: 500 });
  }
}

