import { NextRequest, NextResponse } from "next/server";
import { governanceDB } from "@/lib/governanceStore";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const drafts = await governanceDB.getDrafts();
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

    const body = await req.json();
    const {
      title,
      content,
      channel = "LinkedIn & B2B Social",
      format = "text",
      brand = "Inkloom AI Enterprises",
      status = "draft",
      author = "Alex Morgan",
    } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const newDraft = await governanceDB.createDraft({
      user_id: currentUserId,
      organization_id: orgId,
      title: title.trim(),
      content: content.trim(),
      channel,
      format,
      brand,
      status,
      author,
    });

    await governanceDB.logAction({
      organization_id: orgId,
      user_id: currentUserId,
      action: "DRAFT_CREATED",
      entity_type: "drafts",
      entity_id: newDraft.id,
      details: { title, channel, brand },
    });

    return NextResponse.json({ message: "Draft created successfully", draft: newDraft }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create draft" }, { status: 500 });
  }
}
