"""
ECLIPSE Prompt Engineering Module
Crafted by Member 3 — AI & Prompt Engineer
Intelligent Reasoning, Fact Verification & Autonomous Blog Correction
"""

import json
from typing import Dict, Any, List, Optional

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
{json.dumps(detected_rule_violations, indent=2) if detected_rule_violations else "No exact dictionary violations caught."}

2. Fact Checker Preliminary Matches:
{json.dumps(detected_fact_checks, indent=2) if detected_fact_checks else "No explicit numeric claims matched."}

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
4. Produce a clear, actionable recommended compliant correction and alternative variations.
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
      "original_sentence": "full sentence from text",
      "explanation": "Why this is a violation...",
      "guideline_reference": "Specific guideline citation...",
      "suggestion": "Recommended fix...",
      "corrected_sentence": "Rewritten sentence..."
    }}
  ],
  "fact_checks": [
    {{
      "claim_text": "claim from text",
      "status": "verified",
      "evidence": "Citing approved facts...",
      "confidence": 0.95,
      "source_ref": "FACT-001"
    }}
  ],
  "recommended_correction": "Fully rewritten compliant text...",
  "alternative_corrections": [
    {{
      "tone_variation": "Executive & Authoritative",
      "revised_text": "Rewritten alternative text...",
      "rationale": "Why this alternative is effective..."
    }}
  ]
}}
"""
        return prompt

    @staticmethod
    def build_blog_reasoning_prompt(
        title: str,
        content: str,
        brand_id: str,
        target_audience: str,
        rag_context: str,
        deterministic_rules: List[Dict[str, Any]],
        fact_check_results: List[Dict[str, Any]]
    ) -> str:
        """
        Builds the complete Blog Content Review and Autonomous Correction prompt.
        Instructs Gemini to inspect Grammar, Tone, Brand Compliance, Factual Accuracy,
        and generate a complete polished blog revision.
        """
        prompt = f"""# ECLIPSE AI — Complete Blog Content Review & Autonomous Correction Engine

You are ECLIPSE, the intelligent brand governance, fact-checking, and content correction analyst.

## BLOG METADATA:
- Title: {title or 'Untitled Article'}
- Target Brand: {brand_id}
- Target Audience: {target_audience}

## APPROVED BRAND KNOWLEDGE & FACTS:
{rag_context}

## PRE-PARSED RULE INFRACTIONS:
{json.dumps(deterministic_rules, indent=2) if deterministic_rules else "[]"}

## PRE-VERIFIED CLAIMS:
{json.dumps(fact_check_results, indent=2) if fact_check_results else "[]"}

## ORIGINAL BLOG CONTENT:
\"\"\"{content}\"\"\"

## REASONING & CORRECTION MANDATE:
1. THINK BEFORE EVALUATING:
   - Identify main topic, purpose (informative, promotional, educational), and core audience.
   - Analyze paragraph flow, heading structure, introduction, and conclusion.
2. DETECT ISSUES:
   - Grammar, spelling, punctuation, repetitive words, weak phrasing.
   - Tone and brand voice (must be authoritative, professional, empathetic, transparent; NOT arrogant, hyperbolic, or aggressive).
   - Prohibited terms (e.g. 'unbreakable', '100% bug-free', 'cheapest', 'best in the world').
   - Factual accuracy: Check claims against approved facts (FACT-001..007). Mark as VERIFIED, CONTRADICTED, or UNSUPPORTED. Never invent evidence.
3. GENERATE COMPLETE REVISED BLOG:
   - Generate a complete, polished, fully corrected version of the blog.
   - Preserve the author's original message, structure, and intent.
   - Fix all grammatical errors, weak phrasing, prohibited terms, and factual inaccuracies.
   - Do NOT unnecessarily shorten the article or fabricate new facts.
4. RETURN STRUCTURED JSON ONLY matching this schema:

{{
  "overall_score": 75,
  "grammar_score": 90,
  "brand_compliance_score": 70,
  "content_quality_score": 75,
  "drift_score": 25,
  "risk_level": "HIGH",
  "status": "needs_human_review",
  "summary": "Detailed executive analysis of the blog post...",
  "input_understanding": {{
    "main_topic": "Topic of the blog",
    "purpose": "promotional",
    "intended_audience": "{target_audience}",
    "products_mentioned": ["ECLIPSE"],
    "claims_extracted": ["extracted claim"],
    "numerical_claims": ["extracted numeric metric"],
    "comparisons": [],
    "calls_to_action": ["CTA"],
    "tone_and_style": "Detected tone"
  }},
  "violations": [
    {{
      "id": "viol_1",
      "category": "prohibited_term",
      "severity": "high",
      "problematic_text": "exact snippet",
      "original_sentence": "full sentence containing snippet",
      "explanation": "Why this is a violation with guideline rule citation",
      "guideline_reference": "ECLIPSE Prohibited Terminology Policy",
      "rule_id": "RULE-PROHIB-TERM",
      "evidence_id": "FACT-001",
      "suggestion": "replacement phrase",
      "corrected_sentence": "corrected full sentence",
      "requires_human_review": false
    }}
  ],
  "fact_checks": [
    {{
      "claim_text": "exact claim from blog",
      "status": "verified",
      "evidence": "Citation of approved facts",
      "confidence": 0.95,
      "source_ref": "FACT-001",
      "approved_info": "official approved metric",
      "suggested_correction": "factual correction"
    }}
  ],
  "corrected_blog": "The complete, polished, fully revised blog text ready for publication...",
  "recommended_correction": "The complete revised blog text...",
  "alternative_corrections": [
    {{
      "tone_variation": "Executive & Authoritative",
      "revised_text": "Opening and closing tailored for executives...",
      "rationale": "Optimized for B2B decision-makers."
    }}
  ]
}}
"""
        return prompt

    @staticmethod
    def build_chat_prompt(
        message: str,
        history: List[Dict[str, str]] = None,
        document_context: Optional[str] = None,
        findings_context: Optional[List[Dict[str, Any]]] = None
    ) -> str:
        """
        Builds conversational prompt for ECLIPSE Brand Assistant chat interface,
        fully grounded in active document context and audit findings.
        """
        history_str = ""
        if history:
            for turn in history[-5:]:
                history_str += f"{turn.get('role', 'user').capitalize()}: {turn.get('content', '')}\n"

        doc_context_section = ""
        if document_context:
            doc_context_section = f"\nACTIVE BLOG / DOCUMENT CONTEXT:\n\"\"\"{document_context[:2500]}\"\"\"\n"

        findings_section = ""
        if findings_context:
            findings_section = f"\nACTIVE AUDIT FINDINGS & CITATIONS:\n{json.dumps(findings_context[:8], indent=2)}\n"

        return f"""You are ECLIPSE, the AI brand governance, fact verification, and content correction assistant powered by Google Gemini.
You have access to the user's active document context and brand governance findings.

{doc_context_section}
{findings_section}

Conversation History:
{history_str}

User Question: {message}

INSTRUCTIONS:
1. Answer authoritatively, helpfully, and factually.
2. If asked "Why was this claim flagged?", reference the specific finding, guideline, or approved Fact ID (e.g. FACT-001 SLA 99.99%, FACT-007 NovaBook X1 16 GB RAM).
3. If asked to rewrite, rephrase, or improve a paragraph, provide high-quality copy that maintains the author's meaning while adhering 100% to brand guidelines.
4. If asked about facts or SLA guarantees, cite verified facts (SLA 99.99%, SOC 2 Type II, 10,000+ teams across 45 countries). Never invent facts.

ECLIPSE Response:"""
