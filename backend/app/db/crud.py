from sqlalchemy.orm import Session
from app.db import models

def save_document(db: Session, filename: str, content: str):
    doc = models.Document(filename=filename, content=content)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

def save_chat_log(db: Session, user_query: str, response: str, model: str):
    log = models.ChatLog(user_query=user_query, response=response, model=model)
    db.add(log)
    db.commit()
    return log

def save_workflow(db: Session, name: str, definition: dict):
    wf = models.Workflow(name=name, definition=definition)
    db.add(wf)
    db.commit()
    return wf
