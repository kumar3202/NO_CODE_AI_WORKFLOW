# 🌐 No-Code AI Workflow Builder – Full Stack

This project enables users to visually build AI workflows using a React Flow interface that interacts with a FastAPI backend. Users can select LLMs (OpenAI or Gemini), upload documents, and get intelligent responses – all without writing any code.

* * *

## 📦 Tech Stack

### 🔹 Frontend

* *   React.js
* *   React Flow
* *   Axios
* *   Tailwind CSS _(optional)_
* *   FastAPI backend (connected via REST API)

### 🔹 Backend

* *   FastAPI  
* *   PostgreSQL  
* *   ChromaDB (Vector Store)
* *   PyMuPDF (PDF text extraction)
* *   OpenAI / Gemini APIs

* * *

## 🚀 Features

✅ Visual node-based workflow canvas using React Flow  
✅ Nodes:  
 • User Query  
 • LLM Model Selector (with API Key)  
 • Output Response (with Run button)  
✅ PDF Upload for knowledge base embedding  
✅ Dynamic Model selection (Gemini or OpenAI)  
✅ Real-time workflow execution with formatted LLM responses  
✅ Drag, zoom, pan between nodes

* * *

## 🔧 Prerequisites

* *   Node.js ≥ 16.x
* *   Python ≥ 3.9
* *   PostgreSQL running (if persistent DB is used)
* *   Backend running at `http://localhost:8000`     

* * *

## ▶️ Frontend Setup Instructions

```bash
# Navigate to frontend directory cd frontend
# Install dependencies npm install
# Start development server npm start`
```
App will be available at: `http://localhost:3000`

* * *

## ⚙️ Backend Setup Instructions

```bash

# Navigate to backend root directory cd backend
# Create virtual environment python -m venv venv source venv/bin/activate
# On Windows: venv\Scripts\activate
# Install dependencies pip install -r requirements.txt
# Run FastAPI server uvicorn app.main:app --reload`
```
API will be live at: `http://localhost:8000`

* * *

## 🔌 Backend Endpoints

### 📤 `/upload_document`

**POST**: Uploads a PDF, extracts text, stores embeddings.

**Form Data**:

* *   `file`: PDF file
* *   `api_key`: OpenAI or Gemini key
* *   `provider`: `openai` or `gemini` 

* * *

### 🧠 `/run_workflow`

**POST**: Runs the user-created workflow.

**JSON Payload**:

```json

{
  "nodes": [
    {
      "id": "llm-node",
      "type": "LLMEngine",
      "config": {
        "model": "gpt-4",
        "api_key": "YOUR_API_KEY"
      }
    }
  ],
  "edges": [],
  "query": "Your prompt"
}

```
* * *

## 🗂 Project File Structure (Simplified)

### 🔹 Backend
```
app/
├── api/
│   └── routes.py                # All API route handlers
├── services/
│   ├── document.py              # PDF upload and processing
│   ├── embeddings.py            # Embedding generation logic
│   ├── llm.py                   # LLM querying logic
│   └── workflow.py              # Executes user-defined workflows
├── db/
│   ├── database.py              # DB engine and session
│   └── models.py                # SQLAlchemy models
└── main.py                      # App entrypoint
```
### 🔹 Frontend

```
src/
├── App.js                       # Main component
├── WorkflowBuilder.js           # React Flow canvas logic

```
* * *

## 📝 Notes

* *   Supports only PDF format for document uploads.
* *   You must provide your own API keys for OpenAI or Gemini.
* *   Gemini key format: starts with `AIza...`
* *   OpenAI key format: starts with `sk-...`
* *   Errors like invalid keys or quota exceeded will be shown in the output node.

* * *

## 🧪 Swagger Docs

You can access interactive API docs here:  
[http://localhost:8000/docs](http://localhost:8000/docs)

* * *
