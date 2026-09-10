import fitz
from fastapi import UploadFile
from app.services.embeddings import generate_embeddings
from app.services.vectorstore import add_chunks
from app.db.crud import save_document
from app.db.database import SessionLocal


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 150):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return [c for c in chunks if c.strip()]


async def handle_upload(file: UploadFile, api_key: str, provider: str = "openai"):
    contents = await file.read()
    pdf = fitz.open(stream=contents, filetype="pdf")
    text = "".join(page.get_text() for page in pdf)
    pdf.close()

    if not text.strip():
        return {"message": "No extractable text found in PDF"}

    chunks = chunk_text(text)

    embeddings = []
    for chunk in chunks:
        try:
            result = generate_embeddings(chunk, api_key, provider)
            embeddings.append(result["embedding"])
        except Exception as e:
            return {"message": "Embedding generation failed", "error": str(e)}

    try:
        add_chunks(provider, file.filename, chunks, embeddings)
    except Exception as e:
        return {"message": "Vector store write failed", "error": str(e)}

    db = SessionLocal()
    save_document(db, file.filename, text)
    db.close()

    return {
        "message": "File processed",
        "chunks_indexed": len(chunks),
    }
