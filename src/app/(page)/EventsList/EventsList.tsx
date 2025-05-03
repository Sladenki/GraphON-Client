import { EventService } from '@/services/event.service';
import { EventItem } from '@/types/schedule.interface';
import { useQuery } from '@tanstack/react-query';
import React from 'react'
import styles from './EventsList.module.scss'
import EventCard from '../../../components/ui/EventCard/EventCard';

const EventsList = ({ searchQuery }: { searchQuery: string}) => {

  const { data: allEvents } = useQuery({
    queryKey: ['eventsList'],
    queryFn: () => EventService.getUpcomingEvents(),
  });

  const events = allEvents?.data;

  const filteredEvents = events?.filter((event: EventItem) => {
    if (!event?._id || !event?.name) return false;
    return event.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className={styles.eventsListWrapper}>
      {filteredEvents?.map((event: EventItem) => (
        event?._id && (
          <div key={event._id}>
            <EventCard event={event} isAttended={event.isAttended} />
          </div>
        )
      ))}
    </div>
  );
};

export default EventsList;
