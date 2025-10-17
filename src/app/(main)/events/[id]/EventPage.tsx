'use client'

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { EventService } from '@/services/event.service';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import EventCard from '@/components/shared/EventCard/EventCard';
import styles from './EventPage.module.scss';

interface EventPageProps {
  eventId: string;
}

const EventPage: React.FC<EventPageProps> = ({ eventId }) => {
  const router = useRouter();

  // Получение данных события
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => EventService.getEventById(eventId),
    enabled: !!eventId,
  });

  const handleBack = () => {
    router.push('/events');
  };

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
        <button onClick={handleBack} className={styles.backButtonError}>
          <ArrowLeft size={16} />
          Вернуться назад
        </button>
      </div>
    );
  }

  return (
    <div className={styles.eventPage}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          <ArrowLeft size={20} />
          <span>Назад</span>
        </button>
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
