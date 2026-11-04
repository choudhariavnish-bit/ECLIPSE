import { NextRequest, NextResponse } from "next/server";
import { governanceDB, BrandRulebook, RuleItem } from "@/lib/governanceStore";

export async function GET() {
  try {
    const rulebooks = await governanceDB.getRulebooks();
    return NextResponse.json({ rulebooks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch brand rulebooks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "CREATE_BRAND") {
      const { brand } = body;
      if (!brand || !brand.name) {
        return NextResponse.json({ error: "Brand details are required" }, { status: 400 });
      }

      const newBrand: BrandRulebook = {
        id: brand.id || `brand-${Date.now().toString().slice(-4)}`,
        name: brand.name.trim(),
        tagline: brand.tagline?.trim() || "Independent Brand Rulebook",
        industry: brand.industry?.trim() || "Commercial",
        primaryColor: brand.primaryColor || "#2563EB",
        accentBg: brand.accentBg || "bg-slate-100 border-slate-300 text-slate-800",
        tone: brand.tone || { formality: 70, boldness: 60, empathy: 70 },
        rules: brand.rules || [
          {
            id: `r-init-${Date.now()}`,
            code: "GEN-01",
            category: "claim",
            name: "Standard Unverified Claims Check",
            description: "All marketing statements must be backed by verified documentation.",
            severity: "critical",
            pattern: "guaranteed 100%",
            replacement: "industry-leading standard",
            isEnabled: true,
          },
        ],
      };

      await governanceDB.createBrandRulebook(newBrand);
      await governanceDB.logAction({
        organization_id: "a0000000-0000-0000-0000-000000000001",
        action: "BRAND_RULEBOOK_CREATED",
        entity_type: "rulebook",
        entity_id: newBrand.id,
        details: { name: newBrand.name, industry: newBrand.industry },
      });

      const rulebooks = await governanceDB.getRulebooks();
      return NextResponse.json({ message: "Brand created successfully", brand: newBrand, rulebooks }, { status: 201 });
    }

    if (action === "ADD_RULE") {
      const { brandId, rule } = body;
      if (!brandId || !rule || !rule.name || !rule.pattern) {
        return NextResponse.json({ error: "brandId and complete rule details are required" }, { status: 400 });
      }

      const newRule: RuleItem = {
        id: rule.id || `r-custom-${Date.now()}`,
        code: rule.code || `CUS-${Date.now().toString().slice(-3)}`,
        category: rule.category || "claim",
        name: rule.name.trim(),
        description: rule.description?.trim() || "Brand guideline rule",
        severity: rule.severity || "warning",
        pattern: rule.pattern.trim(),
        replacement: rule.replacement?.trim() || "",
        isEnabled: true,
      };

      await governanceDB.addRuleToBrand(brandId, newRule);
      await governanceDB.logAction({
        organization_id: "a0000000-0000-0000-0000-000000000001",
        action: "RULE_ADDED_TO_BRAND",
        entity_type: "rules",
        entity_id: newRule.id,
        details: { brandId, name: newRule.name, pattern: newRule.pattern },
      });

      const rulebooks = await governanceDB.getRulebooks();
      return NextResponse.json({ message: "Rule added successfully", rule: newRule, rulebooks }, { status: 201 });
    }

    if (action === "TOGGLE_RULE") {
      const { brandId, ruleId } = body;
      if (!brandId || !ruleId) {
        return NextResponse.json({ error: "brandId and ruleId are required" }, { status: 400 });
      }

      const updated = await governanceDB.toggleBrandRule(brandId, ruleId);
      const rulebooks = await governanceDB.getRulebooks();
      return NextResponse.json({ message: "Rule toggled successfully", rule: updated, rulebooks });
    }

    if (action === "DELETE_RULE") {
      const { brandId, ruleId } = body;
      if (!brandId || !ruleId) {
        return NextResponse.json({ error: "brandId and ruleId are required" }, { status: 400 });
      }

      await governanceDB.deleteBrandRule(brandId, ruleId);
      const rulebooks = await governanceDB.getRulebooks();
      return NextResponse.json({ message: "Rule deleted successfully", rulebooks });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process rulebook action" }, { status: 500 });
  }
}

