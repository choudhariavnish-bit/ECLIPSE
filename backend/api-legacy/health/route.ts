import { NextResponse } from "next/server";
import { checkDbConnection } from "@/lib/db";

export async function GET() {
  const dbStatus = await checkDbConnection();
  return NextResponse.json({
    status: "online",
    timestamp: new Date().toISOString(),
    service: "Inkloom AI Brand Governance Backend",
    database: dbStatus,
    security: {
      zeroDataRetention: "enabled",
      jwtAuthentication: "active",
      bcryptHashing: "enabled (cost 10)",
      rbacGuard: "enforced",
    },
  });
}

