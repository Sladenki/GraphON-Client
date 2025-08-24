import { useMemo, useCallback, useEffect, useState } from 'react';
import { AxiosResponse } from 'axios';
import { EventItem } from '@/types/schedule.interface';
import { GraphSubsService } from '@/services/graphSubs.service';
import { useOptimizedSearch } from '@/hooks/useOptimizedSearch';
import { useListState } from '@/hooks/useListState';
import { useQueryWithRetry } from '@/hooks/useQueryWithRetry';

interface UseSubsOptimizedProps {
  searchQuery: string;
}

export const useSubsOptimized = ({ searchQuery }: UseSubsOptimizedProps) => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Оптимизированный запрос данных с общим хуком
  const { 
    data: allEvents, 
    isLoading, 
    isSuccess, 
    error,
    handleRetry,
    handleOptimisticUpdate
  } = useQueryWithRetry<AxiosResponse<EventItem[]>>({
    queryKey: ['subsEvents'],
    queryFn: () => GraphSubsService.getSubsEvents(),
    gcTime: 10 * 60 * 1000, // 10 минут
    staleTime: 5 * 60 * 1000, // 5 минут
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Устанавливаем флаг после первой загрузки
  useEffect(() => {
    if (isSuccess || (!isLoading && allEvents)) {
      setIsFirstLoad(false);
    }
  }, [isLoading, isSuccess, allEvents]);

  // Мемоизированные события
  const events = useMemo(() => allEvents?.data || [], [allEvents?.data]);

  // Оптимизированный поиск с общим хуком
  const { filteredData: filteredEvents, debouncedSearchQuery } = useOptimizedSearch<EventItem>({
    data: events,
    searchQuery,
    searchFields: ['name']
  });

  // Состояния с общим хуком
  const loadingState = useListState({
    isLoading,
    hasError: !!error,
    data: events,
    searchQuery,
    debouncedSearchQuery,
    filteredData: filteredEvents,
    isFirstLoad,
    allData: allEvents
  });

  // Мемоизированный обработчик удаления
  const handleDelete = useCallback((eventId: string) => {
    handleOptimisticUpdate((old: AxiosResponse<EventItem[]> | undefined) => {
      if (!old) return old;
      
      return {
        ...old,
        data: old.data.filter((event: EventItem) => event._id !== eventId)
      };
    });
  }, [handleOptimisticUpdate]);

  return {
    events,
    filteredEvents,
    handleDelete,
    handleRetry,
    loadingState,
    error
  };
}; 