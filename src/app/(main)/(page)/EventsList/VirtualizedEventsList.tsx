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
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Дебаунсированный обработчик скролла для лучшей производительности
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const newScrollTop = containerRef.current.scrollTop;
    
    // Оптимизируем обновления только при значительном изменении
    if (Math.abs(newScrollTop - scrollTop) > itemHeight / 4) {
      setScrollTop(newScrollTop);
    }
    
    // Debounce для окончания скролла
    isScrollingRef.current = true;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 150);
  }, [scrollTop, itemHeight]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Используем passive: true для лучшей производительности скролла
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // Мемоизируем вычисления видимых элементов
  const visibleItems = useMemo(() => {
    const bufferSize = 2; // Количество элементов для предзагрузки
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
    const endIndex = Math.min(
      events.length, 
      startIndex + Math.ceil(containerHeight / itemHeight) + bufferSize * 2
    );
    
    return {
      startIndex,
      endIndex,
      items: events.slice(startIndex, endIndex)
    };
  }, [events, scrollTop, itemHeight, containerHeight]);

  // Мемоизируем общую высоту контейнера
  const totalHeight = useMemo(() => events.length * itemHeight, [events.length, itemHeight]);

  // Если событий мало, используем обычный рендер
  if (events.length <= 8) {
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
      className={styles.virtualizedEventsWrapper}
      style={{
        height: containerHeight,
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      {/* Spacer для поддержания правильной высоты скролла */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.items.map((event, index) => {
          const actualIndex = visibleItems.startIndex + index;
          return (
            <div 
              key={event._id}
              className={styles.virtualEventCard}
              style={{
                position: 'absolute',
                top: actualIndex * itemHeight,
                width: '100%',
                height: itemHeight,
                '--index': actualIndex
              } as React.CSSProperties}
            >
              <EventCard 
                event={event} 
                isAttended={event.isAttended} 
                onDelete={onDelete}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

VirtualizedEventsList.displayName = 'VirtualizedEventsList';

export default VirtualizedEventsList; 