from fastapi import FastAPI
from app.api.routes import router
from app.db.database import engine
from app.db import models
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="No-Code AI Workflow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)
app.include_router(router)