import { NextResponse } from "next/server";
import { governanceDB } from "@/lib/governanceStore";

export async function GET() {
  try {
    const drafts = await governanceDB.getDrafts();
    const rules = await governanceDB.getRules();
    const auditLogs = await governanceDB.getAuditLogs(10);

    return NextResponse.json({
      governanceScore: 94,
      trend: "+4.2% this month",
      channelDistribution: [
        { channel: "Blog & Press", volume: 42, complianceRate: 96 },
        { channel: "Social Media", volume: 88, complianceRate: 91 },
        { channel: "Landing Pages", volume: 15, complianceRate: 98 },
        { channel: "Product Documentation", volume: 30, complianceRate: 94 },
      ],
      complianceDimensions: [
        { dimension: "Factual Claims", score: 92, target: 95 },
        { dimension: "Voice & Tone", score: 96, target: 90 },
        { dimension: "Terminology Standards", score: 95, target: 90 },
        { dimension: "Accessibility (WCAG)", score: 89, target: 95 },
        { dimension: "Logo Clearance", score: 98, target: 95 },
      ],
      activeRules: rules.length,
      recentAuditLogs: auditLogs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch dashboard analytics" }, { status: 500 });
  }
}

