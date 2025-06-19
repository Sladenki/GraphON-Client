import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import { EventService } from '@/services/event.service';
import { EventItem } from '@/types/schedule.interface';
import { useDebounce } from '@/hooks/useDebounce';

interface UseEventsListOptimizationProps {
  searchQuery: string;
}

export const useEventsListOptimization = ({ searchQuery }: UseEventsListOptimizationProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Дебаунсинг поискового запроса для лучшей производительности
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Мемоизированный обработчик изменения графа
  const handleGraphSelected = useCallback((event: CustomEvent<string>) => {
    const newGraphId = event.detail;
    setSelectedGraphId(newGraphId);
    localStorage.setItem('selectedGraphId', newGraphId);
  }, []);

  // Инициализация selectedGraphId
  useEffect(() => {
    const savedGraphId = localStorage.getItem('selectedGraphId');
    const initialGraphId = user?.selectedGraphId || savedGraphId || null;
    setSelectedGraphId(initialGraphId);

    window.addEventListener('graphSelected', handleGraphSelected as EventListener);

    return () => {
      window.removeEventListener('graphSelected', handleGraphSelected as EventListener);
    };
  }, [user?.selectedGraphId, handleGraphSelected]);

  // Оптимизированный запрос данных
  const { data: allEvents, isLoading, isSuccess } = useQuery({
    queryKey: ['eventsList', selectedGraphId],
    queryFn: async () => {
      if (!selectedGraphId) {
        return { data: [] };
      }
      const response = await EventService.getUpcomingEvents(selectedGraphId);
      return response;
    },
    enabled: !!selectedGraphId,
    gcTime: 15 * 60 * 1000, // 15 минут
    staleTime: 10 * 60 * 1000, // 10 минут
    retry: 2,
    retryDelay: 1000,
  });

  // Обновление флага первой загрузки
  useEffect(() => {
    if (isSuccess || (!isLoading && allEvents)) {
      setIsFirstLoad(false);
    }
  }, [isLoading, isSuccess, allEvents]);

  const events = useMemo(() => allEvents?.data || [], [allEvents?.data]);

  // Оптимизированная фильтрация с дебаунсингом
  const filteredEvents = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return events;
    }

    const query = debouncedSearchQuery.toLowerCase().trim();
    
    return events.filter((event: EventItem) => {
      if (!event?._id || !event?.name) return false;
      
      const eventName = event.name.toLowerCase();
      
      // Быстрый поиск для коротких запросов
      if (query.length <= 2) {
        return eventName.startsWith(query);
      }
      
      return eventName.includes(query);
    });
  }, [events, debouncedSearchQuery]);

  // Оптимизированный обработчик удаления
  const handleDelete = useCallback((eventId: string) => {
    queryClient.setQueryData(['eventsList', selectedGraphId], (old: any) => {
      if (!old?.data) return old;
      
      const updatedData = {
        ...old,
        data: old.data.filter((event: EventItem) => event._id !== eventId)
      };
      
      return updatedData;
    });
  }, [queryClient, selectedGraphId]);

  // Мемоизированные состояния с учетом дебаунсинга
  const loadingState = useMemo(() => ({
    isFirstLoad,
    isLoading: isFirstLoad || (isLoading && !allEvents),
    hasData: !isFirstLoad && events.length > 0,
    isEmpty: !isFirstLoad && events.length === 0 && !isLoading,
    hasSearchResults: !isLoading && debouncedSearchQuery && filteredEvents.length > 0,
    noSearchResults: !isLoading && debouncedSearchQuery && filteredEvents.length === 0,
    isSearching: searchQuery !== debouncedSearchQuery // Показывает что поиск еще обрабатывается
  }), [isFirstLoad, isLoading, allEvents, events.length, debouncedSearchQuery, filteredEvents.length, searchQuery]);

  return {
    filteredEvents,
    handleDelete,
    loadingState,
    selectedGraphId,
    isSearching: loadingState.isSearching
  };
}; 