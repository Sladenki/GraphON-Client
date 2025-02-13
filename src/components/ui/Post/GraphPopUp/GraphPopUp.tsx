import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import styles from './GraphPopUp.module.scss'
import { useQuery } from '@tanstack/react-query';
import { GraphService } from '@/services/graph.service';
import PopUpWrapper from '../../PopUpWrapper/PopUpWrapper';
import { ForceGraph2D } from 'react-force-graph';
import { SpinnerLoader } from '../../SpinnerLoader/SpinnerLoader';

interface GraphPopUpProps {
  parentGraph: {
    _id: string;
    name: string;
  };
  isGraphPopupOpen: boolean;
  closeGraphPopup: () => void;
}



const GraphPopUp: FC<GraphPopUpProps> = ({ parentGraph, isGraphPopupOpen, closeGraphPopup }) => {

  const graphRef = useRef(null);

  // --- Запрос для получения всех дочерних графов, если родительский граф найден ---
  const { data: allChildrenGraphs, isPending: isChildrenLoading, isError: isChildrenError } = useQuery({
    queryKey: ['childrenGraphs', parentGraph._id],
    queryFn: () => GraphService.getAllChildrenGraphs(parentGraph._id),
    enabled: !!parentGraph.name, // Запрашиваем дочерние графы только если родительский граф существует
  });

  // --- Генерация данных для графа --- 
  const generateGraphData = () => {
    if (!allChildrenGraphs?.data) return { nodes: [], links: [] };

    const nodes = [
      {
        id: parentGraph._id,
        name: parentGraph.name,
        isParent: true,
      },
      ...allChildrenGraphs.data.map((child: any) => ({
        id: child._id,
        name: child.name,
        isParent: false,
      })),
    ];

    const links = allChildrenGraphs.data.map((child: any) => ({
      source: parentGraph._id,
      target: child._id,
    }));

    return { nodes, links };
  };

  const graphData = generateGraphData();

  
  if (isChildrenLoading) {
    return (
      <PopUpWrapper isOpen={isGraphPopupOpen} onClose={closeGraphPopup} width={800} height={600}>
        <SpinnerLoader/>
      </PopUpWrapper>
    );
  }

  if (isChildrenError) {
    return (
      <PopUpWrapper isOpen={isGraphPopupOpen} onClose={closeGraphPopup} width={800} height={600}>
        <div>Error...</div>
      </PopUpWrapper>
    );
  }
  
  return (
    <PopUpWrapper isOpen={isGraphPopupOpen} onClose={closeGraphPopup} width={800} height={600}>
      <div className={styles.graphContainer}>
        <ForceGraph2D
          // @ts-expect-error пока похуй
          ref={graphRef}
          graphData={graphData}
          width={800}
          height={500}
          nodeLabel={(node: any) => node.name} // Отображаем имя узла при наведении
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 17 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
          
            // Извлекаем цвет узла из CSS-переменной
            const color = node.isParent 
              ? getComputedStyle(document.documentElement).getPropertyValue('--parent-node') 
              : getComputedStyle(document.documentElement).getPropertyValue('--child-node');
              
            ctx.fillStyle = color.trim(); // Устанавливаем цвет узла
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.isParent ? 12 : 8, 0, 2 * Math.PI, false);
            ctx.fill();
          
            // Текстовая подпись для узла
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--main-text');; // Цвет текста
            ctx.fillText(label, node.x + 15, node.y + 5);
          }}
          linkWidth={1.5}
          linkColor={() => 'gray'} // Линии серого цвета
          enableNodeDrag={true} // Разрешаем перетаскивание узлов
          enableZoomPanInteraction={true} // Зум и панорамирование
          onNodeClick={(node: any) => {
            alert(`Вы нажали на соединение: ${node.name}`);
          }}
          onLinkClick={(node: any) => {
            alert(`Вы нажали на граф: ${node.name}`);
          }}
        />
      </div>
    </PopUpWrapper>
  );
}

export default GraphPopUp
