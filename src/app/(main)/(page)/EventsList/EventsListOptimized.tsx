import React from 'react';
import { 
  LoadingComponent,
  NoSearchResultsComponent,
  EmptyEventsComponent 
} from '@/components/ui/StateComponents';
import { useEventsListOptimized } from './useEventsListOptimized';
import VirtualizedEventsList from './VirtualizedEventsList';
import { useSearchQuery } from '@/stores/useUIStore';

interface EventsListOptimizedProps {
  // Больше не нужны props, так как используем Zustand
}

const EventsListOptimized: React.FC<EventsListOptimizedProps> = React.memo(() => {
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

EventsListOptimized.displayName = 'EventsListOptimized';

export default EventsListOptimized; 