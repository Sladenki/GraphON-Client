'use client';

import React from 'react';
import { Chip, Button } from '@heroui/react';
import { EmptyState } from '@/components/global/EmptyState/EmptyState';
import { ScheduleItem, EventItem } from '@/types/schedule';
import { useScheduleOptimization } from './useScheduleOptimization';
import { ScheduleCard, EventCard, DayButton, EventsGroup } from './ScheduleComponents';
import styles from './Schedule.module.scss';
import { DECLENSION_RULES, useDeclension } from '@/hooks/useDeclension';

interface SchedulePageProps {
  schedule: ScheduleItem[];
  events: EventItem[];
  onToggleSubscription?: (eventId: string, isAttended: boolean) => void;
}

// Виртуализированный список событий для мобильных устройств
const VirtualizedEventsList = React.memo<{
  events: EventItem[];
  onToggleSubscription: (eventId: string, currentStatus: boolean) => void;
  title: string;
  icon: string;
}>(({ events, onToggleSubscription, title, icon }) => {
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 8 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = React.useCallback(() => {
    if (!containerRef.current) return;
    
    const { scrollTop, clientHeight } = containerRef.current;
    const itemHeight = 120; // Примерная высота элемента
    
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(start + Math.ceil(clientHeight / itemHeight) + 2, events.length);
    
    setVisibleRange({ start, end });
  }, [events.length]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const debouncedScroll = (() => {
      let timeout: NodeJS.Timeout;
      return () => {
        clearTimeout(timeout);
        timeout = setTimeout(handleScroll, 16);
      };
    })();

    container.addEventListener('scroll', debouncedScroll, { passive: true });
    handleScroll(); // Инициализация

    return () => container.removeEventListener('scroll', debouncedScroll);
  }, [handleScroll]);

  const visibleEvents = events.slice(visibleRange.start, visibleRange.end);
  const totalHeight = events.length * 120;
  const offsetY = visibleRange.start * 120;

  return (
    <EventsGroup title={title} icon={icon} count={events.length}>
      <div 
        ref={containerRef}
        className={styles.virtualContainer}
        style={{ height: '400px', overflowY: 'auto' }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleEvents.map((event, index) => (
              <div key={event._id} style={{ height: '120px' }}>
                <EventCard
                  event={event}
                  onToggleSubscription={onToggleSubscription}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </EventsGroup>
  );
});
VirtualizedEventsList.displayName = 'VirtualizedEventsList';

// Мемоизированный компонент заголовка
const ScheduleHeader = React.memo<{
  title: string;
  totalEvents: number;
  onTodayClick: () => void;
}>(({ title, totalEvents, onTodayClick }) => (
  <div className={styles.selectorHeader}>
    <h2 className={styles.weekTitle}>{title}</h2>
    <div className={styles.quickActions}>
      <Button
        size="sm"
        variant="flat"
        className={styles.todayButton}
        onClick={onTodayClick}
        startContent="📅"
      >
        Сегодня
      </Button>
      <Chip
        size="sm"
        variant="flat"
        className={styles.eventsCount}
      >
        {totalEvents} {useDeclension(totalEvents, DECLENSION_RULES.EVENT_ITEM)}
      </Chip>
    </div>
  </div>
));
ScheduleHeader.displayName = 'ScheduleHeader';

// Мемоизированный компонент селектора дней
const WeekSelector = React.memo<{
  weekDaysData: Array<{
    day: Date;
    index: number;
    isSelected: boolean;
    isToday: boolean;
    totalEvents: number;
    dayName: string;
    dayDate: string;
    dayMonth: string;
  }>;
  onDaySelect: (day: Date) => void;
  daysContainerRef: React.RefObject<HTMLDivElement | null>;
}>(({ weekDaysData, onDaySelect, daysContainerRef }) => (
  <div className={styles.daysContainer} ref={daysContainerRef}>
    {weekDaysData.map((dayData) => (
      <DayButton
        key={dayData.index}
        dayData={dayData}
        onDaySelect={onDaySelect}
      />
    ))}
  </div>
));
WeekSelector.displayName = 'WeekSelector';

// Оптимизированный компонент списка событий
const EventsList = React.memo<{
  selectedDaySchedule: ScheduleItem[];
  selectedDayEvents: EventItem[];
  onToggleSubscription: (eventId: string, currentStatus: boolean) => void;
}>(({ selectedDaySchedule, selectedDayEvents, onToggleSubscription }) => {
  // Используем виртуализацию для больших списков событий на мобильных устройствах
  const shouldVirtualize = selectedDayEvents.length > 10;
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <div className={styles.eventsList}>
      {/* Расписание занятий */}
      {selectedDaySchedule.length > 0 && (
        <EventsGroup title="Занятия" icon="📚" count={selectedDaySchedule.length}>
          {selectedDaySchedule.map((item) => (
            <ScheduleCard key={item._id} scheduleItem={item} />
          ))}
        </EventsGroup>
      )}
      
      {/* Мероприятия с условной виртуализацией */}
      {selectedDayEvents.length > 0 && (
        <>
          {shouldVirtualize && isMobile ? (
            <VirtualizedEventsList
              events={selectedDayEvents}
              onToggleSubscription={onToggleSubscription}
              title="Мероприятия"
              icon="🎯"
            />
          ) : (
            <EventsGroup title="Мероприятия" icon="🎯" count={selectedDayEvents.length}>
              {selectedDayEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onToggleSubscription={onToggleSubscription}
                />
              ))}
            </EventsGroup>
          )}
        </>
      )}
    </div>
  );
});
EventsList.displayName = 'EventsList';

// Мемоизированный компонент пустого состояния
const EmptySchedule = React.memo(() => (
  <EmptyState
    message="Нет событий на этот день"
    subMessage="Выберите другой день или запишитесь на мероприятие"
    emoji="📅"
  />
));
EmptySchedule.displayName = 'EmptySchedule';

// Компонент загрузки
const ScheduleLoader = React.memo(() => (
  <div className={styles.scheduleLoader}>
    <div className={styles.loaderSpinner}></div>
    <p>Загрузка расписания...</p>
  </div>
));
ScheduleLoader.displayName = 'ScheduleLoader';

const SchedulePage: React.FC<SchedulePageProps> = React.memo(({ 
  schedule, 
  events, 
  onToggleSubscription 
}) => {
  const {
    selectedDayData,
    selectedDayTitle,
    weekDaysData,
    daysContainerRef,
    handleDaySelect,
    handleToggleSubscription,
    handleTodayClick,
    isFirstLoad
  } = useScheduleOptimization({
    schedule,
    events,
    onToggleSubscription
  });

  return (
    <div className={styles.schedulePage}>
      {/* Селектор дней недели */}
      <div className={styles.weekSelector}>
        <ScheduleHeader
          title={selectedDayTitle}
          totalEvents={selectedDayData.totalEvents}
          onTodayClick={handleTodayClick}
        />
        
        <WeekSelector
          weekDaysData={weekDaysData}
          onDaySelect={handleDaySelect}
          daysContainerRef={daysContainerRef}
        />
      </div>

      {/* Секция расписания на день */}
      <div className={styles.scheduleSection}>
        {selectedDayData.isEmpty ? (
          <EmptySchedule />
        ) : (
          <EventsList
            selectedDaySchedule={selectedDayData.selectedDaySchedule}
            selectedDayEvents={selectedDayData.selectedDayEvents}
            onToggleSubscription={handleToggleSubscription}
          />
        )}
      </div>
    </div>
  );
});

SchedulePage.displayName = 'SchedulePage';

export default SchedulePage; 