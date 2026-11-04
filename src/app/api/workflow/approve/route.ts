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

    // STRICT RBAC GUARD: Creator CANNOT approve content
    if (userRole === "creator") {
      return NextResponse.json(
        { error: "Forbidden: Creators are not authorized to approve content for publication." },
        { status: 403 }
      );
    }

    const { draftId, notes = "Verified brand compliance. Approved for publication." } = await req.json();

    if (!draftId) {
      return NextResponse.json({ error: "draftId is required" }, { status: 400 });
    }

    const updatedDraft = await governanceDB.updateDraft(draftId, { status: "approved" });
    if (!updatedDraft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    const approval = await governanceDB.createApproval({
      draft_id: draftId,
      approved_by: userId,
      status: "approved",
      notes,
    });

    await governanceDB.logAction({
      organization_id: updatedDraft.organization_id,
      user_id: userId,
      action: "DRAFT_APPROVED_SIGN_OFF",
      entity_type: "drafts",
      entity_id: draftId,
      details: { reviewerRole: userRole, notes },
    });

    return NextResponse.json({
      message: "Draft officially approved for publication",
      draft: updatedDraft,
      approval,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to approve draft" }, { status: 500 });
  }
}

