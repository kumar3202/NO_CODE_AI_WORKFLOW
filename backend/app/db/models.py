from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.db.database import Base

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    content = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

class Workflow(Base):
    __tablename__ = "workflows"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    definition = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())

class ChatLog(Base):
    __tablename__ = "chat_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_query = Column(Text)
    response = Column(Text)
    model = Column(String)
    created_at = Column(DateTime, server_default=func.now())