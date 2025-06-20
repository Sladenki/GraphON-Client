import React from 'react';
import { 
  LoadingWithWrapper,
  NoSearchResultsComponent,
  EmptyEventsComponent,
  ErrorComponent 
} from '@/components/ui/StateComponents';
import { useSubsOptimized } from './useSubsOptimized';
import VirtualizedEventsList from '../EventsList/VirtualizedEventsList';
import styles from './Subs.module.scss';

interface SubsOptimizedProps {
  searchQuery: string;
}

const SubsOptimized: React.FC<SubsOptimizedProps> = React.memo(({ searchQuery }) => {
  const {
    filteredEvents,
    handleDelete,
    handleRetry,
    loadingState,
    error
  } = useSubsOptimized({ searchQuery });

  // Early returns для различных состояний
  if (loadingState.hasError) {
    return (
      <ErrorComponent 
        onRetry={handleRetry} 
        className={styles.error}
      />
    );
  }

  if (loadingState.isFirstLoad || loadingState.isLoading) {
    return <LoadingWithWrapper className={styles.loaderWrapper} />;
  }

  if (loadingState.noSearchResults) {
    return <NoSearchResultsComponent entityName="мероприятия" />;
  }

  if (loadingState.isEmpty) {
    return <EmptyEventsComponent />;
  }

  // Используем виртуализацию для больших списков
  return (
    <VirtualizedEventsList 
      events={filteredEvents} 
      onDelete={handleDelete}
      itemHeight={420} // Высота карточки события + отступы
      containerHeight={typeof window !== 'undefined' ? window.innerHeight - 200 : 600}
    />
  );
});

SubsOptimized.displayName = 'SubsOptimized';

export default SubsOptimized; 