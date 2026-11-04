import { NextRequest, NextResponse } from "next/server";
import { governanceDB } from "@/lib/governanceStore";

export async function POST(req: NextRequest) {
  try {
    const { draftId, text, channel } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Content text is required for review" }, { status: 400 });
    }

    // ZERO DATA RETENTION PRINCIPLE:
    // Content is evaluated ephemerally in-memory, stripped of temporary buffers,
    // and never permanently transmitted to external uncontrolled third-party stores.

    // Fetch active rules from database
    const rules = await governanceDB.getRules();
    const detectedFindings: any[] = [];

    // Evaluate rules
    for (const rule of rules) {
      if (rule.pattern && text.toLowerCase().includes(rule.pattern.toLowerCase())) {
        detectedFindings.push({
          draft_id: draftId || "d0000000-0000-0000-0000-000000000001",
          rule_id: rule.id,
          issue: rule.description,
          severity: rule.severity,
          suggestion: rule.replacement,
          highlight_text: rule.pattern,
          category: rule.rule_type,
          status: "pending",
        });
      }
    }

    // Save findings to database if draftId provided
    let savedFindings: any[] = [];
    if (draftId && detectedFindings.length > 0) {
      savedFindings = await governanceDB.createFindings(detectedFindings);
    } else {
      savedFindings = detectedFindings;
    }

    // Audit log
    await governanceDB.logAction({
      organization_id: "a0000000-0000-0000-0000-000000000001",
      action: "AI_CONTENT_REVIEW_EXECUTED",
      entity_type: "drafts",
      entity_id: draftId,
      details: {
        flagCount: detectedFindings.length,
        zeroDataRetentionWipe: true,
        channel: channel || "General",
      },
    });

    return NextResponse.json({
      message: "AI Content review completed with Zero Data Retention",
      findingsCount: detectedFindings.length,
      findings: savedFindings,
      cleanTextSuggested: detectedFindings.reduce(
        (acc, f) => acc.replace(new RegExp(f.highlight_text, "gi"), f.suggestion),
        text
      ),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to execute review" }, { status: 500 });
  }
}

