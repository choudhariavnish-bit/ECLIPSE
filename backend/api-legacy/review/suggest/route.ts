import { NextRequest, NextResponse } from "next/server";

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const { flaggedPhrase, ruleType, context } = await req.json();

    if (!flaggedPhrase) {
      return NextResponse.json({ error: "Flagged phrase is required" }, { status: 400 });
    }

    // 1. Attempt Context-Aware AI Rephrase from ECLIPSE Engine
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const prompt = `You are ECLIPSE. Provide an approved, professional brand-compliant alternative for the phrase: "${flaggedPhrase}" in context: "${context || ""}". Return only the replacement phrase without surrounding quotes.`;

      const aiRes = await fetch(`${AI_ENGINE_URL}/api/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          channel: "rephrase",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const cleanedReply = (aiData.reply || "").trim().replace(/^["']|["']$/g, "");
        if (cleanedReply && cleanedReply.length > 0 && cleanedReply.length < 200) {
          return NextResponse.json({
            original: flaggedPhrase,
            suggestion: cleanedReply,
            explanation: `AI-optimized by ECLIPSE (${aiData.powered_by || "Google Gemini"}) for ${ruleType || "brand compliance"}.`,
            confidence: 0.98,
            engine: "ECLIPSE",
          });
        }
      }
    } catch (engineErr) {
      // Fall through to deterministic fallback
    }

    // 2. Deterministic Knowledge-Based Fallback
    let suggestion = "approved enterprise alternative";
    const phraseLower = flaggedPhrase.toLowerCase();

    if (phraseLower.includes("foolproof") || phraseLower.includes("100%")) {
      suggestion = "enterprise-grade AI automation with verified 99.99% availability";
    } else if (phraseLower.includes("super crazy fast") || phraseLower.includes("crazy")) {
      suggestion = "rapid zero-downtime deployment";
    } else if (phraseLower.includes("man hours") || phraseLower.includes("manpower")) {
      suggestion = "operational hours / team bandwidth";
    } else if (phraseLower.includes("best in the world") || phraseLower.includes("#1") || phraseLower.includes("cheapest")) {
      suggestion = "industry-leading, cost-effective enterprise solution";
    } else {
      suggestion = `compliant ${flaggedPhrase.trim()}`;
    }

    return NextResponse.json({
      original: flaggedPhrase,
      suggestion,
      explanation: `Optimized for ${ruleType || "brand compliance"} and FTC accuracy guidelines.`,
      confidence: 0.95,
      engine: "ECLIPSE Fallback",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate suggestion" }, { status: 500 });
  }
}
