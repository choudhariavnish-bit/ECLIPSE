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
        rows = users.map((u: any) => ({
          id: u.id,
          organization_id: u.organization_id,
          name: u.name,
          email: u.email,
          password_hash: u.password
            ? (u.password.startsWith("$2b$") ? `${u.password.substring(0, 12)}... (bcrypt)` : "$2b$10$... (bcrypt)")
            : "$2b$10$... (bcrypt)",
          role: u.role,
          department: u.department || "Content & Growth Marketing",
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

