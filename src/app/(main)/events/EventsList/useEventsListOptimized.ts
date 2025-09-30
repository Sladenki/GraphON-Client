import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { EventService } from '@/services/event.service';
import { EventItem } from '@/types/schedule.interface';
import { useOptimizedSearch } from '@/hooks/useOptimizedSearch';
import { useListState } from '@/hooks/useListState';
import { useQueryWithRetry } from '@/hooks/useQueryWithRetry';
import { useSelectedGraphId } from '@/stores/useUIStore';

interface UseEventsListOptimizedProps {
  searchQuery: string;
}

export const useEventsListOptimized = ({ searchQuery }: UseEventsListOptimizedProps) => {
  const { user } = useAuth();
  const selectedGraphId = useSelectedGraphId(); // Используем Zustand store
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Оптимизированный запрос данных с общим хуком
  const { 
    data: allEvents, 
    isLoading, 
    isSuccess, 
    error,
    handleRetry,
    handleOptimisticUpdate
  } = useQueryWithRetry({
    queryKey: ['eventsList', selectedGraphId],
    queryFn: async () => {
      if (!selectedGraphId) {
        return { data: [] };
      }
      return await EventService.getUpcomingEvents(selectedGraphId);
    },
    enabled: !!selectedGraphId,
    gcTime: 15 * 60 * 1000, // 15 минут
    staleTime: 10 * 60 * 1000, // 10 минут
  });

  // Обновление флага первой загрузки
  useEffect(() => {
    if (isSuccess || (!isLoading && allEvents)) {
      setIsFirstLoad(false);
    }
  }, [isLoading, isSuccess, allEvents]);

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

  // Оптимизированный обработчик удаления
  const handleDelete = useCallback((eventId: string) => {
    handleOptimisticUpdate((old: any) => {
      if (!old?.data) return old;
      
      return {
        ...old,
        data: old.data.filter((event: EventItem) => event._id !== eventId)
      };
    });
  }, [handleOptimisticUpdate]);

  return {
    filteredEvents,
    handleDelete,
    handleRetry,
    loadingState,
    selectedGraphId,
    error
  };
}; 