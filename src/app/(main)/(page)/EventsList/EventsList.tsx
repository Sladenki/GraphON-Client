import { EventService } from '@/services/event.service';
import { EventItem } from '@/types/schedule.interface';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import styles from './EventsList.module.scss'
import EventCard from '@/components/ui/EventCard/EventCard';
import { AxiosResponse } from 'axios';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';

// Кэш для хранения отфильтрованных событий
const filterCache = new Map<string, EventItem[]>();

const EventsList = React.memo(({ searchQuery }: { searchQuery: string}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    // Инициализация selectedGraphId
    const savedGraphId = localStorage.getItem('selectedGraphId');
    setSelectedGraphId(user?.selectedGraphId || savedGraphId || null);

    // Слушаем событие изменения графа
    const handleGraphSelected = (event: CustomEvent<string>) => {
      setSelectedGraphId(event.detail);
      localStorage.setItem('selectedGraphId', event.detail);
    };

    window.addEventListener('graphSelected', handleGraphSelected as EventListener);

    return () => {
      window.removeEventListener('graphSelected', handleGraphSelected as EventListener);
    };
  }, [user]);

  const { data: allEvents, isLoading, isSuccess } = useQuery<AxiosResponse<any>>({
    queryKey: ['eventsList', selectedGraphId],
    queryFn: () => {
      if (!selectedGraphId) return Promise.resolve({
        data: { data: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      } as AxiosResponse<any>);
      return EventService.getUpcomingEvents(selectedGraphId);
    },
    enabled: !!selectedGraphId,
    gcTime: 10 * 60 * 1000, // 10 минут
    staleTime: 5 * 60 * 1000, // 5 минут
  });
  
  // Устанавливаем флаг после первой загрузки
  useEffect(() => {
    if (isSuccess || (!isLoading && allEvents)) {
      setIsFirstLoad(false);
    }
  }, [isLoading, isSuccess, allEvents]);

  const events = allEvents?.data || [];

  // Мемоизированная фильтрация событий
  const filteredEvents = useMemo(() => {
    const cacheKey = `${selectedGraphId}-${searchQuery}`;

    if (filterCache.has(cacheKey)) {
      return filterCache.get(cacheKey)!;
    }

    const filtered = events.filter((event: EventItem) => {
      if (!event?._id || !event?.name) return false;
      return event.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    filterCache.set(cacheKey, filtered);
    return filtered;
  }, [events, searchQuery, selectedGraphId]);

  // Очистка кэша при изменении графа
  useEffect(() => {
    return () => {
      filterCache.clear();
    };
  }, [selectedGraphId]);

  const handleDelete = useCallback((eventId: string) => {
    queryClient.setQueryData(['eventsList', selectedGraphId], (old: AxiosResponse<any> | undefined) => {
      if (!old) return old;
      const newData = {
        ...old,
        data: {
          ...old.data,
          data: old.data.data.filter((event: EventItem) => event._id !== eventId)
        }
      };
      
      // Обновляем кэш фильтрации
      filterCache.clear();
      return newData;
    });
  }, [queryClient, selectedGraphId]);

  // Мемоизированный рендер карточки события
  const renderEventCard = useCallback((event: EventItem) => (
    <div key={event._id} className={styles.eventCardWrapper}>
      <EventCard 
        event={event} 
        isAttended={event.isAttended} 
        onDelete={handleDelete}
      />
    </div>
  ), [handleDelete]);

  // Мемоизированный рендер пустого состояния
  const renderEmptyState = useCallback((message: string, subMessage: string) => (
    <div className={styles.emptyMessage}>
      <div className={styles.mainText}>
        {message}
      </div>
      <div className={styles.subText}>
        {subMessage}
      </div>
    </div>
  ), []);

  // Показываем загрузку при первой загрузке данных
  if (isFirstLoad || (isLoading && !allEvents)) {
    return <SpinnerLoader />;
  }

  // Проверяем результаты поиска только после загрузки данных
  if (!isLoading && searchQuery && filteredEvents.length === 0) {
    return renderEmptyState(
      'Ничего не найдено',
      'Попробуйте изменить параметры поиска или посмотреть все доступные мероприятия'
    );
  }

  // Показываем пустое состояние только после полной загрузки данных
  if (!isFirstLoad && events.length === 0 && !isLoading) {
    return renderEmptyState(
      'Пока что мероприятий нет',
      'Но скоро здесь появится что-то интересное! Загляните позже, чтобы не пропустить крутые события'
    );
  }

  return (
    <div className={styles.eventsListWrapper}>
      {filteredEvents.map(renderEventCard)}
    </div>
  );
});

EventsList.displayName = 'EventsList';

export default EventsList;
