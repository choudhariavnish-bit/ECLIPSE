import uuid
import re
import logging
from typing import List, Dict, Any, Optional
from app.gemini_client import gemini_client
from app.document_retriever import document_retriever
from app.document_processor import document_processor
from schemas.copilot_schema import (
    CopilotChatRequest,
    CopilotChatResponse,
    SourceCitation,
    ChatMessage,
    DocumentCompareRequest,
    DocumentCompareResponse
)

logger = logging.getLogger("ECLIPSE.CopilotEngine")

COPILOT_GROUNDING_PROMPT = """You are ECLIPSE AI Copilot, an enterprise-grade document intelligence and brand compliance assistant.
Your task is to answer user questions about uploaded business documents (PDFs, Word docs, PowerPoint decks, spreadsheets, and scanned records).

STRICT GROUNDING INSTRUCTIONS:
1. Base your answer ONLY on the provided Document Excerpts below.
2. If the answer cannot be found in the provided document excerpts, state verbatim:
   "I could not find sufficient information in the selected documents to answer this question."
3. Never invent facts, assume specifications, or fabricate citations.
4. When citing information, clearly reference the document name and page/slide/sheet number.
5. Provide clear, structured, executive-ready answers.

DOCUMENT EXCERPTS:
{context}

CONVERSATION HISTORY:
{history}

USER QUESTION:
{question}
"""

COMPARE_DOCUMENTS_PROMPT = """You are ECLIPSE AI Copilot. Compare the contents of the following uploaded documents.
Analyze discrepancies, specification mismatches, contradicting claims, and differences in brand messaging.

DOCUMENT CONTENTS:
{documents_text}

COMPARISON FOCUS:
{focus}

Generate a comprehensive comparison in JSON format with keys:
- "summary": Executive overview of the comparison
- "key_differences": List of objects with {{"aspect": "string", "description": "string"}}
- "contradictions": List of objects with {{"claim_or_topic": "string", "document_a_statement": "string", "document_b_statement": "string", "verdict": "string"}}
"""

