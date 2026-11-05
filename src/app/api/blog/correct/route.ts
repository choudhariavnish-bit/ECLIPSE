import { NextRequest, NextResponse } from "next/server";

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { original_content, title, brand_id, selected_corrections, analysis_results } = body;

    if (!original_content || original_content.trim().length === 0) {
      return NextResponse.json({ error: "Original content is required for correction." }, { status: 400 });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const response = await fetch(`${AI_ENGINE_URL}/api/v1/blog/correct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original_content,
          title: title || "Untitled Article",
          brand_id: brand_id || "ECLIPSE",
          selected_corrections: selected_corrections || null,
          analysis_results: analysis_results || null,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        const errText = await response.text();
        console.warn("AI Engine /api/v1/blog/correct returned non-200:", response.status, errText);
      }
    } catch (fetchErr: any) {
      console.warn("FastAPI Blog Correct unreachable or timed out:", fetchErr.message);
    }

    // Heuristic fallback correction
    let revised = original_content;
    let appliedCount = 0;
    if (analysis_results?.violations && Array.isArray(analysis_results.violations)) {
      for (const v of analysis_results.violations) {
        if (!selected_corrections || selected_corrections.includes(v.id)) {
          if (v.problematic_text && v.suggestion) {
            const cleanSugg = v.suggestion.replace(/^Replace with:\s*['"]?|['"]?$/g, "").trim();
            const regex = new RegExp(v.problematic_text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
            if (regex.test(revised)) {
              revised = revised.replace(regex, cleanSugg);
              appliedCount++;
            }
          }
        }
      }
    }

    return NextResponse.json({
      status: "success",
      engine: "ECLIPSE (Local Fallback)",
      original_content,
      corrected_content: revised,
      applied_corrections_count: appliedCount,
      summary: `Applied ${appliedCount} corrections via ECLIPSE fallback engine.`,
    });
  } catch (err: any) {
    console.error("Error in /api/blog/correct route:", err);
    return NextResponse.json({ error: err.message || "Failed to correct blog" }, { status: 500 });
  }
}

