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
