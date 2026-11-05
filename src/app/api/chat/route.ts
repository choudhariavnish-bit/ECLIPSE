import { NextRequest, NextResponse } from "next/server";

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const { message, history, channel, document_context, findings_context } = await req.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const res = await fetch(`${AI_ENGINE_URL}/api/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: history || [],
          channel: channel || "general",
          document_context: document_context || null,
          findings_context: findings_context || null,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (engineErr: any) {
      console.warn("ECLIPSE AI Engine chat offline:", engineErr);
    }

    // Fallback response if engine is offline
    return NextResponse.json({
      engine_name: "ECLIPSE",
      powered_by: "Local Fallback",
      reply: `I received your inquiry: "${message}". Please ensure the ECLIPSE AI Engine is running at http://localhost:8000 for live Google Gemini responses. Approved facts: 99.99% uptime SLA, SOC 2 Type II certified, 10,000+ teams. Prohibited terms include 'guaranteed cheapest', '100% bug-free', 'unhackable'.`,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process chat" }, { status: 500 });
  }
}
