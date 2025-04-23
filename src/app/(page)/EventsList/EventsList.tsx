import { EventService } from '@/services/event.service';
import { EventItem } from '@/types/schedule.interface';
import { useQuery } from '@tanstack/react-query';
import React from 'react'
import styles from './EventsList.module.scss'
import EventCard from './EventCard/EventCard';

const EventsList = ({ searchQuery }: { searchQuery: string}) => {

  const { data: allEvents } = useQuery({
    queryKey: ['eventsList'],
    queryFn: () => EventService.getUpcomingEvents(),
  });

  const events = allEvents?.data

  console.log('events', events)

  const filteredEvents = events && events.filter((event: EventItem) =>
    event &&event.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.eventsListWrapper}>
      {filteredEvents && filteredEvents.map((event: EventItem) => (
        <div key={event._id}>
          <EventCard event={event} />
        </div>
        ) 
      )}
    </div>
  )
}

export default EventsList
