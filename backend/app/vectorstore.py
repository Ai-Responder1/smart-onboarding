from __future__ import annotations

import os
from typing import List, Tuple

from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter


def get_embeddings():
    # Use OpenAI embeddings for better quality and consistency with GPT-4.1
    model_name = os.environ.get("OPENAI_EMBEDDINGS_MODEL", "text-embedding-3-small")
    return OpenAIEmbeddings(model=model_name)


def get_faiss_path() -> str:
    base = os.environ.get("VECTOR_DB_DIR", "./storage/vector_db")
    os.makedirs(base, exist_ok=True)
    return os.path.join(base, "faiss_index")


def load_vector_store() -> FAISS | None:
    path = get_faiss_path()
    if os.path.exists(path):
        try:
            return FAISS.load_local(path, get_embeddings(), allow_dangerous_deserialization=True)
        except Exception:
            return None
    return None


def save_vector_store(store: FAISS) -> None:
    store.save_local(get_faiss_path())


def index_texts(texts: List[str], metadatas: List[dict] | None = None) -> int:
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    docs = splitter.create_documents(texts, metadatas=metadatas)

    store = load_vector_store()
    embeddings = get_embeddings()

    if store is None:
        store = FAISS.from_documents(docs, embeddings)
    else:
        store.add_documents(docs)

    save_vector_store(store)
    return len(docs)


def similarity_search(query: str, k: int = 5) -> List[Tuple[str, dict]]:
    store = load_vector_store()
    if store is None:
        return []
    results = store.similarity_search_with_score(query, k=k)
    pairs: List[Tuple[str, dict]] = []
    for doc, _score in results:
        pairs.append((doc.page_content, doc.metadata or {}))
    return pairs


