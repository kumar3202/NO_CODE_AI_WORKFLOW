from fastapi import FastAPI
from app.api.routes import router
from app.db.database import engine
from app.db import models
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="No-Code AI Workflow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database init deferred: {e}")

app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok"}