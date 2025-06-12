import React, { FC, useCallback, useMemo, useState } from 'react';
import styles from './GraphList.module.scss';
import GraphBlock from '../../../../../components/ui/GraphBlock/GraphBlock';
import { IGraphList } from '@/types/graph.interface';
import { useSchedulePopup } from './useSchedulePopUp';
import SchedulePopUp from '../../../../../components/ui/SchedulePopUp/SchedulePopUp';
import { useInfoGraphPopup } from './useInfoGraphPopUp copy';
import InfoGraphPopUp from '@/components/ui/InfoGraphPopUp/InfoGraphPopUp';

// Кэш для хранения состояний графов
const graphStateCache = new Map<string, { isSubscribed: boolean }>();

const GraphsList: FC<{ allGraphs: IGraphList[] }> = React.memo(({ allGraphs }) => {
  // Состояния для PopUp
  const { isSchedulePopupOpen, handleScheduleButtonClick, closeSchedulePopup } = useSchedulePopup();
  const { isInfoGraphPopupOpen, handleInfoGraphButtonClick, closeInfoGraphPopup } = useInfoGraphPopup();
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null);

  // Мемоизированные обработчики
  const handleGraphSelect = useCallback((id: string) => {
    setSelectedGraphId(id);
  }, []);

  const handleScheduleClick = useCallback((id: string) => {
    setSelectedGraphId(id);
    handleScheduleButtonClick();
  }, [handleScheduleButtonClick]);

  const handleInfoClick = useCallback((id: string) => {
    setSelectedGraphId(id);
    handleInfoGraphButtonClick();
  }, [handleInfoGraphButtonClick]);

  // Мемоизированный рендер графа
  const renderGraph = useCallback((graph: IGraphList, index: number) => {
    const cachedState = graphStateCache.get(graph._id);
    const isSubscribed = cachedState?.isSubscribed ?? graph.isSubscribed;

    return (
      <div 
        key={graph._id} 
        className={styles.graphItem}
        style={{ 
          "--delay": `${index * 0.1}s`,
        } as React.CSSProperties}
      >
        <GraphBlock 
          id={graph._id}
          name={graph.name}
          isSubToGraph={isSubscribed}
          imgPath={graph.imgPath}
          about={graph.about}
          handleScheduleButtonClick={() => handleScheduleClick(graph._id)}
          handleInfoGraphButtonClick={() => handleInfoClick(graph._id)}
          setSelectedGraphId={handleGraphSelect}
        />
      </div>
    );
  }, [handleScheduleClick, handleInfoClick, handleGraphSelect]);

  return (
    <div className={styles.postsListWrapper}>
      <div className={styles.graphsGrid}>
        {allGraphs.map((graph, index) => renderGraph(graph, index))}
      </div>

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