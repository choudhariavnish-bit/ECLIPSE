import { NextRequest, NextResponse } from "next/server";
import { governanceDB } from "@/lib/governanceStore";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const rules = await governanceDB.getRules();
    return NextResponse.json({ rules });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch rules" }, { status: 500 });
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

    // RBAC: Creator cannot manage rules
    if (userRole === "creator") {
      return NextResponse.json(
        { error: "Forbidden: Creators cannot create or edit governance rules." },
        { status: 403 }
      );
    }

    const { guidelineId, ruleType, name, description, severity = "warning", pattern, replacement } = await req.json();

    if (!ruleType || !name || !description) {
      return NextResponse.json({ error: "ruleType, name, and description are required" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const newRule = {
      id,
      guideline_id: guidelineId || "b0000000-0000-0000-0000-000000000001",
      rule_type: ruleType,
      name,
      description,
      severity,
      pattern: pattern || "",
      replacement: replacement || "",
      is_enabled: true,
      created_at: new Date().toISOString(),
    };

    const rules = await governanceDB.getRules();
    rules.push(newRule);

    await governanceDB.logAction({
      organization_id: "a0000000-0000-0000-0000-000000000001",
      user_id: userId,
      action: "RULE_CREATED",
      entity_type: "rules",
      entity_id: id,
      details: { name, ruleType, severity },
    });

    return NextResponse.json({ message: "Rule created successfully", rule: newRule }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to manage rules" }, { status: 500 });
  }
}

