import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import EventCard from '@/components/ui/EventCard/EventCard';
import { EventItem } from '@/types/schedule.interface';
import styles from './EventsList.module.scss';

interface VirtualizedEventsListProps {
  events: EventItem[];
  onDelete: (eventId: string) => void;
  itemHeight?: number;
  containerHeight?: number;
}

const VirtualizedEventsList: React.FC<VirtualizedEventsListProps> = React.memo(({ 
  events, 
  onDelete,
  itemHeight = 400,
  containerHeight = 600
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Простой обработчик скролла
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Вычисляем видимые элементы
  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 1);
    const endIndex = Math.min(events.length, startIndex + Math.ceil(containerHeight / itemHeight) + 2);
    
    return {
      startIndex,
      endIndex,
      items: events.slice(startIndex, endIndex)
    };
  }, [events, scrollTop, itemHeight, containerHeight]);

  // Если событий мало, используем обычный рендер
  if (events.length <= 10) {
    return (
      <div className={styles.eventsListWrapper}>
        {events.map((event, index) => (
          <div 
            key={event._id} 
            className={styles.eventCardWrapper}
            style={{ '--index': index } as React.CSSProperties}
          >
            <EventCard 
              event={event} 
              isAttended={event.isAttended} 
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={styles.eventsListWrapper}
      style={{
        height: containerHeight,
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      <div style={{ height: events.length * itemHeight, position: 'relative' }}>
        {visibleItems.items.map((event, index) => (
          <div 
            key={event._id}
            className={styles.eventCardWrapper}
            style={{
              position: 'absolute',
              top: (visibleItems.startIndex + index) * itemHeight,
              width: '100%',
              height: itemHeight,
              '--index': visibleItems.startIndex + index
            } as React.CSSProperties}
          >
            <EventCard 
              event={event} 
              isAttended={event.isAttended} 
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

VirtualizedEventsList.displayName = 'VirtualizedEventsList';

export default VirtualizedEventsList; 