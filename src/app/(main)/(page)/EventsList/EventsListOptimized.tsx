import React from 'react';
import { useSelectedGraphId } from '@/stores/useUIStore';
import { useOptimizedSearch } from '@/hooks/useOptimizedSearch';
import { useQueryWithRetry } from '@/hooks/useQueryWithRetry';
import { useListState } from '@/hooks/useListState';
import { LoadingComponent, NoSearchResultsComponent, EmptyEventsComponent } from '@/components/ui/StateComponents';
import VirtualizedEventsList from './VirtualizedEventsList';
import { EventItem } from '@/types/schedule.interface';
import { useEventsListOptimized } from './useEventsListOptimized';
import { useSearchQuery } from '@/stores/useUIStore';
import { AdBanner } from '@/components/ads/banner';

interface EventsListOptimizedProps {

}

const SHOW_AD_BANNER = true;

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
    <>
      {SHOW_AD_BANNER && (
        <div style={{ marginBottom: 16 }}>
          <AdBanner />
        </div>
      )}
      <VirtualizedEventsList 
        events={filteredEvents}
        onDelete={handleDelete}
        itemHeight={420} // Высота карточки + отступы
        containerHeight={typeof window !== 'undefined' ? window.innerHeight - 200 : 600}
      />
    </>
  );
});

EventsListOptimized.displayName = 'EventsListOptimized';

export default EventsListOptimized; 