import { NextRequest, NextResponse } from "next/server";
import { governanceDB } from "@/lib/governanceStore";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const draftId = searchParams.get("draftId");

    if (!draftId) {
      return NextResponse.json({ error: "draftId query parameter is required" }, { status: 400 });
    }

    const comments = await governanceDB.getComments(draftId);
    return NextResponse.json({ comments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let userId = "22222222-2222-2222-2222-222222222222";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const payload = verifyToken(authHeader.split(" ")[1]);
      if (payload) userId = payload.userId;
    }

    const { draftId, comment } = await req.json();

    if (!draftId || !comment) {
      return NextResponse.json({ error: "draftId and comment are required" }, { status: 400 });
    }

    const newComment = await governanceDB.addComment({
      draft_id: draftId,
      reviewer_id: userId,
      comment,
    });

    await governanceDB.logAction({
      organization_id: "a0000000-0000-0000-0000-000000000001",
      user_id: userId,
      action: "COMMENT_ADDED",
      entity_type: "comments",
      entity_id: newComment.id,
      details: { draftId },
    });

    return NextResponse.json({ message: "Comment added successfully", comment: newComment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to add comment" }, { status: 500 });
  }
}

