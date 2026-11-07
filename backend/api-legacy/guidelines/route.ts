import { NextRequest, NextResponse } from "next/server";
import { governanceDB } from "@/lib/governanceStore";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const guidelines = await governanceDB.getGuidelines();
    return NextResponse.json({ guidelines });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch guidelines" }, { status: 500 });
  }
}

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

    // RBAC check: Creator CANNOT modify or upload guidelines
    if (userRole === "creator") {
      return NextResponse.json(
        { error: "Forbidden: Creators do not have permission to upload or modify guidelines." },
        { status: 403 }
      );
    }

    const { title, content, version = "1.0.0", organizationId } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const orgId = organizationId || "a0000000-0000-0000-0000-000000000001";
    const id = crypto.randomUUID();
    const newGuideline = {
      id,
      organization_id: orgId,
      title,
      content,
      version,
      created_at: new Date().toISOString(),
    };

    const guidelines = await governanceDB.getGuidelines();
    guidelines.unshift(newGuideline);

    await governanceDB.logAction({
      organization_id: orgId,
      user_id: userId,
      action: "GUIDELINE_CREATED",
      entity_type: "guidelines",
      entity_id: id,
      details: { title, version },
    });

    return NextResponse.json({ message: "Brand guidelines uploaded successfully", guideline: newGuideline }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to upload guidelines" }, { status: 500 });
  }
}

