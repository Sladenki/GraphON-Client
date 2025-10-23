'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScheduleItem, EventItem } from '@/types/schedule';
import { EmptyState } from '@/components/global/EmptyState/EmptyState';
import { CalendarX } from 'lucide-react';
import EventCard from '@/components/shared/EventCard/EventCard';
import ScheduleCard from '@/components/shared/ScheduleCard/ScheduleCard';
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
    
    const days: (DayData | null)[] = [];
    
    // Добавляем пустые ячейки для выравнивания начала месяца
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
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
        {/* Заголовок с навигацией */}
        <div className={styles.calendarHeader}>
          <button 
            className={styles.navButton}
            onClick={handlePrevMonth}
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className={styles.monthTitle}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          
          <button 
            className={styles.navButton}
            onClick={handleNextMonth}
            aria-label="Следующий месяц"
          >
            <ChevronRight size={24} />
          </button>
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
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={index} className={styles.emptyDay} />;
            }
            
            return (
              <button
                key={index}
                className={`${styles.day} ${
                  day.isToday ? styles.dayToday : ''
                } ${day.isSelected ? styles.daySelected : ''}`}
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
            );
          })}
        </div>
      </div>

      {/* Мероприятия ниже календаря */}
      {selectedDate && (selectedDayEvents.schedule.length > 0 || selectedDayEvents.events.length > 0) && (
        <div className={styles.eventsSection} data-swipe-enabled="true">
          {/* Расписание */}
          {selectedDayEvents.schedule.map(item => (
            <ScheduleCard
              key={item._id}
              item={item}
            />
          ))}
          
          {/* Мероприятия */}
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
      )}
    </div>
  );
};

export default Calendar;
