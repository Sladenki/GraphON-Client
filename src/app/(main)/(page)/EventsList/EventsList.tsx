import React from 'react';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { EmptyState } from '@/components/global/EmptyState/EmptyState';
import { useEventsListOptimization } from './useEventsListOptimization';
import VirtualizedEventsList from './VirtualizedEventsList';

interface EventsListProps {
  searchQuery: string;
}

// Мемоизированные компоненты состояний
const LoadingComponent = React.memo(() => <SpinnerLoader />);
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

const EventsList: React.FC<EventsListProps> = React.memo(({ searchQuery }) => {
  const { filteredEvents, handleDelete, loadingState } = useEventsListOptimization({ 
    searchQuery 
  });

  // Early returns для различных состояний
  if (loadingState.isLoading) {
    return <LoadingComponent />;
  }

  if (loadingState.noSearchResults) {
    return <NoSearchResultsComponent />;
  }

  if (loadingState.isEmpty) {
    return <EmptyEventsComponent />;
  }

  // Основной рендер списка событий
  return (
    <VirtualizedEventsList 
      events={filteredEvents}
      onDelete={handleDelete}
      itemHeight={420} // Высота карточки + отступы
      containerHeight={typeof window !== 'undefined' ? window.innerHeight - 200 : 600}
    />
  );
});

EventsList.displayName = 'EventsList';

export default EventsList;
