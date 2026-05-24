import os
import chromadb
from chromadb.config import Settings as ChromaSettings
from openai import OpenAI
from app.core.config import settings

_sync_client = OpenAI(api_key=settings.openai_api_key)
_chroma: chromadb.Collection | None = None

KNOWLEDGE_BASE_DIR = os.path.join(os.path.dirname(__file__), "../../data/knowledge_base")
CHROMA_DB_PATH = os.path.join(os.path.dirname(__file__), "../../data/chroma_db")


def _embed(texts: list[str]) -> list[list[float]]:
    response = _sync_client.embeddings.create(
        model=settings.openai_embedding_model,
        input=texts,
    )
    return [item.embedding for item in response.data]


def _load_collection() -> chromadb.Collection:
    client = chromadb.PersistentClient(
        path=CHROMA_DB_PATH,
        settings=ChromaSettings(anonymized_telemetry=False),
    )
    collection = client.get_or_create_collection(
        name=settings.chroma_collection_name,
        metadata={"hnsw:space": "cosine"},
    )
    return collection


def _chunk_document(text: str, doc_id: str, chunk_size: int = 500) -> list[tuple[str, str]]:
    """Split document into overlapping chunks. Returns (chunk_text, chunk_id) pairs."""
    words = text.split()
    chunks = []
    step = chunk_size - 50  # 50-word overlap
    for i, start in enumerate(range(0, len(words), step)):
        chunk = " ".join(words[start : start + chunk_size])
        if chunk.strip():
            chunks.append((chunk, f"{doc_id}_chunk_{i}"))
    return chunks


def initialize_rag() -> None:
    """Index all knowledge base documents into ChromaDB. Skips already-indexed docs."""
    global _chroma
    _chroma = _load_collection()

    kb_path = os.path.abspath(KNOWLEDGE_BASE_DIR)
    if not os.path.isdir(kb_path):
        print(f"[RAG] Knowledge base directory not found: {kb_path}")
        return

    existing_ids: set[str] = set(_chroma.get()["ids"])
    docs_to_embed: list[str] = []
    ids_to_embed: list[str] = []

    for filename in sorted(os.listdir(kb_path)):
        if not filename.endswith((".txt", ".md")):
            continue
        doc_id = filename.rsplit(".", 1)[0]
        filepath = os.path.join(kb_path, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            text = f.read()

        for chunk_text, chunk_id in _chunk_document(text, doc_id):
            if chunk_id not in existing_ids:
                docs_to_embed.append(chunk_text)
                ids_to_embed.append(chunk_id)

    if not docs_to_embed:
        print(f"[RAG] All {len(existing_ids)} chunks already indexed.")
        return

    print(f"[RAG] Embedding {len(docs_to_embed)} new chunks...")
    batch_size = 50
    for i in range(0, len(docs_to_embed), batch_size):
        batch_docs = docs_to_embed[i : i + batch_size]
        batch_ids = ids_to_embed[i : i + batch_size]
        embeddings = _embed(batch_docs)
        _chroma.add(documents=batch_docs, embeddings=embeddings, ids=batch_ids)

    print(f"[RAG] Indexed {len(docs_to_embed)} chunks. Total: {_chroma.count()} chunks.")


def retrieve(query: str, n_results: int = 4) -> str:
    """Retrieve the most relevant knowledge base passages for a query."""
    if _chroma is None or _chroma.count() == 0:
        return ""

    query_embedding = _embed([query])[0]
    results = _chroma.query(
        query_embeddings=[query_embedding],
        n_results=min(n_results, _chroma.count()),
    )
    passages = results.get("documents", [[]])[0]
    return "\n\n---\n\n".join(passages)
