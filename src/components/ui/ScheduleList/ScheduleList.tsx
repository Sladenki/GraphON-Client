'use client';

import React from 'react';
import { format, startOfWeek, addDays, parseISO, isSameDay, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from './ScheduleList.module.scss';
import { EventItem, ScheduleItem } from '@/types/schedule.interface';


interface ScheduleCalendarProps {
  schedule: ScheduleItem[];
  events: EventItem[];
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ schedule, events }) => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className={styles.ScheduleList}>
      <h2>Расписание на неделю</h2>

      <div className={styles.scheduleGrid}>
        {daysOfWeek.map((date, index) => (
          <React.Fragment key={index}>
            {/* Левая колонка с днем недели */}
            <div className={styles.dayColumn}>
              <span className={styles.dayName}>{format(date, 'EEEE', { locale: ru })}</span>
              <span className={styles.dayDate}>{format(date, 'dd MMM', { locale: ru })}</span>
            </div>

            {/* Правая колонка с занятиями и мероприятиями */}
            <div className={styles.eventContainer}>
              {/* Расписание */}
              {schedule
                .filter((item) => item.dayOfWeek === index)
                .map((item) => (
                  <div key={item._id} className={styles.scheduleItem}>
                    <span className={styles.itemTitle}>{item.name}</span>
                    <span className={styles.itemDescription}>
                      {item.type === 'lecture' ? '📖 Лекция' : '🛠 Практика'} • Ауд. {item.roomNumber}
                    </span>
                    <span className={styles.itemTime}>⏰ {item.timeFrom} - {item.timeTo}</span>
                  </div>
                ))}

              {/* Мероприятия */}
              {events
                .filter((event) => isSameDay(startOfDay(parseISO(event.eventDate)), startOfDay(date)))
                .map((event) => (
                  <div key={event._id} className={styles.eventItem}>
                    <span className={styles.itemTitle}>📝 {event.name}</span>
                    <span className={styles.itemDescription}>{event.description}</span>
                    <span className={styles.itemTime}>⏰ {event.timeFrom} - {event.timeTo}</span>
                  </div>
                ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ScheduleCalendar;
