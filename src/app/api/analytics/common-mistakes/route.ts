import { NextResponse } from "next/server";

export async function GET() {
  try {
    const commonMistakes = [
      {
        rank: 1,
        rule: "Prohibited Superlative Claims",
        category: "Claim Compliance",
        occurrences: 48,
        commonExamples: ["100% foolproof", "guaranteed #1 in class"],
        recommendedFix: "Replace with verified SLAs or qualified benchmark stats",
        riskLevel: "Critical",
      },
      {
        rank: 2,
        rule: "Informal Hyperbole & Slang",
        category: "Tone Matrix",
        occurrences: 34,
        commonExamples: ["super crazy fast", "totally killer feature"],
        recommendedFix: "Switch to authoritative enterprise language (e.g. 'rapid zero-downtime')",
        riskLevel: "Warning",
      },
      {
        rank: 3,
        rule: "Non-Inclusive Terminology",
        category: "Terminology",
        occurrences: 19,
        commonExamples: ["man hours", "master/slave architecture"],
        recommendedFix: "Adopt team hours and primary/secondary terminology",
        riskLevel: "Warning",
      },
      {
        rank: 4,
        rule: "WCAG AA Color Contrast Below 4.5:1",
        category: "Accessibility",
        occurrences: 14,
        commonExamples: ["light grey text on white background"],
        recommendedFix: "Enforce Slate-900 or minimum contrast token",
        riskLevel: "Critical",
      },
    ];

    return NextResponse.json({ commonMistakes });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch common mistakes" }, { status: 500 });
  }
}

