import { useState, useCallback, useMemo } from 'react';
import { Node, Edge, useNodesState, useEdgesState, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { useQuery } from '@tanstack/react-query';
import { GraphService } from '@/services/graph.service';
import { buildGraphHierarchy } from '@/utils/grahSystem';
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction });

  // Сбрасываем граф
  dagreGraph.nodes().forEach((node) => dagreGraph.removeNode(node));

  // Добавляем узлы
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 50 });
  });

  // Добавляем ребра
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Вычисляем позиции
  dagre.layout(dagreGraph);

  // Применяем вычисленные позиции к узлам
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 100,
        y: nodeWithPosition.y - 25,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export interface GraphState {
  nodes: Node[];
  edges: Edge[];
  selectedNodes: string[];
  expandedNodes: Set<string>;
  loadingNodes: Set<string>;
  error?: Error;
}

export const useGraphState = (parentGraphId: string) => {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [loadingNodes, setLoadingNodes] = useState<Set<string>>(new Set());
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Загрузка начальных данных
  const { data: initialData, isLoading, error } = useQuery({
    queryKey: ['childrenGraphs', parentGraphId],
    queryFn: () => GraphService.getAllChildrenGraphs(parentGraphId),
    enabled: !!parentGraphId,
  });

  // Преобразование данных в формат React Flow
  const transformedData = useMemo(() => {
    if (!initialData) return { nodes: [], edges: [] };
    
    const { nodes: graphNodes, links } = buildGraphHierarchy(
      { _id: parentGraphId, name: 'КГТУ' },
      initialData.data
    );

    const initialNodes = graphNodes.map((node) => ({
      id: node.id,
      data: { label: node.name, ...node },
      position: { x: 0, y: 0 },
      type: node.isParent ? 'parentNode' : node.hasChildren ? 'intermediateNode' : 'childNode',
    }));

    const initialEdges = links.map((link) => ({
      id: `edge-${link.source}-${link.target}`,
      source: link.source,
      target: link.target,
      type: 'smoothstep',
    }));

    // Применяем автоматическое позиционирование
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);

    return {
      nodes: layoutedNodes,
      edges: layoutedEdges,
    };
  }, [initialData, parentGraphId]);

  // Обработчики изменений
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, [setNodes]);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, [setEdges]);

  // Ленивая загрузка дочерних узлов
  const loadChildren = useCallback(async (nodeId: string) => {
    if (expandedNodes.has(nodeId) || loadingNodes.has(nodeId)) return;

    setLoadingNodes((prev) => new Set(prev).add(nodeId));

    try {
      const response = await GraphService.getAllChildrenGraphs(nodeId);
      const { nodes: childNodes, links: childLinks } = buildGraphHierarchy(
        { _id: nodeId, name: '' },
        response.data
      );

      // Проверяем, какие узлы уже существуют
      const existingNodeIds = new Set(nodes.map(node => node.id));
      const existingEdgeIds = new Set(edges.map(edge => edge.id));

      const newNodes = childNodes
        .filter(node => !existingNodeIds.has(node.id))
        .map((node) => ({
          id: node.id,
          data: { label: node.name, ...node },
          position: { x: 0, y: 0 },
          type: node.hasChildren ? 'intermediateNode' : 'childNode',
        }));

      const newEdges = childLinks
        .filter(link => !existingEdgeIds.has(`edge-${link.source}-${link.target}`))
        .map((link) => ({
          id: `edge-${link.source}-${link.target}`,
          source: link.source,
          target: link.target,
          type: 'smoothstep',
        }));

      if (newNodes.length > 0 || newEdges.length > 0) {
        // Применяем автоматическое позиционирование для новых узлов
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          [...nodes, ...newNodes],
          [...edges, ...newEdges]
        );

        handleNodesChange(layoutedNodes.map(node => ({ type: 'add', item: node })));
        handleEdgesChange(layoutedEdges.map(edge => ({ type: 'add', item: edge })));
      }

      setExpandedNodes((prev) => new Set(prev).add(nodeId));
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoadingNodes((prev) => {
        const next = new Set(prev);
        next.delete(nodeId);
        return next;
      });
    }
  }, [expandedNodes, loadingNodes, handleNodesChange, handleEdgesChange, nodes, edges]);

  // Обработчики событий
  const onNodeClick = useCallback((nodeId: string) => {
    loadChildren(nodeId);
  }, [loadChildren]);

  const onSelectionChange = useCallback((selectedIds: string[]) => {
    setSelectedNodes(selectedIds);
  }, []);

  return {
    nodes,
    edges,
    selectedNodes,
    expandedNodes,
    loadingNodes,
    isLoading,
    error,
    onNodesChange: handleNodesChange,
    onEdgesChange: handleEdgesChange,
    onNodeClick,
    onSelectionChange,
    transformedData,
  };
}; 