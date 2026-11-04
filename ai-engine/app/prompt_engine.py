"""
ECLIPSE Prompt Engineering Module
Crafted by Member 3 — AI & Prompt Engineer
"""

from typing import Dict, Any, List

def create_review_prompt(content: str, brand_knowledge: str) -> str:
    """
    Round 2 Specification: Creates controlled review prompt for Gemini
    grounded with approved brand knowledge.
    """
    return f"""You are ECLIPSE.

Your role is to review marketing content against approved company brand guidelines.

BRAND KNOWLEDGE:
{brand_knowledge}

CONTENT:
{content}

REVIEW THE FOLLOWING:
1. Brand tone consistency
2. Terminology violations
3. Messaging consistency
4. Unsupported promotional claims
5. Factual accuracy

IMPORTANT RULES:
- Never invent evidence.
- Do not assume unsupported claims are false.
- Cite approved fact IDs (e.g., ["FACT-001"]).
- Distinguish confirmed violations from uncertain findings.
- Preserve the creator's intention.

Return structured JSON only matching:
{{
  "overall_status": "needs_review",
  "summary": "Brief executive summary of findings",
  "issues": [
    {{
      "category": "claim",
      "severity": "high",
      "problematic_text": "Exact problematic quote",
      "explanation": "Why this violates guidelines",
      "evidence": ["FACT-001"],
      "suggestion": "Recommended compliant phrasing",
      "status": "needs_evidence"
    }}
  ]
}}
"""

class PromptEngine:
    """
    Constructs high-precision prompts for Google Gemini models,
    grounded with RAG context, brand rules, and structured schema outputs.
    """

    @staticmethod
    def build_review_prompt(
        content: str,
        channel: str,
        target_audience: str,
        rag_context: str,
        detected_rule_violations: List[Dict[str, Any]],
        detected_fact_checks: List[Dict[str, Any]],
        custom_rules: List[str] = None
    ) -> str:
        """
        Builds the comprehensive review prompt for ECLIPSE's Gemini Reviewer.
        Demands JSON output matching the BrandAuditReport schema.
        """
        custom_rules_section = ""
        if custom_rules:
            custom_rules_section = "\nAdditional Custom Rules:\n" + "\n".join([f"- {r}" for r in custom_rules])

        prompt = f"""You are reviewing marketing copy using your ECLIPSE AI Engine.

INPUT CONTENT TO REVIEW:
\"\"\"{content}\"\"\"

METADATA:
- Marketing Channel: {channel}
- Target Audience: {target_audience}
{custom_rules_section}

{rag_context}

PRE-ANALYZED SIGNALS:
1. Rule Parser Detected Items:
{detected_rule_violations if detected_rule_violations else "No exact dictionary violations caught."}

2. Fact Checker Preliminary Matches:
{detected_fact_checks if detected_fact_checks else "No explicit numeric claims matched."}

AUDIT INSTRUCTIONS:
1. Thoroughly review the submitted content for:
   - Prohibited or risky terminology (hyperbole, absolute guarantees, competitor attacks).
   - Tone violations (is it arrogant, aggressive, vague, or sensationalist?).
   - Formatting & casing (ensure 'ECLIPSE' is styled in full capitals).
   - Fact verification (distinguish verified facts from unverified or refuted claims).
2. Compute an objective Compliance Score (0 to 100):
   - 90-100: Approved (only minor or zero suggestions).
   - 60-89: Needs Human Review (moderate tone or unverified claim risks).
   - 0-59: Rejected (critical legal risks, false guarantees, or prohibited terms).
3. Determine final status: "approved", "needs_human_review", or "rejected".
4. Produce a clear, actionable recommended compliant correction and at least one alternative variation.
5. You MUST return ONLY valid raw JSON with this exact JSON schema:

{{
  "compliance_score": 75,
  "status": "needs_human_review",
  "summary": "Executive explanation of findings...",
  "violations": [
    {{
      "id": "viol_1",
      "category": "prohibited_term",
      "severity": "high",
      "problematic_text": "quote from text",
      "explanation": "Why this is a violation...",
      "guideline_reference": "Specific guideline citation...",
      "suggestion": "Recommended fix..."
    }}
  ],
  "fact_checks": [
    {{
      "claim_text": "claim from text",
      "status": "verified",
      "evidence": "Citing approved facts...",
      "confidence": 0.95,
      "source_ref": "Document citation..."
    }}
  ],
  "recommended_correction": "Fully rewritten compliant text...",
  "alternative_corrections": [
    {{
      "tone_variation": "Confident & Authoritative",
      "revised_text": "Rewritten alternative text...",
      "rationale": "Why this alternative is effective..."
    }}
  ]
}}
"""
        return prompt

    @staticmethod
    def build_chat_prompt(message: str, history: List[Dict[str, str]] = None) -> str:
        """
        Builds conversational prompt for ECLIPSE Brand Assistant chat interface.
        """
        history_str = ""
        if history:
            for turn in history[-5:]:
                history_str += f"{turn.get('role', 'user').capitalize()}: {turn.get('content', '')}\n"

        return f"""The user is interacting with you, ECLIPSE, the AI brand governance assistant.
Answer authoritatively, helpfully, and empathetically regarding brand guidelines, marketing copy improvements, terminology policies, and claim verification.

Conversation History:
{history_str}

User Question: {message}

ECLIPSE Response:"""
