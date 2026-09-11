import os
import chromadb

CHROMA_PATH = os.getenv("CHROMA_PATH", "/tmp/chroma")

_client = None


def get_client():
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(path=CHROMA_PATH)
    return _client


def get_collection(provider: str):
    return get_client().get_or_create_collection(
        name=f"documents_{provider}",
        metadata={"hnsw:space": "cosine"},
    )


def add_chunks(provider: str, filename: str, chunks: list, embeddings: list):
    collection = get_collection(provider)
    ids = [f"{filename}::{i}" for i in range(len(chunks))]
    metadatas = [{"filename": filename, "chunk_index": i} for i in range(len(chunks))]
    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas,
    )
    return len(chunks)


def query(provider: str, query_embedding: list, n_results: int = 4):
    collection = get_collection(provider)
    total = collection.count()
    if total == 0:
        return []
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(n_results, total),
    )
    return results.get("documents", [[]])[0]
