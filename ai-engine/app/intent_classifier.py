import re
from typing import Dict, Any, List
from schemas.audit_schema import ContentIntent, ContentPurpose, InputUnderstanding

class ContentIntentClassifier:
    """
    Stage 1 & 2: Input Understanding & Content Intent Classification
    Understands context, purpose, topic, claims, and style before evaluation begins.
    """

    def analyze_intent_and_context(self, content: str, channel_hint: str = "general") -> Dict[str, Any]:
        text = content.strip()
        text_lower = text.lower()

        # 1. Content Intent Classification
        intent = ContentIntent.GENERAL_DOCUMENT
        c_hint = (channel_hint or "").lower()

        if "ad" in c_hint or "campaign" in c_hint:
            intent = ContentIntent.ADVERTISEMENT
        elif "social" in c_hint or "linkedin" in c_hint or "twitter" in c_hint or "instagram" in c_hint:
            intent = ContentIntent.SOCIAL_MEDIA
        elif "blog" in c_hint or "article" in c_hint or "post" in c_hint:
            intent = ContentIntent.BLOG
        elif "email" in c_hint or "newsletter" in c_hint:
            intent = ContentIntent.EMAIL
        elif "press" in c_hint or "pr" in c_hint:
            intent = ContentIntent.PRESS_RELEASE
        elif "product" in c_hint or "spec" in c_hint:
            intent = ContentIntent.PRODUCT_DESCRIPTION
        else:
            # Infer from structure
            if len(text.split()) > 200 or "\n#" in text or "##" in text:
                intent = ContentIntent.BLOG
            elif any(k in text_lower for k in ["dear ", "subject:", "hi team", "unsubscribe"]):
                intent = ContentIntent.EMAIL
            elif any(k in text_lower for k in ["for immediate release", "dateline", "contact:"]):
                intent = ContentIntent.PRESS_RELEASE
            elif any(k in text_lower for k in ["click here", "buy now", "sign up today", "limited time"]):
                intent = ContentIntent.ADVERTISEMENT

        # 2. Content Purpose Classification
        purpose = ContentPurpose.INFORMATIVE
        if any(w in text_lower for w in ["guarantee", "cheapest", "best", "leading", "special offer", "discount", "buy", "join 10,000+"]):
            purpose = ContentPurpose.PROMOTIONAL
        elif any(w in text_lower for w in ["why you should", "proven", "transforms", "superior", "switch to"]):
            purpose = ContentPurpose.PERSUASIVE
        elif any(w in text_lower for w in ["how to", "guide", "tutorial", "step 1", "learn", "definition"]):
            purpose = ContentPurpose.EDUCATIONAL
        elif any(w in text_lower for w in ["invoice", "order", "receipt", "confirmation", "checkout"]):
            purpose = ContentPurpose.TRANSACTIONAL

        # 3. Input Understanding: Claim & Element Extraction
        # Products
        products = []
        known_products = ["ECLIPSE", "NovaBook", "NovaBook X1", "Horizon Cloud", "TrustCenter", "Slack", "Figma", "Google Workspace"]
        for p in known_products:
            if re.search(rf"\b{re.escape(p)}\b", text, re.IGNORECASE):
                products.append(p)

        # Numerical Claims (percentages, metrics, amounts)
        numerical_claims = re.findall(r"\b(?:\d+(?:\.\d+)?%|\$?\d+(?:,\d+)*(?:\.\d+)?(?:\s*(?:teams|users|customers|countries|hours|gb|tb|ms|min|sec))?)\b", text, re.IGNORECASE)
        numerical_claims = [c.strip() for c in numerical_claims if len(c.strip()) > 1][:8]

        # Comparisons
        comparisons = []
        comp_matches = re.finditer(r"\b(?:better than|faster than|cheaper than|outperform|unlike|compared to|versus|vs\.?)\s+([^.,;\n]+)", text, re.IGNORECASE)
        for cm in comp_matches:
            comparisons.append(cm.group(0).strip())

        # Calls to action
        ctas = []
        cta_matches = re.finditer(r"\b(?:get started|sign up|learn more|contact us|request a demo|try eclipse|download now|click here|book a call)\b", text, re.IGNORECASE)
        for ctam in cta_matches:
            ctas.append(ctam.group(0).strip())

        # Main topic inference
        words = text.split()
        first_sentence = text.split(".")[0] if "." in text else text[:80]
        main_topic = first_sentence.strip()[:90]

        # Tone & style inference
        detected_tone = "Professional & Direct"
        if any(w in text_lower for w in ["crazy", "insane", "super fast", "omg", "cool"]):
            detected_tone = "Casual & Overly Enthusiastic"
        elif any(w in text_lower for w in ["destroy", "crush", "incompetent", "garbage"]):
            detected_tone = "Aggressive & Bellicose"
        elif any(w in text_lower for w in ["empower", "resilience", "enterprise", "compliance", "authoritative"]):
            detected_tone = "Enterprise Authoritative (Approved)"

        understanding = InputUnderstanding(
            main_topic=main_topic,
            purpose=purpose.value,
            intended_audience="Enterprise & B2B buyers" if "enterprise" in text_lower or intent == ContentIntent.BLOG else "General Audience",
            products_mentioned=products or ["ECLIPSE Platform"],
            claims_extracted=[s.strip() for s in text.split(".") if any(w in s.lower() for w in ["guarantee", "uptime", "certified", "sla", "best", "ram", "tested"])][:5],
            numerical_claims=numerical_claims,
            comparisons=comparisons,
            calls_to_action=ctas,
            tone_and_style=detected_tone
        )

        return {
            "content_intent": intent,
            "content_purpose": purpose,
            "understanding": understanding
        }

intent_classifier = ContentIntentClassifier()

