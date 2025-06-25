import React from 'react';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { EmptyState } from '@/components/global/EmptyState/EmptyState';

import GraphsList from './GraphsList/GraphsList';
import styles from './AllGraphs.module.scss';
import { useAllGraphsOptimization } from './useAllGraphsOptimized';
import { useSearchQuery, useSelectedGraphId } from '@/stores/useUIStore';

interface AllGraphsProps {
  // Больше не нужны props, так как используем Zustand
}

// Мемоизированные компоненты состояний
const LoadingComponent = React.memo(() => (
  <div className={styles.loaderWrapper}>
    <SpinnerLoader />
  </div>
));
LoadingComponent.displayName = 'LoadingComponent';

const NoSearchResultsComponent = React.memo(() => (
  <EmptyState
    message="Ничего не найдено"
    subMessage="Попробуйте изменить параметры поиска или посмотреть все доступные группы"
    emoji="🔍"
  />
));
NoSearchResultsComponent.displayName = 'NoSearchResultsComponent';

const ErrorComponent = React.memo<{ onRetry: () => void }>(({ onRetry }) => (
  <div className={styles.error}>
    <div className={styles.errorIcon}>⚠️</div>
    <div className={styles.errorText}>Ошибка загрузки данных</div>
    <button className={styles.retryButton} onClick={onRetry}>
      Повторить
    </button>
  </div>
));
ErrorComponent.displayName = 'ErrorComponent';

// Мемоизированный компонент списка графов
const GraphsListWrapper = React.memo<{ graphs: any[] }>(({ graphs }) => (
  <div className={styles.graphsListWrapper}>
    <GraphsList allGraphs={graphs} />
  </div>
));
GraphsListWrapper.displayName = 'GraphsListWrapper';

export const AllGraphsOptimized: React.FC<AllGraphsProps> = React.memo(() => {
  // Используем Zustand store
  const searchQuery = useSearchQuery();
  const selectedGraphId = useSelectedGraphId();
  
  const { 
    filteredGraphs, 
    allGraphs, 
    handleRetry, 
    loadingState, 
    loaderRef 
  } = useAllGraphsOptimization({ 
    searchQuery, 
    selectedGraphId: selectedGraphId || '' 
  });

  // Early returns для различных состояний
  if (loadingState.hasError) {
    return <ErrorComponent onRetry={handleRetry} />;
  }

  if (loadingState.noSearchResults) {
    return <NoSearchResultsComponent />;
  }

  return (
    <div className={styles.postsList}>
      {loadingState.isLoading && <LoadingComponent />}
      
      {loadingState.hasData && (
        <GraphsListWrapper graphs={filteredGraphs} />
      )}
      
      <div ref={loaderRef} />
    </div>
  );
});

AllGraphsOptimized.displayName = 'AllGraphsOptimized'; 