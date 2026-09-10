import React, { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'User Query', query: '' },
    position: { x: 50, y: 50 },
  },
  {
    id: '2',
    type: 'default',
    data: { label: 'LLM Model Selection', model: 'gemini-3.6-flash', apiKey: '' },
    position: { x: 50, y: 200 },
  },
  {
    id: '3',
    type: 'output',
    data: { label: 'Output', response: '', onRun: null },
    position: { x: 50, y: 400 },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadApiKey, setUploadApiKey] = useState('');
  const [uploadProvider, setUploadProvider] = useState('gemini');
  const [uploading, setUploading] = useState(false);
  const [running, setRunning] = useState(false);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const handleQueryChange = (e) => {
    const updated = nodes.map((node) =>
      node.id === '1' ? { ...node, data: { ...node.data, query: e.target.value } } : node
    );
    setNodes(updated);
  };

  const handleModelChange = (e) => {
    const updated = nodes.map((node) =>
      node.id === '2' ? { ...node, data: { ...node.data, model: e.target.value } } : node
    );
    setNodes(updated);
  };

  const handleApiKeyChange = (e) => {
    const updated = nodes.map((node) =>
      node.id === '2' ? { ...node, data: { ...node.data, apiKey: e.target.value } } : node
    );
    setNodes(updated);
  };

  const setOutput = (text) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === '3' ? { ...node, data: { ...node.data, response: text } } : node
      )
    );
  };

  const runWorkflow = async () => {
    const queryNode = nodes.find((n) => n.id === '1');
    const llmNode = nodes.find((n) => n.id === '2');

    if (!queryNode?.data.query?.trim()) {
      alert('Please enter a query.');
      return;
    }
    if (!llmNode?.data.apiKey) {
      alert('Please enter an LLM API key.');
      return;
    }

    const workflowNodes = [
      {
        id: 'llm-node',
        type: 'LLMEngine',
        config: {
          model: llmNode.data.model,
          api_key: llmNode.data.apiKey,
        },
      },
    ];

    if (uploadApiKey) {
      workflowNodes.unshift({
        id: 'kb-node',
        type: 'KnowledgeBase',
        config: {
          provider: uploadProvider,
          api_key: uploadApiKey,
        },
      });
    }

    const payload = {
      nodes: workflowNodes,
      edges: [],
      query: queryNode.data.query,
    };

    setRunning(true);
    setOutput('Running...');

    try {
      const response = await axios.post(`${API_URL}/run_workflow`, payload);
      const message = response.data?.response || response.data?.error || 'No response';
      const note = response.data?.retrieval_note;
      const used = response.data?.context_chunks_used;

      let suffix = '';
      if (note) {
        suffix = `\n\n[${note}]`;
      } else if (used > 0) {
        suffix = `\n\n[Answered using ${used} document chunk${used === 1 ? '' : 's'}]`;
      }

      setOutput(message + suffix);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      setOutput(`Error: ${errorMessage}`);
    } finally {
      setRunning(false);
    }
  };

  const uploadDocument = async () => {
    if (!uploadFile || !uploadApiKey || !uploadProvider) {
      alert('Please select a file, API key and provider.');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('api_key', uploadApiKey);
    formData.append('provider', uploadProvider);

    setUploading(true);

    try {
      const res = await axios.post(`${API_URL}/upload_document`, formData);
      if (res.data?.error) {
        alert(`Upload failed: ${res.data.error}`);
      } else {
        alert(`${res.data.message} (${res.data.chunks_indexed ?? 0} chunks indexed)`);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex' }}>
      <div style={{ width: '75%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      <div style={{ width: '45%', padding: 20, backgroundColor: '#f5f5f5', overflowY: 'auto' }}>
        <h3>User Query</h3>
        <textarea
          value={nodes.find((n) => n.id === '1')?.data.query || ''}
          onChange={handleQueryChange}
          rows={4}
          style={{ width: '100%' }}
        />

        <h3>LLM Config</h3>
        <select
          value={nodes.find((n) => n.id === '2')?.data.model}
          onChange={handleModelChange}
          style={{ width: '100%', marginBottom: 10 }}
        >
          <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
          <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash Lite</option>
          <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
          <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
          <option value="gpt-4o-mini">GPT-4o Mini</option>
        </select>

        <input
          type="password"
          placeholder="LLM API Key"
          value={nodes.find((n) => n.id === '2')?.data.apiKey || ''}
          onChange={handleApiKeyChange}
          style={{ width: '100%' }}
        />

        <h3>Upload Document</h3>
        <input type="file" accept="application/pdf" onChange={(e) => setUploadFile(e.target.files[0])} />
        <select
          value={uploadProvider}
          onChange={(e) => setUploadProvider(e.target.value)}
          style={{ width: '100%', marginTop: 5 }}
        >
          <option value="gemini">Gemini</option>
          <option value="openai">OpenAI</option>
        </select>
        <input
          type="password"
          placeholder="Embedding API Key"
          value={uploadApiKey}
          onChange={(e) => setUploadApiKey(e.target.value)}
          style={{ width: '100%', marginTop: 5 }}
        />
        <button onClick={uploadDocument} disabled={uploading} style={{ marginTop: 10, width: '100%' }}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>

        <h3>Run Workflow</h3>
        <button onClick={runWorkflow} disabled={running} style={{ width: '100%' }}>
          {running ? 'Running...' : 'Run'}
        </button>

        <h4>Response</h4>
        <div
          style={{
            whiteSpace: 'pre-wrap',
            backgroundColor: '#fff',
            padding: 10,
            border: '1px solid #ccc',
            borderRadius: 5,
            marginTop: 5,
            height: 200,
            overflowY: 'auto',
          }}
        >
          {nodes.find((n) => n.id === '3')?.data.response || 'No response yet.'}
        </div>
      </div>
    </div>
  );
}

export default WorkflowBuilder;
