import { EventService } from '@/services/event.service';
import { EventItem } from '@/types/schedule.interface';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';
import React, { useEffect, useState } from 'react';
import styles from './EventsList.module.scss'
import EventCard from '@/components/ui/EventCard/EventCard';
import { AxiosResponse } from 'axios';

interface EventsResponse {
  data: EventItem[];
}

const EventsList = ({ searchQuery }: { searchQuery: string}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null);

  useEffect(() => {
    // Инициализация selectedGraphId
    const savedGraphId = localStorage.getItem('selectedGraphId');
    setSelectedGraphId(user?.selectedGraphId || savedGraphId || null);

    // Слушаем событие изменения графа
    const handleGraphSelected = (event: CustomEvent<string>) => {
      setSelectedGraphId(event.detail);
    };

    window.addEventListener('graphSelected', handleGraphSelected as EventListener);

    return () => {
      window.removeEventListener('graphSelected', handleGraphSelected as EventListener);
    };
  }, [user]);

  const { data: allEvents } = useQuery<AxiosResponse<EventsResponse>>({
    queryKey: ['eventsList', selectedGraphId],
    queryFn: () => {
      if (!selectedGraphId) return Promise.resolve({
        data: { data: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any
      } as AxiosResponse<EventsResponse>);
      return EventService.getUpcomingEvents(selectedGraphId);
    },
    enabled: !!selectedGraphId
  });

  const events = allEvents?.data.data;

  const filteredEvents = events?.filter((event: EventItem) => {
    if (!event?._id || !event?.name) return false;
    return event.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleDelete = (eventId: string) => {
    queryClient.setQueryData(['eventsList', selectedGraphId], (old: AxiosResponse<EventsResponse> | undefined) => {
      if (!old) return old;
      return {
        ...old,
        data: {
          ...old.data,
          data: old.data.data.filter((event: EventItem) => event._id !== eventId)
        }
      };
    });
  };

  // Если нет событий или отфильтрованный список пуст
  if (!events?.length || (filteredEvents && filteredEvents.length === 0)) {
    return (
      <div className={styles.emptyMessage}>
        На ближайшее время никакой движухи нет
      </div>
    );
  }

  return (
    <div className={styles.eventsListWrapper}>
      {filteredEvents?.map((event: EventItem) => (
        event?._id && (
          <div key={event._id}>
            <EventCard 
              event={event} 
              isAttended={event.isAttended} 
              onDelete={handleDelete}
            />
          </div>
        )
      ))}
    </div>
  );
};

export default EventsList;
