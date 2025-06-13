import { EventItem } from '@/types/schedule.interface';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import styles from './Subs.module.scss'
import EventCard from '@/components/ui/EventCard/EventCard';
import { AxiosResponse } from 'axios';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { EmptyState } from '@/components/global/EmptyState/EmptyState';
import { GraphSubsService } from '@/services/graphSubs.service';


// Кэш для хранения отфильтрованных событий
const filterCache = new Map<string, EventItem[]>();

const Subs = React.memo(({ searchQuery }: { searchQuery: string}) => {
  const queryClient = useQueryClient();
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const { data: allEvents, isLoading, isSuccess } = useQuery<AxiosResponse<any>>({
    queryKey: ['subsEvents'],
    queryFn: () => GraphSubsService.getSubsEvents(),
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
    const cacheKey = `subs-${searchQuery}`;

    if (filterCache.has(cacheKey)) {
      return filterCache.get(cacheKey)!;
    }

    const filtered = events.filter((event: EventItem) => {
    if (!event?._id || !event?.name) return false;
    return event.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

    filterCache.set(cacheKey, filtered);
    return filtered;
  }, [events, searchQuery]);

  // Очистка кэша при размонтировании
  useEffect(() => {
    return () => {
      filterCache.clear();
    };
  }, []);

  const handleDelete = useCallback((eventId: string) => {
    queryClient.setQueryData(['subsEvents'], (old: AxiosResponse<any> | undefined) => {
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
  }, [queryClient]);

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
  const renderEmptyState = useCallback((message: string, subMessage: string, emoji: string = '🎉') => (
    <EmptyState
      message={message}
      subMessage={subMessage}
      emoji={emoji}
    />
  ), []);

  // Показываем загрузку при первой загрузке данных
  if (isFirstLoad || (isLoading && !allEvents)) {
    return <SpinnerLoader />;
  }

  // Проверяем результаты поиска только после загрузки данных
  if (!isLoading && searchQuery && filteredEvents.length === 0) {
    return renderEmptyState(
      'Ничего не найдено',
      'Попробуйте изменить параметры поиска или посмотреть все доступные мероприятия',
      '🔍'
    );
  }

  // Показываем пустое состояние только после полной загрузки данных
  if (!isFirstLoad && events.length === 0 && !isLoading) {
    return renderEmptyState(
      'Пока что мероприятий нет',
      'Но скоро здесь появится что-то интересное! Загляните позже, чтобы не пропустить крутые события',
      '🎉'
    );
  }

  return (
    <div className={styles.eventsListWrapper}>
      {filteredEvents.map(renderEventCard)}
    </div>
  );
});

Subs.displayName = 'Subs';

export default Subs;
