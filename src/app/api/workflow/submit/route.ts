import { NextRequest, NextResponse } from "next/server";
import { governanceDB } from "@/lib/governanceStore";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let userId = "11111111-1111-1111-1111-111111111111";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const payload = verifyToken(authHeader.split(" ")[1]);
      if (payload) userId = payload.userId;
    }

    const { draftId, notes } = await req.json();

    if (!draftId) {
      return NextResponse.json({ error: "draftId is required" }, { status: 400 });
    }

    const updatedDraft = await governanceDB.updateDraft(draftId, { status: "review_pending" });
    if (!updatedDraft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    const approvalRecord = await governanceDB.createApproval({
      draft_id: draftId,
      approved_by: userId,
      status: "submitted",
      notes: notes || "Submitted for brand governance review",
    });

    await governanceDB.logAction({
      organization_id: updatedDraft.organization_id,
      user_id: userId,
      action: "DRAFT_SUBMITTED_FOR_REVIEW",
      entity_type: "drafts",
      entity_id: draftId,
      details: { status: "review_pending", notes },
    });

    return NextResponse.json({
      message: "Draft submitted for brand review successfully",
      draft: updatedDraft,
      approval: approvalRecord,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to submit draft" }, { status: 500 });
  }
}

