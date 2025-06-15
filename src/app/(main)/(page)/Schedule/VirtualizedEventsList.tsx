import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ScheduleItem, EventItem } from '@/types/schedule';
import { ScheduleCard, EventCard } from './ScheduleComponents';
import styles from './Schedule.module.scss';

interface VirtualizedEventsListProps {
  scheduleItems: ScheduleItem[];
  eventItems: EventItem[];
  onToggleSubscription: (eventId: string, currentStatus: boolean) => void;
  maxVisibleItems?: number;
  itemHeight?: number;
}

export const VirtualizedEventsList: React.FC<VirtualizedEventsListProps> = React.memo(({
  scheduleItems,
  eventItems,
  onToggleSubscription,
  maxVisibleItems = 10,
  itemHeight = 120
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);

  // Объединяем все элементы в один массив
  const allItems = useMemo(() => {
    const combined: Array<{ type: 'schedule' | 'event'; item: ScheduleItem | EventItem }> = [
      ...scheduleItems.map(item => ({ type: 'schedule' as const, item })),
      ...eventItems.map(item => ({ type: 'event' as const, item }))
    ];
    return combined;
  }, [scheduleItems, eventItems]);

  // Вычисляем видимые элементы
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 2,
      allItems.length
    );
    
    return {
      startIndex: Math.max(0, startIndex),
      endIndex,
      items: allItems.slice(Math.max(0, startIndex), endIndex)
    };
  }, [scrollTop, containerHeight, itemHeight, allItems]);

  // Обработчик скролла
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Обновляем высоту контейнера при изменении размера
  useEffect(() => {
    const updateContainerHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateContainerHeight();
    window.addEventListener('resize', updateContainerHeight);
    
    return () => {
      window.removeEventListener('resize', updateContainerHeight);
    };
  }, []);

  // Если элементов мало, рендерим обычный список
  if (allItems.length <= maxVisibleItems) {
    return (
      <div className={styles.eventsList}>
        {scheduleItems.length > 0 && (
          <div className={styles.eventsGroup}>
            <div className={styles.groupHeader}>
              <h3>📚 Занятия ({scheduleItems.length})</h3>
            </div>
            {scheduleItems.map((item) => (
              <ScheduleCard key={item._id} scheduleItem={item} />
            ))}
          </div>
        )}
        
        {eventItems.length > 0 && (
          <div className={styles.eventsGroup}>
            <div className={styles.groupHeader}>
              <h3>🎯 Мероприятия ({eventItems.length})</h3>
            </div>
            {eventItems.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onToggleSubscription={onToggleSubscription}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Виртуализированный рендеринг
  return (
    <div 
      ref={containerRef}
      className={styles.virtualizedContainer}
      style={{ height: '60vh', overflowY: 'auto' }}
      onScroll={handleScroll}
    >
      <div 
        style={{ 
          height: allItems.length * itemHeight,
          position: 'relative'
        }}
      >
        {visibleItems.items.map((item, index) => {
          const actualIndex = visibleItems.startIndex + index;
          
          return (
            <div
              key={`${item.type}-${item.item._id}`}
              style={{
                position: 'absolute',
                top: actualIndex * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight,
                padding: '0.5rem'
              }}
            >
              {item.type === 'schedule' ? (
                <ScheduleCard scheduleItem={item.item as ScheduleItem} />
              ) : (
                <EventCard
                  event={item.item as EventItem}
                  onToggleSubscription={onToggleSubscription}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

VirtualizedEventsList.displayName = 'VirtualizedEventsList'; 