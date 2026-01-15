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
    data: { label: 'LLM Model Selection', model: 'gpt-4o-mini', apiKey: '' },
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
  const [uploadProvider, setUploadProvider] = useState('openai');

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

const runWorkflow = async () => {
  const queryNode = nodes.find((n) => n.id === '1');
  const llmNode = nodes.find((n) => n.id === '2');

  const payload = {
    nodes: [
      {
        id: 'llm-node',
        type: 'LLMEngine',
        config: {
          model: llmNode.data.model,
          api_key: llmNode.data.apiKey,
        },
      },
    ],
    edges: [],
    query: queryNode.data.query,
  };

  try {
    const response = await axios.post('http://localhost:8000/run_workflow', payload);
    const message = response.data?.response || response.data?.error || 'No response';
    
    const updated = nodes.map((node) =>
      node.id === '3'
        ? { ...node, data: { ...node.data, response: message } }
        : node
    );
    setNodes(updated);
  } catch (err) {
    const errorMessage =
      err.response?.data?.error || err.message || 'Unknown error';
    const updated = nodes.map((node) =>
      node.id === '3'
        ? { ...node, data: { ...node.data, response: `Error: ${errorMessage}` } }
        : node
    );
    setNodes(updated);
  }
};



  const uploadDocument = async () => {
    if (!uploadFile || !uploadApiKey || !uploadProvider) {
      alert('Please select file, API key and provider.');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('api_key', uploadApiKey);
    formData.append('provider', uploadProvider);

    try {
      await axios.post('http://localhost:8000/upload_document', formData);
      alert('Document uploaded.');
    } catch (err) {
      alert('Upload failed.');
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
        <select value={nodes.find((n) => n.id === '2')?.data.model} onChange={handleModelChange} style={{ width: '100%', marginBottom: 10 }}>
          <option value="gpt-4o-mini">GPT-4o Mini</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gemini-pro">Gemini Pro</option>
          <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
        </select>

        <input
          type="text"
          placeholder="LLM API Key"
          value={nodes.find((n) => n.id === '2')?.data.apiKey || ''}
          onChange={handleApiKeyChange}
          style={{ width: '100%' }}
        />

        <h3>Upload Document</h3>
        <input type="file" onChange={(e) => setUploadFile(e.target.files[0])} />
        <select value={uploadProvider} onChange={(e) => setUploadProvider(e.target.value)} style={{ width: '100%', marginTop: 5 }}>
          <option value="openai">OpenAI</option>
          <option value="gemini">Gemini</option>
        </select>
        <input
          type="text"
          placeholder="Embedding API Key"
          value={uploadApiKey}
          onChange={(e) => setUploadApiKey(e.target.value)}
          style={{ width: '100%', marginTop: 5 }}
        />
        <button onClick={uploadDocument} style={{ marginTop: 10, width: '100%' }}>
          Upload
        </button>

        <h3>Run Workflow</h3>
        <button onClick={runWorkflow} style={{ width: '100%' }}>
          Run
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
