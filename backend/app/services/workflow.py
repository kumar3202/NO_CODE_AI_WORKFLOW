from app.models.schemas import WorkflowRequest, LLMRequest
from app.services.llm import query_llm
from app.db.crud import save_chat_log
from app.db.database import SessionLocal

async def execute_workflow(payload: WorkflowRequest):
    context = ""
    llm_config = {}

    for node in payload.nodes:
        if node.type == "KnowledgeBase":
            context = "Mocked context from KB"
        elif node.type == "LLMEngine":
            llm_config = {
                "model": node.config.get("model", "gpt-4"),
                "api_key": node.config.get("api_key", "")
            }

    if llm_config:
        llm_input = {
            "prompt": payload.query,
            "context": context,
            "model": llm_config["model"],
            "api_key": llm_config["api_key"]
        }
        result = await query_llm(LLMRequest(**llm_input))
        db = SessionLocal()
        save_chat_log(db, payload.query, result.get("response", ""), llm_config["model"])
        db.close()
        return result
    return {"error": "No LLMEngine found in workflow"}
