import React, { useCallback, useState, useMemo, Suspense, lazy } from 'react';
import styles from './GraphList.module.scss';
import GraphBlock from '../../../../../components/ui/GraphBlock/GraphBlock';
import { IGraphList } from '@/types/graph.interface';
import { useSchedulePopup } from './useSchedulePopUp';
import { useInfoGraphPopup } from './useInfoGraphPopUp copy';

// Lazy loading для PopUp компонентов
// const SchedulePopUp = lazy(() => import('../../../../../components/ui/SchedulePopUp/SchedulePopUp'));
// const InfoGraphPopUp = lazy(() => import('@/components/ui/InfoGraphPopUp/InfoGraphPopUp'));

import SchedulePopUp from '../../../../../components/ui/SchedulePopUp/SchedulePopUp';
import InfoGraphPopUp from '@/components/ui/InfoGraphPopUp/InfoGraphPopUp';


interface GraphsListProps {
  allGraphs: IGraphList[];
}

// Мемоизированный компонент графа
const GraphItem = React.memo<{
  graph: IGraphList;
  index: number;
  onScheduleClick: (id: string) => void;
  onInfoClick: (id: string) => void;
}>(({ graph, index, onScheduleClick, onInfoClick }) => (
  <div 
    className={styles.graphItem}
    style={{ 
      "--delay": `${Math.min(index * 0.02, 0.5)}s`, // Ограничиваем задержку для лучшей производительности
    } as React.CSSProperties}
  >
    <GraphBlock 
      id={graph._id}
      name={graph.name}
      isSubToGraph={graph.isSubscribed}
      imgPath={graph.imgPath}
      about={graph.about}
      handleScheduleButtonClick={() => onScheduleClick(graph._id)}
      handleInfoGraphButtonClick={() => onInfoClick(graph._id)}
    />
  </div>
));
GraphItem.displayName = 'GraphItem';

// Простая сетка графов (возвращаем оригинальную логику)
const GraphsGrid = React.memo<{
  graphs: IGraphList[];
  onScheduleClick: (id: string) => void;
  onInfoClick: (id: string) => void;
}>(({ graphs, onScheduleClick, onInfoClick }) => (
  <div className={styles.graphsGrid}>
    {graphs.map((graph, index) => (
      <GraphItem
        key={graph._id}
        graph={graph}
        index={index}
        onScheduleClick={onScheduleClick}
        onInfoClick={onInfoClick}
      />
    ))}
  </div>
));
GraphsGrid.displayName = 'GraphsGrid';

const GraphsList: React.FC<GraphsListProps> = React.memo(({ allGraphs }) => {
  // Состояния для PopUp
  const { isSchedulePopupOpen, handleScheduleButtonClick, closeSchedulePopup } = useSchedulePopup();
  const { isInfoGraphPopupOpen, handleInfoGraphButtonClick, closeInfoGraphPopup } = useInfoGraphPopup();
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null);

  // Мемоизированные обработчики
  const handleScheduleClick = useCallback((id: string) => {
    setSelectedGraphId(id);
    handleScheduleButtonClick();
  }, [handleScheduleButtonClick]);

  const handleInfoClick = useCallback((id: string) => {
    setSelectedGraphId(id);
    handleInfoGraphButtonClick();
  }, [handleInfoGraphButtonClick]);

  return (
    <div className={styles.postsListWrapper}>
      <GraphsGrid
        graphs={allGraphs}
        onScheduleClick={handleScheduleClick}
        onInfoClick={handleInfoClick}
      />

      {/* Модальные окна */}
      {isSchedulePopupOpen && selectedGraphId && (
        <SchedulePopUp 
          graphId={selectedGraphId} 
          isSchedulePopupOpen={isSchedulePopupOpen} 
          closeSchedulePopup={closeSchedulePopup} 
        />
      )}

      {isInfoGraphPopupOpen && selectedGraphId && (
        <InfoGraphPopUp 
          graphId={selectedGraphId} 
          isInfoGraphPopupOpen={isInfoGraphPopupOpen} 
          closeInfoGraphPopup={closeInfoGraphPopup} 
        />
      )}
    </div>
  );
});

GraphsList.displayName = 'GraphsList';

export default GraphsList;