import { NextRequest, NextResponse } from "next/server";
import { governanceDB } from "@/lib/governanceStore";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let userId: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const payload = verifyToken(authHeader.split(" ")[1]);
      if (payload && payload.role === "creator") {
        userId = payload.userId;
      }
    }

    const drafts = await governanceDB.getDrafts(userId);
    return NextResponse.json({ drafts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch drafts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let currentUserId = "11111111-1111-1111-1111-111111111111"; // Fallback demo creator
    let orgId = "a0000000-0000-0000-0000-000000000001";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const payload = verifyToken(authHeader.split(" ")[1]);
      if (payload) {
        currentUserId = payload.userId;
        orgId = payload.organizationId;
      }
    }

    const { title, content, channel = "Blog & Press", format = "Rich Article" } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const newDraft = await governanceDB.createDraft({
      user_id: currentUserId,
      organization_id: orgId,
      title,
      content,
      channel,
      format,
      status: "draft",
    });

    await governanceDB.logAction({
      organization_id: orgId,
      user_id: currentUserId,
      action: "DRAFT_CREATED",
      entity_type: "drafts",
      entity_id: newDraft.id,
      details: { title, channel },
    });

    return NextResponse.json({ message: "Draft created successfully", draft: newDraft }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create draft" }, { status: 500 });
  }
}

