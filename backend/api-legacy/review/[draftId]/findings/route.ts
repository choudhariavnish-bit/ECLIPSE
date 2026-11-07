import { NextRequest, NextResponse } from "next/server";
import { governanceDB } from "@/lib/governanceStore";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  try {
    const { draftId } = await params;
    const findings = await governanceDB.getFindingsByDraft(draftId);
    return NextResponse.json({ draftId, findings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to retrieve findings" }, { status: 500 });
  }
}

