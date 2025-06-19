import React from 'react';
import styles from './Subs.module.scss';
import EventCard from '@/components/ui/EventCard/EventCard';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { EmptyState } from '@/components/global/EmptyState/EmptyState';
import { EventItem } from '@/types/schedule.interface';
import { useSubsOptimization } from './useSubsOptimization';
import VirtualizedEventsList from '../EventsList/VirtualizedEventsList';

interface SubsProps {
  searchQuery: string;
}

// Мемоизированные компоненты состояний
const LoadingComponent = React.memo(() => (
  <div className={styles.loaderWrapper}>
    <SpinnerLoader />
  </div>
));
LoadingComponent.displayName = 'LoadingComponent';

const NoSearchResultsComponent = React.memo(() => (
  <EmptyState
    message="Ничего не найдено"
    subMessage="Попробуйте изменить параметры поиска или посмотреть все доступные мероприятия"
    emoji="🔍"
  />
));
NoSearchResultsComponent.displayName = 'NoSearchResultsComponent';

const EmptyEventsComponent = React.memo(() => (
  <EmptyState
    message="Пока что мероприятий нет"
    subMessage="Но скоро здесь появится что-то интересное! Загляните позже, чтобы не пропустить крутые события"
    emoji="🎉"
  />
));
EmptyEventsComponent.displayName = 'EmptyEventsComponent';

const ErrorComponent = React.memo<{ onRetry: () => void }>(({ onRetry }) => (
  <div className={styles.error}>
    <div className={styles.errorIcon}>⚠️</div>
    <div className={styles.errorText}>Ошибка загрузки данных</div>
    <button className={styles.retryButton} onClick={onRetry}>
      Повторить
    </button>
  </div>
));
ErrorComponent.displayName = 'ErrorComponent';

// Мемоизированный компонент карточки события
const EventCardWrapper = React.memo<{
  event: EventItem;
  onDelete: (eventId: string) => void;
}>(({ event, onDelete }) => (
  <div className={styles.eventCardWrapper}>
    <EventCard 
      event={event} 
      isAttended={event.isAttended} 
      onDelete={onDelete}
    />
  </div>
));
EventCardWrapper.displayName = 'EventCardWrapper';

// Мемоизированный список событий
const EventsList = React.memo<{
  events: EventItem[];
  onDelete: (eventId: string) => void;
}>(({ events, onDelete }) => (
  <div className={styles.eventsListWrapper}>
    {events.map((event) => (
      <EventCardWrapper
        key={event._id}
        event={event}
        onDelete={onDelete}
      />
    ))}
  </div>
));
EventsList.displayName = 'EventsList';

// Основной компонент Subs
const Subs: React.FC<SubsProps> = React.memo(({ searchQuery }) => {
  const {
    filteredEvents,
    handleDelete,
    handleRetry,
    loadingState,
    error
  } = useSubsOptimization({ searchQuery });

  // Early returns для различных состояний
  if (loadingState.hasError) {
    return <ErrorComponent onRetry={handleRetry} />;
  }

  if (loadingState.isFirstLoad || loadingState.isLoading) {
    return <LoadingComponent />;
  }

  if (loadingState.noSearchResults) {
    return <NoSearchResultsComponent />;
  }

  if (loadingState.isEmpty) {
    return <EmptyEventsComponent />;
  }

  // Используем виртуализацию для больших списков
  return (
    <VirtualizedEventsList 
      events={filteredEvents} 
      onDelete={handleDelete}
      itemHeight={420} // Высота карточки события + отступы
      containerHeight={typeof window !== 'undefined' ? window.innerHeight - 200 : 600}
    />
  );
});

Subs.displayName = 'Subs';

export default Subs;
