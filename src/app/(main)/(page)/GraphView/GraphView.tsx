import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useReactFlow,
  Panel,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import styles from './GraphView.module.scss';
import { useGraphState } from '@/hooks/useGraphState';
import { ParentNode, IntermediateNode, ChildNode } from '@/components/graph/CustomNodes';
import { GraphControls } from '@/components/graph/GraphControls';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { useTheme } from '@/hooks/useTheme';

const nodeTypes = {
  parentNode: ParentNode,
  intermediateNode: IntermediateNode,
  childNode: ChildNode,
};

// Моковые данные для начального графа
const DEFAULT_GRAPH = {
  "_id": "67a49a0a08ac3c0df94d6ac3",
  "name": "КГТУ",
  "ownerUserId": "67a499dd08ac3c0df94d6ab7",
  "subsNum": 2,
  "childGraphNum": 0,
  "imgPath": "images/graphAva/klgtu.jpg",
  "isSubscribed": false
};

const GraphViewContent = ({ searchQuery }: { searchQuery: string }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [isMinimapVisible, setIsMinimapVisible] = useState(true);
  const { isDarkTheme, toggleTheme } = useTheme();
  
  const {
    nodes,
    edges,
    selectedNodes,
    isLoading,
    error,
    onNodesChange,
    onEdgesChange,
    onNodeClick,
    onSelectionChange,
    transformedData,
  } = useGraphState(DEFAULT_GRAPH._id);

  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // Инициализация данных
  useEffect(() => {
    if (transformedData.nodes.length > 0) {
      const nodeChanges: NodeChange[] = transformedData.nodes.map(node => ({
        type: 'add',
        item: node,
      }));
      const edgeChanges: EdgeChange[] = transformedData.edges.map(edge => ({
        type: 'add',
        item: edge,
      }));
      
      onNodesChange(nodeChanges);
      onEdgesChange(edgeChanges);
    }
  }, [transformedData, onNodesChange, onEdgesChange]);

  // Фильтрация по поиску
  const filteredNodes = React.useMemo(() => {
    if (!searchQuery) return nodes;
    return nodes.filter((node) =>
      node.data.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [nodes, searchQuery]);

  const filteredEdges = React.useMemo(() => {
    if (!searchQuery) return edges;
    const validNodeIds = new Set(filteredNodes.map((node) => node.id));
    return edges.filter(
      (edge) => validNodeIds.has(edge.source) && validNodeIds.has(edge.target)
    );
  }, [edges, filteredNodes, searchQuery]);

  // Обработчики событий
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    onNodeClick(node.id);
  }, [onNodeClick]);

  const handleSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    onSelectionChange(nodes.map((node) => node.id));
  }, [onSelectionChange]);

  const handleGroupSelected = useCallback(() => {
    // TODO: Реализовать группировку выбранных узлов
  }, []);

  const handleUngroupSelected = useCallback(() => {
    // TODO: Реализовать разгруппировку выбранных узлов
  }, []);

  const handleClearSelection = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  if (isLoading) return <SpinnerLoader />;
  if (error) return <div className={styles.error}>Ошибка загрузки графа: {error.message}</div>;

  return (
    <div className={styles.graphWrapper} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onSelectionChange={handleSelectionChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
        {isMinimapVisible && <MiniMap />}
        
        <Panel position="top-right">
          <GraphControls
            onZoomIn={() => zoomIn()}
            onZoomOut={() => zoomOut()}
            onFitView={() => fitView()}
            onToggleMinimap={() => setIsMinimapVisible(!isMinimapVisible)}
            onToggleTheme={toggleTheme}
            onGroupSelected={handleGroupSelected}
            onUngroupSelected={handleUngroupSelected}
            onClearSelection={handleClearSelection}
            selectedCount={selectedNodes.length}
            isMinimapVisible={isMinimapVisible}
            isDarkTheme={isDarkTheme}
          />
        </Panel>
      </ReactFlow>
    </div>
  );
};

const GraphView = (props: { searchQuery: string }) => {
  return (
    <ReactFlowProvider>
      <GraphViewContent {...props} />
    </ReactFlowProvider>
  );
};

export default GraphView;