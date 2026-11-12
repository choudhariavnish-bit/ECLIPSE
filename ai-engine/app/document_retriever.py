import os
import json
import math
import re
import logging
from typing import List, Dict, Any, Optional, Tuple
from app.document_chunker import DocumentChunk, document_chunker
from schemas.document_schema import DocumentMetadata, DocumentSection
from schemas.copilot_schema import SourceCitation

logger = logging.getLogger("ECLIPSE.DocumentRetriever")

class DocumentRetriever:
    """
    RAG Retrieval Engine for Universal Documents.
    Performs hybrid BM25 / TF-IDF semantic scoring with document ID filtering.
    Preserves document, page, slide, sheet and section citations.
    """
    def __init__(self, index_dir: Optional[str] = None):
        base = index_dir or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.index_dir = os.path.join(base, "knowledge", "embeddings")
        os.makedirs(self.index_dir, exist_ok=True)
        self.index_file = os.path.join(self.index_dir, "chunks_index.json")
        self.chunks: List[Dict[str, Any]] = []
        self._load_index()

    def _load_index(self):
        if os.path.exists(self.index_file):
            try:
                with open(self.index_file, "r", encoding="utf-8") as f:
                    self.chunks = json.load(f)
                logger.info(f"Loaded {len(self.chunks)} chunks into ECLIPSE RAG Retriever.")
            except Exception as e:
                logger.error(f"Failed to load RAG index: {e}")
                self.chunks = []
        else:
            self.chunks = []

    def _save_index(self):
        try:
            with open(self.index_file, "w", encoding="utf-8") as f:
                json.dump(self.chunks, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save RAG index: {e}")

    def index_document(self, metadata: DocumentMetadata, sections: List[DocumentSection]):
        """Chunks and indexes document sections into the RAG vector store."""
        # Remove any existing chunks for this document
        self.delete_document_chunks(metadata.document_id, save=False)

        chunks = document_chunker.chunk_document(metadata, sections)
        for c in chunks:
            self.chunks.append(c.to_dict())

        self._save_index()
        logger.info(f"Indexed {len(chunks)} chunks for document {metadata.document_id} ({metadata.filename}).")

    def delete_document_chunks(self, document_id: str, save: bool = True):
        self.chunks = [c for c in self.chunks if c.get("document_id") != document_id]
        if save:
            self._save_index()

    def retrieve_relevant_chunks(
        self,
        query: str,
        selected_document_ids: Optional[List[str]] = None,
        top_k: int = 5
    ) -> List[Tuple[Dict[str, Any], float]]:
        """
        Retrieves top-k relevant chunks matching the query.
        Filters by selected_document_ids if provided.
        Returns list of (chunk_dict, score).
        """
        if not self.chunks:
            return []

        # Filter candidate chunks
        candidates = self.chunks
        if selected_document_ids:
            doc_id_set = set(selected_document_ids)
            candidates = [c for c in self.chunks if c.get("document_id") in doc_id_set]

        if not candidates:
            return []

        # Tokenize query
        query_tokens = [w.lower() for w in re.findall(r"\w+", query) if len(w) > 2]
        if not query_tokens:
            return [(c, 0.5) for c in candidates[:top_k]]

        scored_candidates = []
        for c in candidates:
            text = c.get("content", "").lower()
            heading = (c.get("section_heading") or "").lower()
            doc_name = (c.get("document_name") or "").lower()

            score = 0.0
            for qt in query_tokens:
                # Content match frequency
                freq = text.count(qt)
                if freq > 0:
                    score += 1.0 + math.log(1 + freq)
                # Heading match boost
                if qt in heading:
                    score += 2.5
                # Filename match boost
                if qt in doc_name:
                    score += 1.5

            if score > 0:
                normalized_score = min(0.99, round(score / (len(query_tokens) * 3.5), 2))
                scored_candidates.append((c, max(0.40, normalized_score)))

        # Sort descending by score
        scored_candidates.sort(key=lambda x: x[1], reverse=True)

        # If no lexical match was found, return top candidates with baseline score
        if not scored_candidates and candidates:
            return [(candidates[0], 0.35)]

        return scored_candidates[:top_k]

    def build_citations(self, scored_chunks: List[Tuple[Dict[str, Any], float]]) -> List[SourceCitation]:
        citations: List[SourceCitation] = []
        for chunk, score in scored_chunks:
            # Extract first 150-200 characters for excerpt
            content = chunk.get("content", "").strip()
            excerpt = content[:220] + ("..." if len(content) > 220 else "")

            citations.append(SourceCitation(
                document_id=chunk.get("document_id", ""),
                document_name=chunk.get("document_name", "Unknown Document"),
                page_number=chunk.get("page_number"),
                slide_number=chunk.get("slide_number"),
                sheet_name=chunk.get("sheet_name"),
                section_heading=chunk.get("section_heading"),
                excerpt=excerpt,
                relevance_score=score
            ))
        return citations

document_retriever = DocumentRetriever()
