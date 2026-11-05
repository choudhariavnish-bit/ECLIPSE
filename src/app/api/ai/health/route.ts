import { NextResponse } from "next/server";

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${AI_ENGINE_URL}/api/v1/health`, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        connected: true,
        engine: data.engine || "ECLIPSE",
        title: data.title,
        powered_by: data.powered_by || "Google Gemini",
        model: data.model || "gemini-3.5-flash-lite",
        live_gemini_active: data.live_gemini_active ?? true,
        version: data.version || "2.0.0",
        endpoint: AI_ENGINE_URL,
      });
    }
  } catch (err: any) {
    // Engine offline or unreachable
  }

  return NextResponse.json({
    connected: false,
    engine: "ECLIPSE",
    title: "AI Governance Engine",
    powered_by: "Local Rulebook Mode",
    model: "deterministic-parser",
    live_gemini_active: false,
    version: "2.0.0",
    endpoint: AI_ENGINE_URL,
    message: "AI Engine offline. Start with python run_eclipse.py",
  });
}
