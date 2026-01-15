import fitz  # PyMuPDF
from fastapi import UploadFile
from app.services.embeddings import generate_embeddings
from app.db.crud import save_document
from app.db.database import SessionLocal

async def handle_upload(file: UploadFile, api_key: str, provider: str = "openai"):
    contents = await file.read()
    pdf = fitz.open(stream=contents, filetype="pdf")
    text = "".join(page.get_text() for page in pdf)

    try:
        response = generate_embeddings(text, api_key, provider)
        vectors = response["embedding"]
    except Exception as e:
        return {"message": "Embedding generation failed", "error": str(e)}

    db = SessionLocal()
    save_document(db, file.filename, text)
    db.close()

    if vectors:
        return {"message": "File processed", "tokens": len(vectors)}
    return {"message": "Embedding failed"}
