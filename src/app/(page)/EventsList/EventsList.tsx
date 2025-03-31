import { EventService } from '@/services/event.service';
import { EventItem } from '@/types/schedule.interface';
import { useQuery } from '@tanstack/react-query';
import React from 'react'
import styles from './EventsList.module.scss'

const EventsList = ({ searchQuery }: { searchQuery: string}) => {

  const { data: allEvents, isPending: isEventsLoading, isError: isEventsError } = useQuery({
    queryKey: ['eventsList'],
    queryFn: () => EventService.getUpcomingEvents(),
  });

  const events = allEvents?.data

  const filteredEvents = events && events.filter((event: EventItem) =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.eventsListWrapper}>
      {filteredEvents && filteredEvents.map((event: EventItem) => (
          <div key={event._id} className={styles.eventItem}>
            <span className={styles.itemTitle}>📝 {event.name}</span>
            <span className={styles.itemDescription}>{event.description}</span>
            <span className={styles.itemTime}>⏰ {event.timeFrom} - {event.timeTo}</span>
          </div>
        ) 
      )}
    </div>
  )
}

export default EventsList
