'use client'

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { EventService } from '@/services/event.service';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import ButtonBack from '@/components/global/ButtonBack/ButtonBack';
import EventCard from '@/components/shared/EventCard/EventCard';
import styles from './EventPage.module.scss';

interface EventPageProps {
  eventId: string;
}

const EventPage: React.FC<EventPageProps> = ({ eventId }) => {
  // Получение данных события
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => EventService.getEventById(eventId),
    enabled: !!eventId,
  });

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <SpinnerLoader />
      </div>
    );
  }

  if (error || !event?.data) {
    return (
      <div className={styles.errorContainer}>
        <h2>Событие не найдено</h2>
        <p>Возможно, событие было удалено или ссылка неверна.</p>
        <ButtonBack 
          href="/events" 
          label="Вернуться назад"
          className={styles.backButtonError}
        />
      </div>
    );
  }

  return (
    <div className={styles.eventPage}>
      {/* Header */}
      <div className={styles.header}>
        <ButtonBack 
          href="/events"
          variant="light"
          color="default"
        />
      </div>

      {/* Main Content - используем готовый EventCard */}
      <div className={styles.content}>
        <EventCard 
          event={event.data} 
          isAttended={event.data.isAttended}
        />
      </div>
    </div>
  );
};

export default EventPage;