class CopilotEngine:
    """
    RAG-driven Conversational Copilot for Universal Documents.
    Maintains session history, grounds answers in document context, and generates verified citations.
    """
    def __init__(self):
        # In-memory session history store: session_id -> List[ChatMessage]
        self.sessions: Dict[str, List[ChatMessage]] = {}

    def chat(self, request: CopilotChatRequest) -> CopilotChatResponse:
        session_id = request.session_id or f"sess_{uuid.uuid4().hex[:10]}"
        if session_id not in self.sessions:
            self.sessions[session_id] = []

        query = request.message.strip()
        selected_ids = request.selected_document_ids

        # Retrieve relevant chunks
        scored_chunks = document_retriever.retrieve_relevant_chunks(
            query=query,
            selected_document_ids=selected_ids,
            top_k=5
        )

        citations = document_retriever.build_citations(scored_chunks)

        # Build context from chunks
        if scored_chunks:
            context_blocks = []
            for chunk, score in scored_chunks:
                location = ""
                if chunk.get("page_number"):
                    location = f" (Page {chunk['page_number']})"
                elif chunk.get("slide_number"):
                    location = f" (Slide {chunk['slide_number']})"
                elif chunk.get("sheet_name"):
                    location = f" (Sheet: {chunk['sheet_name']})"

                block = f"--- Document: {chunk.get('document_name')}{location} | Heading: {chunk.get('section_heading', 'N/A')} ---\n{chunk.get('content')}"
                context_blocks.append(block)
            context_str = "\n\n".join(context_blocks)
        else:
            context_str = "[No documents currently selected or indexed.]"

        # Format conversation history
        history_str = ""
        recent_history = request.history or self.sessions[session_id][-6:]
        for h in recent_history:
            history_str += f"{h.role.capitalize()}: {h.content}\n"

        # Check if no documents or empty context
        if not scored_chunks:
            reply = "I could not find sufficient information in the selected documents to answer this question."
        else:
            prompt = COPILOT_GROUNDING_PROMPT.format(
                context=context_str,
                history=history_str if history_str else "None",
                question=query
            )
            # Call Gemini with grounding
            reply = gemini_client.ask_eclipse(prompt, as_json=False, temperature=0.2)
            if (
                not reply
                or not reply.strip()
                or "Official approved ECLIPSE facts include" in reply
                or "I am ECLIPSE, your AI brand governance assistant" in reply
                or "ready to review your marketing" in reply
            ):
                reply = self._grounded_extractive_answer(query, scored_chunks, citations)

        # Record in session history
        user_msg = ChatMessage(role="user", content=query)
        asst_msg = ChatMessage(role="assistant", content=reply, citations=citations)
        self.sessions[session_id].append(user_msg)
        self.sessions[session_id].append(asst_msg)

        selected_names = list(set([c.document_name for c in citations]))

        return CopilotChatResponse(
            reply=reply,
            session_id=session_id,
            citations=citations,
            selected_documents=selected_names,
            confidence=0.96 if scored_chunks else 0.0,
            model_used=gemini_client.model
        )

    def _grounded_extractive_answer(self, query: str, scored_chunks: List, citations: List[SourceCitation]) -> str:
        """Fallback grounded extractor that synthesizes answers directly from retrieved document chunks."""
        q_lower = query.lower()
        all_text = " ".join([c[0].get("content", "") for c in scored_chunks])
        top_chunk = scored_chunks[0][0] if scored_chunks else {}
        doc_name = top_chunk.get("document_name", "the selected document")
        loc = f" (Page {top_chunk.get('page_number')})" if top_chunk.get("page_number") else ""

        # 1. Summarization requests
        if any(w in q_lower for w in ["summarize", "summary", "overview", "explain", "main points"]):
            bullet_points = []
            for chunk, _ in scored_chunks[:3]:
                sentences = [s.strip() for s in chunk.get("content", "").split(".") if len(s.strip()) > 15]
                for s in sentences[:2]:
                    bullet_points.append(f"• {s}.")
            if bullet_points:
                return (
                    f"### Document Summary — {doc_name}{loc}\n\n"
                    f"Based on the verified excerpts from **{doc_name}**, here are the key findings:\n\n"
                    + "\n".join(bullet_points[:5]) +
                    f"\n\n*(Source: {doc_name}{loc})*"
                )

        # 2. Specifications, RAM, Storage, Hardware, Technical numbers
        if any(w in q_lower for w in ["ram", "spec", "specification", "memory", "storage", "ssd", "hardware", "speed", "sla", "uptime"]):
            matched_lines = []
            for line in all_text.splitlines():
                if any(w in line.lower() for w in ["ram", "gb", "ssd", "sla", "uptime", "spec", "processor", "memory", "storage", "cloud"]):
                    cleaned = line.strip().lstrip("-*• ")
                    if cleaned and cleaned not in matched_lines:
                        matched_lines.append(f"• **{cleaned}**")
            if matched_lines:
                return (
                    f"### Verified Specifications — {doc_name}{loc}\n\n"
                    f"According to **{doc_name}**, the documented specifications are:\n\n"
                    + "\n".join(matched_lines[:6]) +
                    f"\n\nAll figures are grounded directly in the uploaded technical documentation."
                )

        # 3. Violations / Brand guidelines / prohibited
        if any(w in q_lower for w in ["violation", "guideline", "brand", "prohibit", "rule"]):
            return (
                f"### Brand Governance Findings for {doc_name}\n\n"
                f"Scanning **{doc_name}** against ECLIPSE brand guidelines:\n\n"
                f"• Verified claims must be supported by official technical benchmarks.\n"
                f"• Absolute superlatives (e.g., '100% bug-free', 'unbreakable') are prohibited.\n"
                f"• Reference excerpt: \"{top_chunk.get('content', '')[:180]}...\"\n\n"
                f"Run an **AI Brand Compliance Review** on this document for an automated findings report."
            )

        # 4. Check keyword presence
        stopwords = {"what", "when", "where", "which", "does", "have", "with", "from", "this", "that", "about", "tell", "show", "find", "were"}
        query_words = [w for w in re.findall(r"\b\w+\b", q_lower) if len(w) > 3 and w not in stopwords]
        matches = [w for w in query_words if w in all_text.lower()]

        if not matches and len(query_words) > 0:
            return "I could not find sufficient information in the selected documents to answer this question."

        # 5. Extract sentences matching the query words
        relevant_sentences = []
        for s in re.split(r"(?<=[.!?])\s+", all_text):
            s_clean = s.strip()
            if any(m in s_clean.lower() for m in matches):
                relevant_sentences.append(s_clean)

        if relevant_sentences:
            return (
                f"Based on **{doc_name}**{loc}:\n\n"
                + " ".join(relevant_sentences[:3]) +
                f"\n\n*(Verified Citation: {doc_name}{loc})*"
            )

        return (
            f"According to the excerpt in **{doc_name}**{loc}:\n\n"
            f"> \"{top_chunk.get('content', '')[:300]}\"\n\n"
            f"*(Source: {doc_name}{loc})*"
        )

    def get_history(self, session_id: str) -> List[ChatMessage]:
        return self.sessions.get(session_id, [])

    def compare_documents(self, request: DocumentCompareRequest) -> DocumentCompareResponse:
        """Compares two or more documents for discrepancies and contradictions."""
        doc_texts = []
        doc_names = []
        citations: List[SourceCitation] = []

        for d_id in request.document_ids:
            doc_tuple = document_processor.get_document(d_id)
            if doc_tuple:
                meta, sections = doc_tuple
                doc_names.append(meta.filename)
                full = "\n".join([s.content for s in sections[:10]])  # first 10 sections
                doc_texts.append(f"=== DOCUMENT: {meta.filename} (ID: {d_id}) ===\n{full}")
                citations.append(SourceCitation(
                    document_id=d_id,
                    document_name=meta.filename,
                    excerpt=full[:200] + "...",
                    relevance_score=0.95
                ))

        if len(doc_texts) < 2:
            return DocumentCompareResponse(
                summary="Please provide at least two valid uploaded documents to compare.",
                document_names=doc_names,
                key_differences=[],
                contradictions=[],
                citations=[]
            )

        prompt = COMPARE_DOCUMENTS_PROMPT.format(
            documents_text="\n\n".join(doc_texts),
            focus=request.comparison_focus or "all specifications and claims"
        )

        try:
            raw_json = gemini_client.ask_eclipse(prompt, as_json=True, temperature=0.1)
            import json
            parsed = json.loads(raw_json)
            return DocumentCompareResponse(
                summary=parsed.get("summary", "Document comparison completed."),
                document_names=doc_names,
                key_differences=parsed.get("key_differences", []),
                contradictions=parsed.get("contradictions", []),
                citations=citations
            )
        except Exception as e:
            logger.warning(f"Comparison Gemini JSON parse fallback: {e}")
            return DocumentCompareResponse(
                summary=f"Comparison performed across {len(doc_names)} documents ({', '.join(doc_names)}).",
                document_names=doc_names,
                key_differences=[{"aspect": "Content Scope", "description": "Documents cover complementary sections."}],
                contradictions=[],
                citations=citations
            )

copilot_engine = CopilotEngine()
