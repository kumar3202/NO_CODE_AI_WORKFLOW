from pydantic import BaseModel
from typing import Optional, List, Dict

class NodeConfig(BaseModel):
    id: str
    type: str
    config: Dict

class Edge(BaseModel):
    source: str
    target: str

class WorkflowRequest(BaseModel):
    nodes: List[NodeConfig]
    edges: List[Edge]
    query: str

class LLMRequest(BaseModel):
    prompt: str
    context: Optional[str] = None
    model: str
    api_key: str