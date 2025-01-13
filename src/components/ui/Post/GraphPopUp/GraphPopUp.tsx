import React, { FC, useEffect, useState } from 'react'
import styles from './GraphPopUp.module.scss'
import { useQuery } from '@tanstack/react-query';
import { GraphService } from '@/services/graph.service';
import PopUpWrapper from '../../PopUpWrapper/PopUpWrapper';
import { Controls, Edge, MiniMap, ReactFlow, ReactFlowProvider } from '@xyflow/react';
import CustomNode from './CustomNode';

interface GraphPopUpProps {
  parentGraph: {
    _id: string;
    name: string;
  };
  isGraphPopupOpen: boolean;
  closeGraphPopup: () => void;
}

// const GraphPopUp: FC<GraphPopUpProps> = ({ parentGraph, isGraphPopupOpen, closeGraphPopup }) => {
//   const [childrenGraphs, setChildrenGraphs] = useState<any[]>([]);

//   const { data: allChildrenGraphs, isLoading: isChildrenLoading, isError: isChildrenError } = useQuery({
//       queryKey: ['childrenGraphs', parentGraph?._id], // Используем optional chaining
//       queryFn: () => GraphService.getAllChildrenGraphs(parentGraph!._id), // Используем non-null assertion, так как enabled гарантирует наличие parentGraph._id
//       enabled: !!parentGraph?._id, // Проверяем наличие parentGraph и _id
//   });

//   useEffect(() => {
//       if (allChildrenGraphs) {
//           setChildrenGraphs(allChildrenGraphs.data);
//       }
//   }, [allChildrenGraphs]);

//   let defaultNodes: Node[] = [];
//   let defaultEdges: Edge[] = [];

//   if (parentGraph) { // Проверяем, существует ли parentGraph
//       defaultNodes = [
//           {
//               id: parentGraph._id,
//               data: { label: parentGraph.name },
//               position: { x: 250, y: 100 },
//               type: 'default',
//           },
//           ...childrenGraphs.map((child, index) => ({
//               id: child._id,
//               data: { label: child.name },
//               position: {
//                   x: 250 + Math.cos((index / childrenGraphs.length) * 2 * Math.PI) * 200,
//                   y: 100 + Math.sin((index / childrenGraphs.length) * 2 * Math.PI) * 200,
//               },
//               type: 'default',
//           })),
//       ] ;

//       defaultEdges = childrenGraphs.map(child => ({
//           id: `e${parentGraph._id}-${child._id}`,
//           source: parentGraph._id,
//           target: child._id,
//           animated: true,
//           style: { stroke: '#007BFF', strokeWidth: 2 },
//       }));
//   }



//   return (
//       <PopUpWrapper isOpen={isGraphPopupOpen} onClose={closeGraphPopup} width={800} height={600}>
          
//               <ReactFlow
//                 style={{ }}
//                   nodes={defaultNodes}
//                   edges={defaultEdges}
//                   style={{ height: '500px', width: '100%', backgroundColor: "#F7F9FB" , border: '1px solid red' }}
//                   nodeTypes={{ custom: CustomNode }}
//               >
//               </ReactFlow>

//       </PopUpWrapper>
//   );
// };

// export default GraphPopUp;






const GraphPopUp: FC<GraphPopUpProps> = ({ parentGraph, isGraphPopupOpen, closeGraphPopup }) => {

  // Дочерние графы от родительского
  const [childrenGraphs, setChildrenGraphs] = useState<any[]>([]);

  // Флаг отображения дочерних графов
  const [showChildren, setShowChildren] = useState(false);

  // Запрос для получения всех дочерних графов, если родительский граф найден
  const { data: allChildrenGraphs, isPending: isChildrenLoading, isError: isChildrenError } = useQuery({
    queryKey: ['childrenGraphs', parentGraph._id],
    queryFn: () => GraphService.getAllChildrenGraphs(parentGraph._id),
    enabled: !!parentGraph.name, // Запрашиваем дочерние графы только если родительский граф существует
  });


  useEffect(() => {
    if (allChildrenGraphs) {
      setChildrenGraphs(allChildrenGraphs.data);
    }
  }, [allChildrenGraphs]);

  useEffect(() => {
    // Обработчик события прокрутки колёсика мышки
    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY > 0) {
        // Скролл вниз: показываем дочерние графы
        setShowChildren(true);
      } else if (event.deltaY < 0) {
        // Скролл вверх: скрываем дочерние графы
        setShowChildren(false);
      }
    };

    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);



  return (
    <PopUpWrapper isOpen={isGraphPopupOpen} onClose={closeGraphPopup}>
  
      {parentGraph && (
        <div>
          {/* SVG для отображения графа */}
          <div className={styles.graphContainer}>
            <svg
              viewBox="0 0 100 100"
              className={styles.graphSvg}
            >
              <path
                d="M10,30 Q40,5 70,30 T90,70 Q60,95 30,70 T10,30"
                fill="none"
                stroke="#007BFF"
                strokeWidth="2"
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                fill="#007BFF"
                fontSize="10"
                dy=".3em"
              >
                {parentGraph.name}
              </text>
            </svg>
          </div>

          {/* Отображение дочерних графов при необходимости */}
          {showChildren && childrenGraphs.length > 0 && (
            <div className={styles.graphContainer}>
              {childrenGraphs.map((childGraph, index) => {
                const angle = (index / childrenGraphs.length) * 2 * Math.PI;
                const radius = 50;
                const x = 50 + Math.cos(angle) * radius;
                const y = 50 + Math.sin(angle) * radius;

                return (
                  <svg
                    key={childGraph.id}
                    viewBox="0 0 100 100"
                    className={styles.graphSvg}
                    style={{
                      position: 'absolute',
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%) scale(0.7)',
                    }}
                  >
                    <path
                      d="M10,30 Q40,5 70,30 T90,70 Q60,95 30,70 T10,30"
                      fill="none"
                      stroke="#FF5733"
                      strokeWidth="2"
                    />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      fill="#FF5733"
                      fontSize="10"
                      dy=".3em"
                    >
                      {childGraph.name}
                    </text>
                  </svg>
                );
              })}
            </div>
          )}

          </div>
        )}
     </PopUpWrapper>
  )
}

export default GraphPopUp
