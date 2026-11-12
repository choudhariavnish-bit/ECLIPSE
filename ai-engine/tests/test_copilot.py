import pytest
from app.document_processor import document_processor
from app.document_retriever import document_retriever
from app.copilot_engine import copilot_engine
from schemas.copilot_schema import CopilotChatRequest, DocumentCompareRequest

def test_copilot_fallback_when_no_evidence():
    """When document lacks sufficient evidence, Copilot must respond with required fallback sentence."""
    req = CopilotChatRequest(
        message="What is the CEO's favorite holiday destination in 2026?",
        selected_document_ids=["non_existent_doc_id"]
    )
    res = copilot_engine.chat(req)
    assert "I could not find sufficient information in the selected documents to answer this question." in res.reply
    assert res.confidence == 0.0

def test_copilot_grounded_qa_with_document():
    """Upload document, index into RAG, and query Copilot."""
    text_content = """# NovaBook X1 Enterprise Specifications
The NovaBook X1 delivers 16 GB unified RAM and 512 GB high-speed SSD storage.
The guaranteed enterprise uptime SLA is 99.99%.
All customer deployments receive 24/7 dedicated support.
"""
    meta, sections = document_processor.process_document(text_content.encode("utf-8"), "novabook_spec.md")
    document_retriever.index_document(meta, sections)

    req = CopilotChatRequest(
        message="What are the RAM and storage specs of NovaBook X1?",
        selected_document_ids=[meta.document_id]
    )
    res = copilot_engine.chat(req)
    assert len(res.citations) > 0
    assert res.citations[0].document_name == "novabook_spec.md"
    assert "16 GB" in res.citations[0].excerpt or "NovaBook" in res.citations[0].excerpt

def test_copilot_multi_turn_history():
    """Verify session history retention across follow-up queries."""
    session_id = "test_session_multi_turn"
    req1 = CopilotChatRequest(
        message="Hello",
        session_id=session_id
    )
    res1 = copilot_engine.chat(req1)
    history = copilot_engine.get_history(session_id)
    assert len(history) >= 2  # user + assistant

def test_multi_document_comparison():
    """Test comparing two documents."""
    doc1 = "Document A: NovaBook X1 has 16 GB unified RAM and 512 GB SSD."
    doc2 = "Document B: Competitor Alpha provides 32 GB RAM with 1 TB SSD."

    m1, s1 = document_processor.process_document(doc1.encode("utf-8"), "doc_a.txt")
    m2, s2 = document_processor.process_document(doc2.encode("utf-8"), "doc_b.txt")

    req = DocumentCompareRequest(
        document_ids=[m1.document_id, m2.document_id],
        comparison_focus="specifications"
    )
    res = copilot_engine.compare_documents(req)
    assert len(res.document_names) == 2
    assert "doc_a.txt" in res.document_names
    assert "doc_b.txt" in res.document_names
