import re
import uuid
from typing import List, Dict, Any, Optional
from schemas.audit_schema import Violation, ViolationCategory, ViolationSeverity
from app.brand_retriever import brand_retriever

def extract_surrounding_sentence(text: str, match_start: int, match_end: int) -> str:
    """Extracts the full sentence containing the matched slice."""
    sentences = re.split(r"(?<=[.!?])\s+", text)
    cumulative_len = 0
    for s in sentences:
        s_start = cumulative_len
        s_end = s_start + len(s)
        if match_start >= s_start and match_start <= s_end:
            return s.strip()
        cumulative_len = s_end + 1
    return text[max(0, match_start - 30):min(len(text), match_end + 30)].strip()

class RuleParser:
    """
    Deterministic Rule Parser for ECLIPSE.
    Detects exact prohibited terms, prohibited superlatives, brand casing infractions,
    and syntactic/grammar slips without depending on external model calls.
    """
    def __init__(self, retriever=brand_retriever):
        self.retriever = retriever

    def parse(self, text: str) -> List[Violation]:
        """
        Scans text for deterministic guideline infractions.
        """
        violations: List[Violation] = []
        guidelines = self.retriever.guidelines
        prohibited_terms = guidelines.get("prohibited_terminology", [])

        # 1. Check prohibited terms via regex boundary
        for item in prohibited_terms:
            term = item.get("term", "")
            if not term:
                continue

            escaped_term = re.escape(term)
            pattern = re.compile(rf"\b{escaped_term}\b", re.IGNORECASE)

            for match in pattern.finditer(text):
                matched_span = match.group(0)
                sev_str = item.get("severity", "medium").lower()
                severity = (
                    ViolationSeverity.CRITICAL if sev_str == "critical"
                    else ViolationSeverity.HIGH if sev_str == "high"
                    else ViolationSeverity.LOW if sev_str == "low"
                    else ViolationSeverity.MEDIUM
                )

                sentence = extract_surrounding_sentence(text, match.start(), match.end())
                replacement = item.get("recommended_replacement", "compliant terminology")
                corrected_sent = sentence.replace(matched_span, replacement)

                violations.append(Violation(
                    id=f"rule_viol_{uuid.uuid4().hex[:6]}",
                    category=ViolationCategory.PROHIBITED_TERM,
                    severity=severity,
                    problematic_text=matched_span,
                    original_sentence=sentence,
                    explanation=item.get("rationale", "Prohibited brand term detected in marketing copy."),
                    guideline_reference="ECLIPSE Prohibited Terminology Policy",
                    rule_id=f"RULE-PROHIB-{term.replace(' ', '_').upper()}",
                    suggestion=f"Replace with: '{replacement}'",
                    corrected_sentence=corrected_sent,
                    requires_human_review=False
                ))

        # 2. Check brand name casing: ECLIPSE must be strictly all-caps
        eclipse_matches = re.finditer(r"\beclipse\b", text, re.IGNORECASE)
        for em in eclipse_matches:
            matched_str = em.group(0)
            if matched_str != "ECLIPSE":
                sentence = extract_surrounding_sentence(text, em.start(), em.end())
                violations.append(Violation(
                    id=f"case_viol_{uuid.uuid4().hex[:6]}",
                    category=ViolationCategory.FORMATTING_RULE,
                    severity=ViolationSeverity.MEDIUM,
                    problematic_text=matched_str,
                    original_sentence=sentence,
                    explanation="Brand name must be styled strictly as 'ECLIPSE' in capital letters.",
                    guideline_reference="ECLIPSE Brand Identity Guidelines, Section 1",
                    rule_id="RULE-BRAND-CASING",
                    suggestion="ECLIPSE",
                    corrected_sentence=sentence.replace(matched_str, "ECLIPSE"),
                    requires_human_review=False
                ))

        # 3. Superlatives pattern check (e.g. '#1', 'world's best', 'number one', "India's No. 1")
        superlative_patterns = [
            (r"\b#1\b|\bnumber\s+(?:one|1)\b|\bno\.?\s*1\b", "Unverified rank superlative '#1 / No. 1'", "industry-leading", "RULE-SUPERLATIVE-RANK"),
            (r"\bworld['’]?s\s+best\b", "Unverified global superlative 'world's best'", "premier enterprise solution", "RULE-SUPERLATIVE-GLOBAL"),
            (r"\bunrivaled\b|\bunbeatable\b", "Absolute superiority claim requires certified audit", "proven enterprise grade", "RULE-SUPERLATIVE-ABSOLUTE"),
            (r"\b(incompetent|garbage|pathetic|obliterate)\b", "Aggressive or derogatory tone towards competitors", "outperform legacy alternatives", "RULE-TONE-AGGRESSIVE"),
            (r"\bshocking\s+secret\b|\bcrazy\s+ai\s+trick\b", "Sensationalist clickbait terminology prohibited", "strategic innovation", "RULE-TONE-CLICKBAIT")
        ]
        for spattern, desc, sug, r_code in superlative_patterns:
            for sm in re.finditer(spattern, text, re.IGNORECASE):
                sentence = extract_surrounding_sentence(text, sm.start(), sm.end())
                violations.append(Violation(
                    id=f"superlative_viol_{uuid.uuid4().hex[:6]}",
                    category=ViolationCategory.UNSUPPORTED_CLAIM,
                    severity=ViolationSeverity.HIGH,
                    problematic_text=sm.group(0),
                    original_sentence=sentence,
                    explanation=f"{desc}. Factual claims must cite approved evidence IDs.",
                    guideline_reference="ECLIPSE Substantiation & Claims Standard v1.2",
                    rule_id=r_code,
                    suggestion=sug,
                    corrected_sentence=sentence.replace(sm.group(0), sug),
                    requires_human_review=True
                ))

        # 4. Syntactic & Grammar baseline checks (e.g., repeated words, common spelling slips)
        grammar_patterns = [
            (r"\b(the|is|in|at|on|for|with)\s+\1\b", "Repeated word detected", r"\1", ViolationCategory.REPETITIVE_CONTENT, ViolationSeverity.LOW),
            (r"\bteh\b", "Spelling error ('teh' -> 'the')", "the", ViolationCategory.SPELLING_ERROR, ViolationSeverity.LOW),
            (r"\brecieve\b", "Spelling error ('recieve' -> 'receive')", "receive", ViolationCategory.SPELLING_ERROR, ViolationSeverity.LOW),
            (r"\bseperate\b", "Spelling error ('seperate' -> 'separate')", "separate", ViolationCategory.SPELLING_ERROR, ViolationSeverity.LOW),
            (r"\btheir\s+is\b", "Grammar error: 'their is' -> 'there is'", "there is", ViolationCategory.GRAMMAR_ERROR, ViolationSeverity.MEDIUM),
            (r"\bits\s+a\s+best\b", "Grammar error: 'its a best' -> 'it is the best'", "it is an industry-leading", ViolationCategory.GRAMMAR_ERROR, ViolationSeverity.MEDIUM)
        ]
        for g_pat, g_desc, g_sug, g_cat, g_sev in grammar_patterns:
            for gm in re.finditer(g_pat, text, re.IGNORECASE):
                sentence = extract_surrounding_sentence(text, gm.start(), gm.end())
                violations.append(Violation(
                    id=f"grammar_viol_{uuid.uuid4().hex[:6]}",
                    category=g_cat,
                    severity=g_sev,
                    problematic_text=gm.group(0),
                    original_sentence=sentence,
                    explanation=g_desc,
                    guideline_reference="ECLIPSE Content Quality & Grammar Standards",
                    rule_id="RULE-GRAMMAR-SPELL",
                    suggestion=g_sug if "\\" not in g_sug else gm.group(1),
                    corrected_sentence=re.sub(g_pat, g_sug, sentence, flags=re.IGNORECASE),
                    requires_human_review=False
                ))

        return violations

rule_parser = RuleParser()

def check_prohibited_terms(content: str, prohibited_terms: List[str]) -> List[Dict[str, Any]]:
    """Helper for legacy test compatibility."""
    findings = []
    for term in prohibited_terms:
        if not term:
            continue
        escaped = re.escape(term)
        if re.search(rf"\b{escaped}\b", content, re.IGNORECASE):
            findings.append({
                "category": "terminology",
                "severity": "high",
                "matched_text": term,
                "status": "confirmed_violation",
                "message": "Prohibited brand terminology detected."
            })
    return findings
