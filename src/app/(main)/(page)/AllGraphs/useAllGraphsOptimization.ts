import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useFetchBunchData } from '@/hooks/useFetchBunchData';

interface UseAllGraphsOptimizationProps {
  searchQuery: string;
  selectedGraphId: string;
}

export const useAllGraphsOptimization = ({ 
  searchQuery, 
  selectedGraphId 
}: UseAllGraphsOptimizationProps) => {
  const queryClient = useQueryClient();
  
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

  // Простая фильтрация без кэширования
  const filteredGraphs = useMemo(() => {
    if (!searchQuery.trim()) {
      return allGraphs;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return allGraphs.filter((graph) => {
      if (!graph?.name) return false;
      
      const graphName = graph.name.toLowerCase();
      
      // Быстрый поиск для коротких запросов
      if (query.length <= 2) {
        return graphName.startsWith(query);
      }
      
      return graphName.includes(query);
    });
  }, [allGraphs, searchQuery]);

  // Мемоизированный обработчик повтора запроса
  const handleRetry = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: ['graph', selectedGraphId] 
    });
  }, [queryClient, selectedGraphId]);

  // Мемоизированные состояния
  const loadingState = useMemo(() => ({
    isLoading: isPostsFetching && !isEndPosts,
    hasData: allGraphs.length > 0,
    isEmpty: allGraphs.length === 0 && !isPostsFetching,
    hasSearchResults: searchQuery && filteredGraphs.length > 0,
    noSearchResults: searchQuery && filteredGraphs.length === 0,
    hasError: !!error
  }), [isPostsFetching, isEndPosts, allGraphs.length, searchQuery, filteredGraphs.length, error]);

  return {
    filteredGraphs,
    allGraphs,
    handleRetry,
    loadingState,
    loaderRef,
    error
  };
}; 