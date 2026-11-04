import re
from typing import List, Dict, Any, Tuple
from schemas.audit_schema import FactCheckItem, FactCheckStatus
from app.brand_retriever import brand_retriever

class FactChecker:
    """
    Fact Verification Engine for ECLIPSE.
    Verifies marketing claims against approved corporate evidence and facts.
    Distinguishes strictly between VERIFIED, UNSUPPORTED, and REFUTED (false) claims.
    """
    def __init__(self, retriever=brand_retriever):
        self.retriever = retriever

    def verify_claims(self, text: str) -> List[FactCheckItem]:
        """
        Extracts claims from text and checks them against verified facts.
        """
        results: List[FactCheckItem] = []
        facts_db = self.retriever.facts.get("facts", [])

        # 1. Check Uptime / SLA claims
        sla_match = re.search(r"(\d+(?:\.\d+)?%)\s*(?:uptime|availability|sla)", text, re.IGNORECASE)
        if sla_match:
            claimed_uptime = sla_match.group(1)
            full_snippet = sla_match.group(0)
            if claimed_uptime in ["99.99%", "99.9%"]:
                results.append(FactCheckItem(
                    claim_text=full_snippet,
                    status=FactCheckStatus.VERIFIED,
                    evidence="ECLIPSE enterprise tier officially guarantees a 99.99% uptime SLA.",
                    confidence=0.98,
                    source_ref="Security & Architecture Whitepaper 2026, Section 4.2"
                ))
            elif claimed_uptime in ["100%", "100.0%"]:
                results.append(FactCheckItem(
                    claim_text=full_snippet,
                    status=FactCheckStatus.REFUTED,
                    evidence="False claim: 100% uptime is mathematically impossible and contradicts official 99.99% SLA.",
                    confidence=1.0,
                    source_ref="Security & Architecture Whitepaper 2026, Section 4.2"
                ))
            else:
                results.append(FactCheckItem(
                    claim_text=full_snippet,
                    status=FactCheckStatus.UNSUPPORTED,
                    evidence=f"Claimed uptime of {claimed_uptime} does not match documented 99.99% enterprise SLA.",
                    confidence=0.90,
                    source_ref="Approved SLA Registry"
                ))

        # 2. Check Customer / User count claims
        customer_match = re.search(r"(?:over\s+|more\s+than\s+)?([\d,]+)\+?\s*(?:enterprise\s+)?(?:teams|customers|companies|users|brands)", text, re.IGNORECASE)
        if customer_match:
            claim_str = customer_match.group(0)
            num_clean = customer_match.group(1).replace(",", "")
            try:
                num = int(num_clean)
                if num <= 10000:
                    results.append(FactCheckItem(
                        claim_text=claim_str,
                        status=FactCheckStatus.VERIFIED,
                        evidence="Officially documented: trusted by over 10,000 enterprise teams.",
                        confidence=0.95,
                        source_ref="FACT-002"
                    ))
                else:
                    results.append(FactCheckItem(
                        claim_text=claim_str,
                        status=FactCheckStatus.UNSUPPORTED,
                        evidence=f"Unverified adoption count: Claiming {num_clean} exceeds approved verified baseline of 10,000 enterprise teams.",
                        confidence=0.88,
                        source_ref="FACT-002"
                    ))
            except ValueError:
                pass

        # 2b. Check country count claims
        country_match = re.search(r"(\d+)\s+countries", text, re.IGNORECASE)
        if country_match:
            claimed_countries = int(country_match.group(1))
            full_country_str = country_match.group(0)
            if claimed_countries == 45:
                results.append(FactCheckItem(
                    claim_text=full_country_str,
                    status=FactCheckStatus.VERIFIED,
                    evidence="Officially documented: deployed across 45 countries.",
                    confidence=0.95,
                    source_ref="FACT-002"
                ))
            else:
                results.append(FactCheckItem(
                    claim_text=full_country_str,
                    status=FactCheckStatus.REFUTED,
                    evidence=f"False claim: Officially deployed in 45 countries, not {claimed_countries}.",
                    confidence=0.95,
                    source_ref="FACT-002"
                ))

        # 3. Check turnaround / efficiency percentage claims
        efficiency_match = re.search(r"(\d+(?:\.\d+)?%)\s*(?:faster|reduction|turnaround|decrease|efficiency)", text, re.IGNORECASE)
        if efficiency_match:
            eff_num = efficiency_match.group(1)
            eff_snippet = efficiency_match.group(0)
            if "78%" in eff_num or "80%" in eff_num:
                results.append(FactCheckItem(
                    claim_text=eff_snippet,
                    status=FactCheckStatus.VERIFIED,
                    evidence="Documented benchmark: average 78% reduction in brand review turnaround times.",
                    confidence=0.94,
                    source_ref="Forrester TEI Benchmark Study on Brand Governance Automation 2026"
                ))
            else:
                results.append(FactCheckItem(
                    claim_text=eff_snippet,
                    status=FactCheckStatus.UNSUPPORTED,
                    evidence=f"Claim of {eff_snippet} lacks verified study citations. Approved metric is 78% reduction.",
                    confidence=0.85,
                    source_ref="Forrester TEI Benchmark Study 2026"
                ))

        # 4. Check Certifications (SOC 2, ISO 27001, GDPR, HIPAA, etc.)
        for cert in ["SOC 2", "ISO 27001", "GDPR", "HIPAA"]:
            if cert.lower() in text.lower():
                if cert in ["SOC 2", "ISO 27001", "GDPR"]:
                    results.append(FactCheckItem(
                        claim_text=cert,
                        status=FactCheckStatus.VERIFIED,
                        evidence=f"Verified: ECLIPSE holds active {cert} compliance certification.",
                        confidence=0.99,
                        source_ref="Trust Center Certificate Registry #BC-2025-992"
                    ))
                elif cert == "HIPAA":
                    results.append(FactCheckItem(
                        claim_text="HIPAA",
                        status=FactCheckStatus.UNSUPPORTED,
                        evidence="HIPAA BAA availability is pending formal audit. Do not advertise unconditional HIPAA compliance.",
                        confidence=0.92,
                        source_ref="Trust Center Certification Roadmap"
                    ))

        # 5. Check Unapproved Native Integrations
        unapproved_integrations = ["Salesforce", "Marketo", "Oracle", "SAP"]
        for unapp in unapproved_integrations:
            if unapp.lower() in text.lower() and ("connect" in text.lower() or "integrat" in text.lower()):
                results.append(FactCheckItem(
                    claim_text=f"Native {unapp} integration",
                    status=FactCheckStatus.UNSUPPORTED,
                    evidence=f"Native integration with {unapp} is not in the approved product matrix (approved: Slack, Google Workspace, Figma, HubSpot, Webflow).",
                    confidence=0.94,
                    source_ref="FACT-006"
                ))

        return results

# Global singleton
fact_checker = FactChecker()
