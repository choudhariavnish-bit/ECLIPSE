import { NextRequest, NextResponse } from "next/server";
import { governanceDB } from "@/lib/governanceStore";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let userRole = "brand-manager";
    let userId = "22222222-2222-2222-2222-222222222222";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const payload = verifyToken(authHeader.split(" ")[1]);
      if (payload) {
        userRole = payload.role;
        userId = payload.userId;
      }
    }

    // RBAC: Creator cannot reject/issue changes
    if (userRole === "creator") {
      return NextResponse.json(
        { error: "Forbidden: Creators cannot issue editorial rejections." },
        { status: 403 }
      );
    }

    const { draftId, notes = "Revisions required to meet brand tone guidelines.", action = "changes_requested" } = await req.json();

    if (!draftId) {
      return NextResponse.json({ error: "draftId is required" }, { status: 400 });
    }

    const newStatus = action === "reject" ? "rejected" : "changes_requested";

    const updatedDraft = await governanceDB.updateDraft(draftId, { status: newStatus });
    if (!updatedDraft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    const approval = await governanceDB.createApproval({
      draft_id: draftId,
      approved_by: userId,
      status: newStatus,
      notes,
    });

    await governanceDB.logAction({
      organization_id: updatedDraft.organization_id,
      user_id: userId,
      action: newStatus === "rejected" ? "DRAFT_REJECTED" : "DRAFT_CHANGES_REQUESTED",
      entity_type: "drafts",
      entity_id: draftId,
      details: { reviewerRole: userRole, notes },
    });

    return NextResponse.json({
      message: `Draft updated to ${newStatus}`,
      draft: updatedDraft,
      approval,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update draft workflow" }, { status: 500 });
  }
}

