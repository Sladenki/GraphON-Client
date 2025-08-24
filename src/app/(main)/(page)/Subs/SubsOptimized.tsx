import React from 'react';
import { 
  LoadingWithWrapper,
  NoSearchResultsComponent,
  EmptyEventsComponent,
  ErrorComponent 
} from '@/components/ui/StateComponents';
import { useSubsOptimized } from './useSubsOptimized';
import { useAuth } from '@/providers/AuthProvider';
import VirtualizedEventsList from '../EventsList/VirtualizedEventsList';
import { useSearchQuery } from '@/stores/useUIStore';
import styles from './Subs.module.scss';

interface SubsOptimizedProps {
  // Больше не нужны props, так как используем Zustand
}

const SubsOptimized: React.FC<SubsOptimizedProps> = React.memo(() => {
  const { user } = useAuth();
  
  // Используем Zustand store
  const searchQuery = useSearchQuery();
  
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

  // Основной контейнер с заголовком - показываем всегда если есть подписки
  return (
    <div className={styles.subsContainer}>
      {/* {user?.graphSubsNum && user.graphSubsNum > 0 && (
        <div className={styles.subsHeader}>
          <div className={styles.subsCount}>
            <span className={styles.subsCountIcon}>📊</span>
            <span className={styles.subsCountText}>
              Подписан на <strong>{user.graphSubsNum}</strong> {
                user.graphSubsNum === 1 ? 'граф' :
                user.graphSubsNum >= 2 && user.graphSubsNum <= 4 ? 'графа' :
                'графов'
              }
            </span>
          </div>
        </div>
      )} */}
      
      {loadingState.isEmpty ? (
        <EmptyEventsComponent />
      ) : (
        <VirtualizedEventsList 
          events={filteredEvents} 
          onDelete={handleDelete}
          itemHeight={420} // Высота карточки события + отступы
          containerHeight={typeof window !== 'undefined' ? window.innerHeight - 250 : 600} // Увеличил отступ для заголовка
        />
      )}
    </div>
  );
});

SubsOptimized.displayName = 'SubsOptimized';

export default SubsOptimized; 