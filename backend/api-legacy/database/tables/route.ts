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
        const users = await governanceDB.getUsers();
        rows = users.map((u) => ({
          id: u.id,
          organization_id: u.organization_id,
          name: u.name,
          email: u.email,
          role: u.role,
          department: u.department,
          password_hash: "$2b$10$9VU... [bcrypt 10 rounds]",
          created_at: u.created_at,
        }));
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
        const targetId = drafts[0]?.id || "d0000000-0000-0000-0000-000000000001";
        rows = await governanceDB.getFindingsByDraft(targetId);
        break;
      }
      case "comments": {
        const drafts = await governanceDB.getDrafts();
        const targetId = drafts[0]?.id || "d0000000-0000-0000-0000-000000000001";
        rows = await governanceDB.getComments(targetId);
        break;
      }
      case "approvals": {
        const drafts = await governanceDB.getDrafts();
        const targetId = drafts[0]?.id || "d0000000-0000-0000-0000-000000000001";
        rows = await governanceDB.getApprovalsByDraft(targetId);
        break;
      }
      case "audit_logs":
        rows = await governanceDB.getAuditLogs(50);
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
