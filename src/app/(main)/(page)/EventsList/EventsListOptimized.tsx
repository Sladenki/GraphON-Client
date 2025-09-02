import React from 'react';
import { 
  LoadingComponent,
  NoSearchResultsComponent,
  EmptyEventsComponent 
} from '@/components/ui/StateComponents';
import { useEventsListOptimized } from './useEventsListOptimized';
import VirtualizedEventsList from './VirtualizedEventsList';
import AdvertisementBanner, { Advertisement } from '@/components/advertisment/AdvertisementBanner';
import BoostedEventCard from '@/components/ui/EventCard/BoostedEventCard';
import { useSearchQuery } from '@/stores/useUIStore';

interface EventsListOptimizedProps {
  ad?: Advertisement;
}

const EventsListOptimized: React.FC<EventsListOptimizedProps> = React.memo(({ ad }) => {
  // Используем Zustand store
  const searchQuery = useSearchQuery();
  
  const { filteredEvents, handleDelete, loadingState } = useEventsListOptimized({ 
    searchQuery 
  });

  // Early returns для различных состояний
  if (loadingState.isLoading) {
    return <LoadingComponent />;
  }

  if (loadingState.noSearchResults) {
    return <NoSearchResultsComponent entityName="мероприятия" />;
  }

  if (loadingState.isEmpty) {
    return <EmptyEventsComponent />;
  }

  // Подготовим данные: первый и остальные
  const boostedEvent = filteredEvents?.[0];
  const restEvents = filteredEvents?.slice(1) || [];

  // Основной рендер списка событий
  return (
    <VirtualizedEventsList 
      events={restEvents}
      onDelete={handleDelete}
      itemHeight={420} // Высота карточки + отступы
      containerHeight={typeof window !== 'undefined' ? window.innerHeight - 200 : 600}
      headerNode={boostedEvent ? <BoostedEventCard event={boostedEvent} onDelete={handleDelete} /> : undefined}
      headerHeight={boostedEvent ? 420 : 0}
    />
  );
});

EventsListOptimized.displayName = 'EventsListOptimized';

export default EventsListOptimized; 