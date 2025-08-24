import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useFetchBunchData } from '@/hooks/useFetchBunchData';
import { useDebounce } from '@/hooks/useDebounce';

interface UseAllGraphsOptimizationProps {
  searchQuery: string;
  selectedGraphId: string;
}

export const useAllGraphsOptimization = ({ 
  searchQuery, 
  selectedGraphId 
}: UseAllGraphsOptimizationProps) => {
  const queryClient = useQueryClient();
  
  // Дебаунсинг поискового запроса для лучшей производительности
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Оптимизированный запрос данных
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

  // Оптимизированная фильтрация с дебаунсингом
  const filteredGraphs = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return allGraphs;
    }

    const query = debouncedSearchQuery.toLowerCase().trim();
    
    return allGraphs.filter((graph) => {
      if (!graph?.name) return false;
      
      const graphName = graph.name.toLowerCase();
      
      // Быстрый поиск для коротких запросов
      if (query.length <= 2) {
        return graphName.startsWith(query);
      }
      
      // Для длинных запросов используем includes
      return graphName.includes(query);
    });
  }, [allGraphs, debouncedSearchQuery]);

  // Мемоизированный обработчик повтора запроса
  const handleRetry = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: ['graph', selectedGraphId] 
    });
  }, [queryClient, selectedGraphId]);

  // Мемоизированные состояния с учетом дебаунсинга
  const loadingState = useMemo(() => ({
    isLoading: isPostsFetching && !isEndPosts,
    hasData: allGraphs.length > 0,
    isEmpty: allGraphs.length === 0 && !isPostsFetching,
    hasSearchResults: debouncedSearchQuery && filteredGraphs.length > 0,
    noSearchResults: debouncedSearchQuery && filteredGraphs.length === 0,
    hasError: !!error,
    isSearching: searchQuery !== debouncedSearchQuery // Показывает что поиск еще обрабатывается
  }), [isPostsFetching, isEndPosts, allGraphs.length, debouncedSearchQuery, filteredGraphs.length, error, searchQuery]);

  return {
    filteredGraphs,
    allGraphs,
    handleRetry,
    loadingState,
    loaderRef,
    error,
    isSearching: loadingState.isSearching
  };
}; 