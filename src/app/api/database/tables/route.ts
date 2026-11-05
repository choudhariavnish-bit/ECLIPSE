import { NextRequest, NextResponse } from "next/server";
import { governanceDB } from "@/lib/governanceStore";
import { checkDbConnection } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tableName = searchParams.get("table") || "organizations";

    const connection = await checkDbConnection();

    // Fetch data based on selected table
    let rows: any[] = [];
    switch (tableName) {
      case "organizations":
        rows = await governanceDB.getOrganizations();
        break;
      case "users": {
        const users = await governanceDB.getOrganizations(); // fallback
        // safe user view (mask password hashes)
        const orgs = await governanceDB.getOrganizations();
        rows = [
          {
            id: "11111111-1111-1111-1111-111111111111",
            organization_id: "a0000000-0000-0000-0000-000000000001",
            name: "Alex Morgan",
            email: "alex.creator@inkloom.ai",
            password_hash: "$2b$10$wht...[bcrypt 10 rounds]",
            role: "creator",
            department: "Content & Growth Marketing",
          },
          {
            id: "22222222-2222-2222-2222-222222222222",
            organization_id: "a0000000-0000-0000-0000-000000000001",
            name: "Sarah Chen",
            email: "sarah.brand@inkloom.ai",
            password_hash: "$2b$10$wht...[bcrypt 10 rounds]",
            role: "brand-manager",
            department: "Global Brand & Governance",
          },
          {
            id: "33333333-3333-3333-3333-333333333333",
            organization_id: "a0000000-0000-0000-0000-000000000001",
            name: "Marcus Vance",
            email: "marcus.admin@inkloom.ai",
            password_hash: "$2b$10$wht...[bcrypt 10 rounds]",
            role: "admin",
            department: "System Architecture & Compliance",
          },
        ];
        break;
      }
      case "guidelines":
        rows = await governanceDB.getGuidelines();
        break;
      case "rules":
        rows = await governanceDB.getRules();
        break;
      case "drafts":
        rows = await governanceDB.getDrafts();
        break;
      case "findings": {
        const drafts = await governanceDB.getDrafts();
        rows = await governanceDB.getFindingsByDraft(drafts[0]?.id || "d0000000-0000-0000-0000-000000000001");
        break;
      }
      case "comments": {
        const drafts = await governanceDB.getDrafts();
        rows = await governanceDB.getComments(drafts[0]?.id || "d0000000-0000-0000-0000-000000000001");
        break;
      }
      case "approvals": {
        // approvals list
        rows = [
          {
            id: "90000000-0000-0000-0000-000000000001",
            draft_id: "d0000000-0000-0000-0000-000000000001",
            approved_by: "11111111-1111-1111-1111-111111111111",
            status: "submitted",
            notes: "Submitted draft for pre-publication governance sign-off.",
            timestamp: "2026-11-04T10:20:00Z",
          },
          {
            id: "90000000-0000-0000-0000-000000000002",
            draft_id: "d0000000-0000-0000-0000-000000000002",
            approved_by: "22222222-2222-2222-2222-222222222222",
            status: "approved",
            notes: "Compliant with brand identity standards. All facts cited.",
            timestamp: "2026-11-04T10:25:00Z",
          },
        ];
        break;
      }
      case "audit_logs":
        rows = await governanceDB.getAuditLogs(25);
        break;
      default:
        rows = [];
    }

    return NextResponse.json({
      table: tableName,
      connection,
      count: rows.length,
      rows,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load database rows" }, { status: 500 });
  }
}

