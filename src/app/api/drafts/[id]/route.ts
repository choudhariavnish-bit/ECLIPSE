import { NextRequest, NextResponse } from "next/server";
import { governanceDB } from "@/lib/governanceStore";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const draft = await governanceDB.getDraftById(id);
    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
    const findings = await governanceDB.getFindingsByDraft(id);
    const comments = await governanceDB.getComments(id);

    return NextResponse.json({ draft, findings, comments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch draft" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await governanceDB.updateDraft(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    await governanceDB.logAction({
      organization_id: updated.organization_id,
      user_id: updated.user_id,
      action: "DRAFT_UPDATED",
      entity_type: "drafts",
      entity_id: id,
      details: { updates: Object.keys(body) },
    });

    return NextResponse.json({ message: "Draft updated successfully", draft: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update draft" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await governanceDB.deleteDraft(id);
    if (!success) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Draft deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete draft" }, { status: 500 });
  }
}

