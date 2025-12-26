import { useState, useEffect, useMemo, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { EventService } from '@/services/event.service';
import { EventItem } from '@/types/schedule.interface';
import { getThemeName, ThemeName } from '@/components/shared/EventCard/pastelTheme';

const EVENTS_PER_PAGE = 20;

interface UseEventsFeedOptions {
  selectedGraphId: string | null;
  filterByTheme?: ThemeName | null;
}

export function useEventsFeed({ selectedGraphId, filterByTheme = null }: UseEventsFeedOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['eventsTikTok', selectedGraphId, filterByTheme],
    queryFn: async ({ pageParam = 0 }) => {
      if (!selectedGraphId) {
        return { data: [] };
      }
      return await EventService.getUpcomingEvents(selectedGraphId, pageParam, EVENTS_PER_PAGE);
    },
    enabled: !!selectedGraphId,
    getNextPageParam: (lastPage, allPages) => {
      const events = lastPage?.data || [];
      if (events.length < EVENTS_PER_PAGE) {
        return undefined;
      }
      return allPages.length * EVENTS_PER_PAGE;
    },
    initialPageParam: 0,
    gcTime: 15 * 60 * 1000, // 15 минут
    staleTime: 10 * 60 * 1000, // 10 минут
  });

  // Объединение всех страниц в один массив событий
  const events = useMemo(() => {
    if (!data?.pages) return [];
    let allEvents = data.pages.flatMap((page) => page?.data || []);

    // Клиентская фильтрация по тематике (если нет API фильтрации)
    if (filterByTheme) {
      allEvents = allEvents.filter((event) => {
        const eventTheme = getThemeName(event);
        return eventTheme === filterByTheme;
      });
    }

    return allEvents;
  }, [data?.pages, filterByTheme]);

  const currentEvent = events[currentIndex] || null;
  const currentTheme = currentEvent ? getThemeName(currentEvent) : 'Без тематики';

  // Предзагрузка следующей страницы
  useEffect(() => {
    if (currentIndex >= events.length - 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [currentIndex, events.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const goToNext = useCallback(() => {
    if (currentIndex < events.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, events.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleFilterChange = useCallback((theme: ThemeName | null) => {
    setCurrentIndex(0); // Сбрасываем на первое событие при смене фильтра
  }, []);

  return {
    events,
    currentEvent,
    currentIndex,
    currentTheme,
    isLoading,
    error,
    hasMore: hasNextPage,
    isFetchingMore: isFetchingNextPage,
    setCurrentIndex,
    goToNext,
    goToPrevious,
    handleFilterChange,
    refetch,
  };
}

