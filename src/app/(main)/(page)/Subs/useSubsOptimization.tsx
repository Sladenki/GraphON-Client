import { useMemo, useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { EventItem } from '@/types/schedule.interface';
import { GraphSubsService } from '@/services/graphSubs.service';

interface UseSubsOptimizationProps {
  searchQuery: string;
}

export const useSubsOptimization = ({ searchQuery }: UseSubsOptimizationProps) => {
  const queryClient = useQueryClient();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Оптимизированный запрос данных
  const { data: allEvents, isLoading, isSuccess, error } = useQuery<AxiosResponse<any>>({
    queryKey: ['subsEvents'],
    queryFn: () => GraphSubsService.getSubsEvents(),
    gcTime: 10 * 60 * 1000, // 10 минут
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Устанавливаем флаг после первой загрузки
  useEffect(() => {
    if (isSuccess || (!isLoading && allEvents)) {
      setIsFirstLoad(false);
    }
  }, [isLoading, isSuccess, allEvents]);

  // Мемоизированные события
  const events = useMemo(() => allEvents?.data || [], [allEvents?.data]);

  // Простая фильтрация без кэширования (используем только React мемоизацию)
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) {
      return events;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return events.filter((event: EventItem) => {
      if (!event?._id || !event?.name) return false;
      
      const eventName = event.name.toLowerCase();
      
      // Быстрый поиск для коротких запросов
      if (query.length <= 2) {
        return eventName.startsWith(query);
      }
      
      return eventName.includes(query);
    });
  }, [events, searchQuery]);

  // Мемоизированный обработчик удаления
  const handleDelete = useCallback((eventId: string) => {
    queryClient.setQueryData(['subsEvents'], (old: AxiosResponse<any> | undefined) => {
      if (!old) return old;
      
      return {
        ...old,
        data: old.data.filter((event: EventItem) => event._id !== eventId)
      };
    });
  }, [queryClient]);

  // Мемоизированный обработчик повтора запроса
  const handleRetry = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: ['subsEvents'] 
    });
  }, [queryClient]);

  // Мемоизированные состояния
  const loadingState = useMemo(() => ({
    isFirstLoad,
    isLoading: isLoading && !allEvents,
    hasData: events.length > 0,
    isEmpty: events.length === 0 && !isLoading && !isFirstLoad,
    hasSearchResults: searchQuery && filteredEvents.length > 0,
    noSearchResults: searchQuery && filteredEvents.length === 0 && !isLoading,
    hasError: !!error
  }), [isFirstLoad, isLoading, allEvents, events.length, searchQuery, filteredEvents.length, error]);

  return {
    events,
    filteredEvents,
    handleDelete,
    handleRetry,
    loadingState,
    error
  };
}; 