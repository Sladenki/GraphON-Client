import React, { FC, useEffect, useState } from 'react'
import styles from './GraphPopUp.module.scss'
import { useQuery } from '@tanstack/react-query';
import { GraphService } from '@/services/graph.service';
import PopUpWrapper from '../../PopUpWrapper/PopUpWrapper';

const GraphPopUp: FC<{graphId: string, isGraphPopupOpen: boolean, closeGraphPopup: any}> = ({ graphId, isGraphPopupOpen, closeGraphPopup }) => {

  // Родительский граф
  const [parentGraph, setParentGraph] = useState<any>(null);

  // Дочерние графы от родительского
  const [childrenGraphs, setChildrenGraphs] = useState<any[]>([]);

  // Флаг отображения дочерних графов
  const [showChildren, setShowChildren] = useState(false);

  // Запрос для получения данных о графе
  const { isPending, isError, data: graphData, error } = useQuery({
    queryKey: ['graph', graphId],
    queryFn: () => GraphService.getGraphById(graphId),
    enabled: isGraphPopupOpen, // Выполняем запрос только при открытии pop-up
  });

  // Запрос для получения всех дочерних графов, если родительский граф найден
  const { data: allChildrenGraphs, isPending: isChildrenLoading, isError: isChildrenError } = useQuery({
    queryKey: ['childrenGraphs', graphData?.data?.parentGraphId],
    queryFn: () => GraphService.getAllChildrenGraphs(graphData?.data?.parentGraphId._id),
    enabled: !!graphData?.data?.name, // Запрашиваем дочерние графы только если родительский граф существует
  });


  useEffect(() => {
    if (graphData?.data) {
      setParentGraph(graphData.data);
    }
  }, [graphData]);

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
        {isPending && <p>Загрузка...</p>}
        {isError && <p>Ошибка при загрузке данных графа.</p>}

        {graphData && (
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
                  {!showChildren ? graphData.data.name : parentGraph?.parentGraphId?.name}
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
