import React, { useRef, useEffect, useState } from 'react';
import Tree from 'react-d3-tree';
import { useQuery } from '@tanstack/react-query';
import { GraphService } from '@/services/graph.service';
import { buildTreeData } from '@/utils/graphToTree';
import { CustomNode } from './CustomNode';
import styles from './GraphView.module.scss';
// import { useTheme } from 'next-themes'; // если есть поддержка темы

const parentGraph = {
  _id: '67a499dd08ac3c0df94d6ab7',
  name: 'КГТУ',
};

export default function HierarchyGraph({ searchQuery }: { searchQuery: string }) {
  const treeContainer = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState({ x: 400, y: 80 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // const { theme = 'light' } = useTheme() || {}; // если есть поддержка темы

  const { data: allGraphs, isPending, isError } = useQuery({
    queryKey: ['childrenGraphs', parentGraph._id],
    queryFn: () => GraphService.getAllChildrenGraphs(parentGraph._id),
    enabled: !!parentGraph.name,
  });

  const treeData = React.useMemo(() => {
    if (!allGraphs) return null;
    let filtered = allGraphs.data;
    if (searchQuery) {
      filtered = filtered.filter((g: any) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return buildTreeData(parentGraph, filtered);
  }, [allGraphs, searchQuery]);

  useEffect(() => {
    if (treeContainer.current) {
      setTranslate({
        x: treeContainer.current.offsetWidth / 2,
        y: 80,
      });
    }
  }, []);

  // Функция для получения id узла (универсально для react-d3-tree)
  function getNodeId(nodeDatum: any): string | undefined {
    return nodeDatum._id || (nodeDatum.data && nodeDatum.data._id);
  }

  if (isPending) return <div>Загрузка...</div>;
  if (isError) return <div>Ошибка загрузки</div>;
  if (!treeData) return <div>Нет данных</div>;

  // Мобильная адаптация: увеличиваем translate и высоту
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;

  return (
    <div
      ref={treeContainer}
      style={{
        width: '100vw',
        height: isMobile ? 'calc(100vh - 80px)' : '80vh',
        background: 'var(--background-color, #f7f7fa)',
        overflow: 'auto',
        borderRadius: 20,
        border: '1px dashed #aaa',
        touchAction: 'pan-x pan-y',
      }}
      className={styles.graphContainer}
    >
      <Tree
        data={treeData}
        orientation="vertical"
        translate={isMobile ? { x: window.innerWidth / 2, y: 60 } : translate}
        pathFunc="elbow"
        collapsible={true}
        zoomable={true}
        zoom={isMobile ? 0.7 : 1}
        separation={{ siblings: 1.5, nonSiblings: 2 }}
        renderCustomNodeElement={({ nodeDatum, toggleNode }) => (
          <CustomNode
            nodeDatum={nodeDatum}
            toggleNode={toggleNode}
            isSelected={selectedId === getNodeId(nodeDatum)}
            // theme={theme}
          />
        )}
        onNodeClick={(nodeDatum) => {
          const id = getNodeId(nodeDatum);
          setSelectedId(id ?? null);
        }}
        enableLegacyTransitions
        transitionDuration={400}
      />
    </div>
  );
} 