from fastapi import APIRouter, UploadFile, File, Form
from app.services import workflow, document
from app.models.schemas import WorkflowRequest

router = APIRouter()

@router.post("/upload_document")
async def upload_document(
    file: UploadFile = File(...),
    api_key: str = Form(...),
    provider: str = Form("openai")
):
    return await document.handle_upload(file, api_key, provider)

@router.post("/run_workflow")
async def run_workflow(payload: WorkflowRequest):
    return await workflow.execute_workflow(payload)
