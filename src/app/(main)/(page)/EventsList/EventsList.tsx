import { EventService } from '@/services/event.service';
import { EventItem } from '@/types/schedule.interface';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react'
import styles from './EventsList.module.scss'
import EventCard from '@/components/ui/EventCard/EventCard';


const EventsList = ({ searchQuery }: { searchQuery: string}) => {
  const queryClient = useQueryClient();

  const { data: allEvents } = useQuery({
    queryKey: ['eventsList'],
    queryFn: () => EventService.getUpcomingEvents(),
  });

  const events = allEvents?.data;

  const filteredEvents = events?.filter((event: EventItem) => {
    if (!event?._id || !event?.name) return false;
    return event.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleDelete = (eventId: string) => {
    queryClient.setQueryData(['eventsList'], (old: any) => ({
      ...old,
      data: old.data.filter((event: EventItem) => event._id !== eventId)
    }));
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
