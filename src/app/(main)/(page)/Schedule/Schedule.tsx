'use client';

import React from 'react';
import { Chip, Button } from '@heroui/react';
import { EmptyState } from '@/components/global/EmptyState/EmptyState';
import { ScheduleItem, EventItem } from '@/types/schedule';
import { useScheduleOptimization } from './useScheduleOptimization';
import { ScheduleCard, EventCard, DayButton, EventsGroup } from './ScheduleComponents';
import styles from './Schedule.module.scss';

interface SchedulePageProps {
  schedule: ScheduleItem[];
  events: EventItem[];
  onToggleSubscription?: (eventId: string, isAttended: boolean) => void;
}

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
        {totalEvents} событий
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

// Мемоизированный компонент списка событий
const EventsList = React.memo<{
  selectedDaySchedule: ScheduleItem[];
  selectedDayEvents: EventItem[];
  onToggleSubscription: (eventId: string, currentStatus: boolean) => void;
}>(({ selectedDaySchedule, selectedDayEvents, onToggleSubscription }) => (
  <div className={styles.eventsList}>
    {/* Расписание занятий */}
    {selectedDaySchedule.length > 0 && (
      <EventsGroup title="Занятия" icon="📚" count={selectedDaySchedule.length}>
        {selectedDaySchedule.map((item) => (
          <ScheduleCard key={item._id} scheduleItem={item} />
        ))}
      </EventsGroup>
    )}
    
    {/* Мероприятия */}
    {selectedDayEvents.length > 0 && (
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
  </div>
));
EventsList.displayName = 'EventsList';

// Мемоизированный компонент пустого состояния
const EmptySchedule = React.memo(() => (
  <EmptyState
    message="Нет событий на этот день"
    subMessage="Выберите другой день или создайте новое мероприятие"
    emoji="📅"
  />
));
EmptySchedule.displayName = 'EmptySchedule';

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
    handleTodayClick
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