'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScheduleItem, EventItem } from '@/types/schedule';
import { EmptyState } from '@/components/global/EmptyState/EmptyState';
import { CalendarX } from 'lucide-react';
import EventCard from '@/components/shared/EventCard/EventCard';
import styles from './Calendar.module.scss';

interface CalendarProps {
  schedule: ScheduleItem[];
  events: EventItem[];
  onToggleSubscription?: (eventId: string, isAttended: boolean) => void;
}

interface DayData {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasEvents: boolean;
  eventsCount: number;
}

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const Calendar: React.FC<CalendarProps> = ({ schedule, events, onToggleSubscription }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Объединяем все события по датам
  const eventsByDate = useMemo(() => {
    const eventsMap = new Map<string, { schedule: ScheduleItem[], events: EventItem[] }>();
    
    // Добавляем расписание (используем dayOfWeek для определения даты)
    schedule.forEach(item => {
      // Получаем дату на основе дня недели для текущей недели
      const today = new Date();
      const currentDay = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - currentDay + 1); // Понедельник текущей недели
      
      const eventDate = new Date(monday);
      eventDate.setDate(monday.getDate() + item.dayOfWeek - 1);
      
      const dateKey = eventDate.toDateString();
      if (!eventsMap.has(dateKey)) {
        eventsMap.set(dateKey, { schedule: [], events: [] });
      }
      eventsMap.get(dateKey)!.schedule.push(item);
    });
    
    // Добавляем мероприятия
    events.forEach(event => {
      const dateKey = new Date(event.eventDate).toDateString();
      if (!eventsMap.has(dateKey)) {
        eventsMap.set(dateKey, { schedule: [], events: [] });
      }
      eventsMap.get(dateKey)!.events.push(event);
    });
    
    return eventsMap;
  }, [schedule, events]);

  // Генерируем календарную сетку
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Понедельник = 0
    
    const days: DayData[] = [];
    
    // Добавляем дни предыдущего месяца
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      const dateKey = date.toDateString();
      const dayEvents = eventsByDate.get(dateKey);
      
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: selectedDate?.toDateString() === dateKey,
        hasEvents: !!dayEvents && (dayEvents.schedule.length > 0 || dayEvents.events.length > 0),
        eventsCount: dayEvents ? dayEvents.schedule.length + dayEvents.events.length : 0
      });
    }
    
    // Добавляем дни текущего месяца
    const today = new Date();
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateKey = date.toDateString();
      const dayEvents = eventsByDate.get(dateKey);
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: selectedDate?.toDateString() === dateKey,
        hasEvents: !!dayEvents && (dayEvents.schedule.length > 0 || dayEvents.events.length > 0),
        eventsCount: dayEvents ? dayEvents.schedule.length + dayEvents.events.length : 0
      });
    }
    
    // Добавляем дни следующего месяца для заполнения сетки
    const remainingDays = 42 - days.length; // 6 недель * 7 дней
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const dateKey = date.toDateString();
      const dayEvents = eventsByDate.get(dateKey);
      
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: selectedDate?.toDateString() === dateKey,
        hasEvents: !!dayEvents && (dayEvents.schedule.length > 0 || dayEvents.events.length > 0),
        eventsCount: dayEvents ? dayEvents.schedule.length + dayEvents.events.length : 0
      });
    }
    
    return days;
  }, [currentDate, eventsByDate, selectedDate]);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  }, []);

  const handleDayClick = useCallback((day: DayData) => {
    setSelectedDate(day.date);
  }, []);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return { schedule: [], events: [] };
    const dateKey = selectedDate.toDateString();
    return eventsByDate.get(dateKey) || { schedule: [], events: [] };
  }, [selectedDate, eventsByDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.calendarContainer}>
      {/* Календарь */}
      <div className={styles.calendar}>
        {/* Название месяца */}
        <div className={styles.monthTitle}>
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>

        {/* Дни недели */}
        <div className={styles.weekdays}>
          {WEEKDAYS.map(day => (
            <div key={day} className={styles.weekday}>
              {day}
            </div>
          ))}
        </div>

        {/* Календарная сетка */}
        <div className={styles.calendarGrid}>
          {calendarDays.map((day, index) => (
            <button
              key={index}
              className={`${styles.day} ${
                !day.isCurrentMonth ? styles.dayOtherMonth : ''
              } ${day.isToday ? styles.dayToday : ''} ${
                day.isSelected ? styles.daySelected : ''
              }`}
              onClick={() => handleDayClick(day)}
            >
              <span className={styles.dayNumber}>
                {day.date.getDate()}
              </span>
              {day.hasEvents && (
                <div className={styles.eventDot}>
                  {day.eventsCount > 1 && (
                    <span className={styles.eventCount}>{day.eventsCount}</span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Навигация */}
        <div className={styles.navigation}>
          <button 
            className={styles.navButton}
            onClick={handlePrevMonth}
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            className={styles.navButton}
            onClick={handleNextMonth}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Мероприятия ниже календаря */}
      <div className={styles.eventsSection}>
        {selectedDate ? (
          <div className={styles.selectedDayEvents}>
            <h3 className={styles.eventsSectionTitle}>
              {formatDate(selectedDate)}
            </h3>
            
            {selectedDayEvents.schedule.length === 0 && selectedDayEvents.events.length === 0 ? (
              <EmptyState
                message="Нет событий на этот день"
                subMessage="Выберите другой день или запишитесь на мероприятие"
                icon={CalendarX}
              />
            ) : (
              <div className={styles.eventsList}>
                {/* Расписание */}
                {selectedDayEvents.schedule.length > 0 && (
                  <div className={styles.eventsGroup}>
                    <h4 className={styles.eventsGroupTitle}>Занятия</h4>
                    {selectedDayEvents.schedule.map(item => (
                      <div key={item._id} className={styles.scheduleItem}>
                        <div className={styles.scheduleTime}>
                          {item.timeFrom} - {item.timeTo}
                        </div>
                        <div className={styles.scheduleTitle}>{item.name}</div>
                        <div className={styles.scheduleLocation}>
                          {(item as any).graphId?.name || 'Неизвестная группа'} • Аудитория {item.roomNumber}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Мероприятия */}
                {selectedDayEvents.events.length > 0 && (
                  <div className={styles.eventsGroup}>
                    <h4 className={styles.eventsGroupTitle}>Мероприятия</h4>
                    <div className={styles.eventCards}>
                      {selectedDayEvents.events.map(event => (
                        <EventCard
                          key={event._id}
                          event={{
                            _id: event._id,
                            graphId: event.graphId || { _id: '', name: 'Неизвестная группа' },
                            globalGraphId: event.graphId?._id || '',
                            name: event.name,
                            description: event.description,
                            place: event.place,
                            eventDate: event.eventDate,
                            timeFrom: event.timeFrom,
                            timeTo: event.timeTo,
                            regedUsers: event.regedUsers,
                            isAttended: event.isAttended
                          }}
                          isAttended={event.isAttended}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.noSelectionMessage}>
            <EmptyState
              message="Выберите день в календаре"
              subMessage="Нажмите на любой день, чтобы увидеть события"
              icon={CalendarX}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
