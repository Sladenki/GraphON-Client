import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from './GraphView.module.scss'
import { useQuery } from '@tanstack/react-query';
import { GraphService } from '@/services/graph.service';

import { ForceGraph2D } from 'react-force-graph';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { useGraphInfoPopup } from './useGraphInfoPopUp';
import { buildGraphHierarchy } from '@/utils/grahSystem';
import SchedulePopUp from '@/components/ui/SchedulePopUp/SchedulePopUp';

interface GraphInfo {
  id: string;
  name: string;
  isParent: boolean;
  hasChildren: boolean;
  __indexColor: string;
  index: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const parentGraph = {
  "_id": "67a49a0a08ac3c0df94d6ac3",
  "name": "КГТУ",
  "ownerUserId": "67a499dd08ac3c0df94d6ab7",
  "subsNum": 2,
  "childGraphNum": 0,
  "imgPath": "images/graphAva/klgtu.jpg",
  "isSubscribed": false
}


const GraphView = ({ searchQuery }: { searchQuery: string}) => {

  // --- Инфа о графе по клику --- 
  const { isGraphInfoPopupOpen, handleGraphInfoButtonClick, closeGraphInfoPopup } = useGraphInfoPopup();
  const [clickedInfoGraph, setClickedInfoGraph] = useState<GraphInfo | null>(null);
  const graphRef = useRef(null);


  // --- Запрос для получения всех дочерних графов, если родительский граф найден ---
  const { data: allGraphs, isPending: isChildrenLoading, isError: isChildrenError } = useQuery({
    queryKey: ['childrenGraphs', parentGraph._id],
    queryFn: () => GraphService.getAllChildrenGraphs(parentGraph._id),
    enabled: !!parentGraph.name, // Запрашиваем дочерние графы только если родительский граф существует
  });


  // --- Генерация данных для графа ---
  const graphData = useMemo(() => {
    // @ts-expect-error типизация
    return allGraphs ? buildGraphHierarchy(parentGraph, allGraphs.data) : { nodes: [], links: [] };
  }, [allGraphs]);

  const filteredGraphData = useMemo(() => {

    // Фильтруем узлы, чьи name содержат searchQuery
    const filteredNodes = graphData.nodes.filter((node) =>
      node.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Создаём Set с id отфильтрованных узлов
    const validNodeIds = new Set(filteredNodes.map((node: any) => node.id));

    // Фильтруем связи, которые связаны с отфильтрованными узлами
    const filteredLinks = graphData.links.filter(
      (link) => validNodeIds.has(link.source) && validNodeIds.has(link.target)
    );

    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, searchQuery]);


  // --- Установка масштаба графа ---
  useEffect(() => {
    if (graphRef.current) {
      // @ts-expect-error не ебу
      graphRef.current.zoom(4); 
    }
  }, [filteredGraphData]); // Вызываем, когда данные графа обновляются
    

  const clickedGraph = (data: any) => {
    handleGraphInfoButtonClick()
    setClickedInfoGraph(data)
  }

  if (isChildrenLoading) return <SpinnerLoader />;
  if (isChildrenError) return <div>Error...</div>;
  
  return (
    <div className={styles.graphWrapper}>
      <div className={styles.graphContainer}>
        <ForceGraph2D
          // @ts-expect-error пока похуй
          ref={graphRef}
          graphData={filteredGraphData}
          nodeLabel={(node: any) => node.name} // Отображаем имя узла при наведении
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 13 / globalScale;
            ctx.font = `${fontSize}px Roboto`;
            
        
            let color;
            let radius;

            if (node.isParent) {
              color = getComputedStyle(document.documentElement).getPropertyValue('--parent-node');
              radius = 17; // Радиус для родительского узла
            } else if (node.hasChildren) {
              color = getComputedStyle(document.documentElement).getPropertyValue('--intermediate-node'); // Новый цвет
              radius = 11; // Радиус для промежуточного узла
            } else {
              color = getComputedStyle(document.documentElement).getPropertyValue('--child-node');
              radius = 6; // Радиус для дочернего узла
            }
        
            ctx.fillStyle = color.trim();
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
            ctx.fill();

            // Рисуем пунктирную обводку
            ctx.setLineDash([4, 2]); // Пунктирная линия (4px линия, 2px пробел)
            ctx.strokeStyle = 'black'; // Цвет обводки
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // Подсветка узлов при наведении
            ctx.strokeStyle = 'black'; // Обводка
            ctx.lineWidth = 0.5;
            ctx.stroke();

             // Отрисовка текста ближе к узлу
            const labelOffset = radius + 5; // Смещение метки ближе к узлу
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--main-text');
            ctx.fillText(label, node.x + labelOffset, node.y);
          }}
          linkWidth={1.5}
          linkColor={() => 'gray'} // Линии серого цвета
          enableNodeDrag={true} // Разрешаем перетаскивание узлов
          enableZoomPanInteraction={true} // Зум и панорамирование
          onNodeClick={(node: any) => {
            clickedGraph(node)
          }}
        />
      </div>

      {isGraphInfoPopupOpen && clickedInfoGraph && (
        <SchedulePopUp
          graphId={clickedInfoGraph.id}
          isSchedulePopupOpen={isGraphInfoPopupOpen}
          closeSchedulePopup={closeGraphInfoPopup}
        />
      )}

    </div>


  );
}

export default GraphView