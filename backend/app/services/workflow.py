from app.models.schemas import WorkflowRequest, LLMRequest
from app.services.llm import query_llm
from app.services.embeddings import generate_embeddings
from app.services.vectorstore import query as vector_query
from app.db.crud import save_chat_log
from app.db.database import SessionLocal


async def execute_workflow(payload: WorkflowRequest):
    context = ""
    retrieval_note = None
    chunks_used = 0
    llm_config = {}
    kb_config = None

    for node in payload.nodes:
        if node.type == "KnowledgeBase":
            kb_config = node.config
        elif node.type == "LLMEngine":
            llm_config = {
                "model": node.config.get("model", "gemini-3.6-flash"),
                "api_key": node.config.get("api_key", ""),
            }

    if not llm_config:
        return {"error": "No LLMEngine found in workflow"}

    if kb_config:
        provider = kb_config.get("provider", "openai")
        embed_key = kb_config.get("api_key") or llm_config["api_key"]
        try:
            embedded = generate_embeddings(payload.query, embed_key, provider)
            chunks = vector_query(provider, embedded["embedding"], n_results=4)
            if chunks:
                context = "\n\n".join(chunks)
                chunks_used = len(chunks)
            else:
                retrieval_note = "No documents indexed for this provider"
        except Exception as e:
            retrieval_note = f"Retrieval failed: {e}"

    llm_input = {
        "prompt": payload.query,
        "context": context,
        "model": llm_config["model"],
        "api_key": llm_config["api_key"],
    }
    result = await query_llm(LLMRequest(**llm_input))

    try:
        db = SessionLocal()
        save_chat_log(db, payload.query, result.get("response", ""), llm_config["model"])
        db.close()
    except Exception as e:
        print(f"Chat log save failed: {e}")

    result["context_chunks_used"] = chunks_used
    if retrieval_note:
        result["retrieval_note"] = retrieval_note
    return result
