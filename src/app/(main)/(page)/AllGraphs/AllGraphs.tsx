import { FC, useMemo, useCallback, useEffect } from 'react';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { useFetchBunchData } from '@/hooks/useFetchBunchData';
import styles from './AllGraphs.module.scss';
import GraphsList from '@/app/(main)/(page)/AllGraphs/GraphsList/GraphsList';
import { useQueryClient } from '@tanstack/react-query';
import { EmptyState } from '@/components/global/EmptyState/EmptyState';

// Кэш для хранения отфильтрованных данных
const filterCache = new Map<string, any[]>();

interface AllGraphsProps {
  searchQuery: string;
  selectedGraphId: string;
}

export const AllGraphs: FC<AllGraphsProps> = ({ searchQuery, selectedGraphId }) => {
  const queryClient = useQueryClient();
  
  // Кэшируем запрос с помощью React Query
  const { 
    allPosts: allGraphs, 
    isPostsFetching, 
    isEndPosts, 
    loaderRef, 
    error 
  } = useFetchBunchData(
    `graph/getAllChildrenGraphs/${selectedGraphId}`,
    [],
    true
  );

  // Оптимизированная фильтрация с кэшированием
  const filteredGraphs = useMemo(() => {
    const cacheKey = `${selectedGraphId}-${searchQuery}`;
    
    if (filterCache.has(cacheKey)) {
      return filterCache.get(cacheKey) || [];
    }

    const filtered = !searchQuery 
      ? allGraphs 
      : allGraphs.filter((graph) =>
          graph.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

    filterCache.set(cacheKey, filtered);
    return filtered;
  }, [allGraphs, searchQuery, selectedGraphId]);

  // Очистка кэша при изменении selectedGraphId
  useEffect(() => {
    return () => {
      filterCache.clear();
    };
  }, [selectedGraphId]);

  // Оптимизированный рендер пустого состояния
  const renderEmptyState = useCallback((message: string, subMessage: string, emoji: string = '🎉') => (
    <EmptyState
      message={message}
      subMessage={subMessage}
      emoji={emoji}
    />
  ), []);

  // Оптимизированный рендер ошибки
  const renderError = useCallback(() => (
    <div className={styles.error}>
      <div className={styles.errorIcon}>⚠️</div>
      <div className={styles.errorText}>Ошибка загрузки данных</div>
      <button 
        className={styles.retryButton}
        onClick={() => queryClient.invalidateQueries({ queryKey: ['graph', selectedGraphId] })}
      >
        Повторить
      </button>
    </div>
  ), [queryClient, selectedGraphId]);

  if (error) {
    return renderError();
  }

  if (filteredGraphs.length === 0 && searchQuery) {
    return renderEmptyState(
      'Ничего не найдено',
      'Попробуйте изменить параметры поиска или посмотреть все доступные группы',
      '🔍'
    );
  }

  return (
    <div className={styles.postsList}>
      {isPostsFetching && !isEndPosts && (
        <div className={styles.loaderWrapper}>
          <SpinnerLoader />
        </div>
      )}
      
      {allGraphs.length > 0 && (
        <div className={styles.graphsListWrapper}>
          <GraphsList 
            allGraphs={filteredGraphs} 
          />
        </div>
      )}
      <div ref={loaderRef} />
    </div>
  );
}; 