import json
import os
import re
from typing import List, Dict, Any, Optional

KNOWLEDGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "knowledge")

class BrandKnowledgeRetriever:
    """
    RAG Knowledge Retriever for ECLIPSE.
    Fetches approved brand guidelines, voice standards, prohibited terminology,
    and verified corporate facts relevant to submitted content.
    """
    def __init__(self, knowledge_dir: str = KNOWLEDGE_DIR):
        self.knowledge_dir = knowledge_dir
        self.guidelines = self._load_json("brand_guidelines.json")
        facts = self._load_json("approved_facts.json")
        if not facts:
            facts = self._load_json("verified_facts.json")
        self.facts = facts

    def _load_json(self, filename: str) -> Dict[str, Any]:
        filepath = os.path.join(self.knowledge_dir, filename)
        if os.path.exists(filepath):
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[ECLIPSE Retriever] Error reading {filename}: {e}")
        return {}

    def retrieve_relevant_rules(self, text: str) -> List[Dict[str, Any]]:
        """
        Retrieves prohibited terminology and formatting rules relevant to the text.
        """
        lower_text = text.lower()
        matched_rules = []

        # Check prohibited terms
        for term_def in self.guidelines.get("prohibited_terminology", []):
            term = term_def.get("term", "").lower()
            if term and term in lower_text:
                matched_rules.append({
                    "type": "prohibited_term",
                    "term": term_def.get("term"),
                    "severity": term_def.get("severity"),
                    "recommended_replacement": term_def.get("recommended_replacement"),
                    "rationale": term_def.get("rationale")
                })

        # Check casing rules for ECLIPSE
        if "eclipse" in lower_text and "ECLIPSE" not in text:
            matched_rules.append({
                "type": "casing_violation",
                "term": "ECLIPSE",
                "severity": "medium",
                "recommended_replacement": "ECLIPSE",
                "rationale": "Brand name must strictly be formatted as 'ECLIPSE' in all-caps."
            })

        return matched_rules

    def retrieve_relevant_facts(self, text: str) -> List[Dict[str, Any]]:
        """
        Retrieves verified facts from the knowledge base that correspond
        to topics, numbers, or metrics present in the submitted text.
        """
        lower_text = text.lower()
        matched_facts = []

        all_facts = self.facts.get("facts", [])
        for fact in all_facts:
            score = 0
            keywords = fact.get("keywords", [])
            for kw in keywords:
                if kw.lower() in lower_text:
                    score += 1

            statement_text = fact.get("statement") or fact.get("approved_statement", "")
            # Match numbers / percentages
            numbers_in_fact = re.findall(r"\b\d+(?:\.\d+)?%?\b", statement_text)
            for num in numbers_in_fact:
                if num in text:
                    score += 2

            if score > 0:
                matched_facts.append({
                    "id": fact.get("fact_id") or fact.get("id"),
                    "topic": fact.get("topic"),
                    "approved_statement": statement_text,
                    "evidence_ref": fact.get("evidence_ref"),
                    "relevance_score": score
                })

        # Sort by relevance score descending
        matched_facts.sort(key=lambda x: x["relevance_score"], reverse=True)
        return matched_facts

    def get_context_for_review(self, text: str, channel: str = "general") -> Dict[str, Any]:
        """
        Synthesizes relevant guidelines, voice rules, and verified facts into a RAG payload.
        """
        matched_rules = self.retrieve_relevant_rules(text)
        matched_facts = self.retrieve_relevant_facts(text)

        core_identity = self.guidelines.get("core_identity", {})
        voice_attributes = core_identity.get("voice_attributes", [])
        unacceptable_tones = core_identity.get("unacceptable_tones", [])

        # Formatted RAG context string for Gemini prompt
        rag_prompt_block = []
        rag_prompt_block.append("=== APPROVED BRAND GUIDELINES (SOURCE OF TRUTH) ===")
        rag_prompt_block.append(f"Channel: {channel}")
        rag_prompt_block.append(f"Approved Voice: {', '.join(voice_attributes)}")
        rag_prompt_block.append(f"Unacceptable Tones: {', '.join(unacceptable_tones)}")

        if matched_rules:
            rag_prompt_block.append("\nRelevant Detected Brand Prohibitions:")
            for r in matched_rules:
                rag_prompt_block.append(f"- Prohibited: '{r.get('term')}' | Severity: {r.get('severity')} | Replace with: '{r.get('recommended_replacement')}' | Reason: {r.get('rationale')}")

        rag_prompt_block.append("\n=== OFFICIAL VERIFIED BRAND FACTS ===")
        if matched_facts:
            for f in matched_facts:
                rag_prompt_block.append(f"- [{f.get('topic')}]: \"{f.get('approved_statement')}\" (Ref: {f.get('evidence_ref')})")
        else:
            rag_prompt_block.append("No specific metrics found; any statistical or absolute claims in user text must be flagged as UNSUPPORTED.")

        return {
            "matched_rules": matched_rules,
            "matched_facts": matched_facts,
            "prompt_context": "\n".join(rag_prompt_block)
        }

# Global singleton
brand_retriever = BrandKnowledgeRetriever()
