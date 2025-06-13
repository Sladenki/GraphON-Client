'use client';

import React, { useState } from 'react';
import { format, startOfWeek, addDays, parseISO, isSameDay, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from './ScheduleList.module.scss';
import { ScheduleItem, EventItem } from '../../../types/schedule';
import { EmptyState } from '@/components/global/EmptyState/EmptyState';


interface ScheduleListProps {
  schedule: ScheduleItem[];
  events: EventItem[];
  onToggleSubscription?: (eventId: string, isAttended: boolean) => void;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({ 
  schedule, 
  events, 
  onToggleSubscription 
}) => {
  const [localEvents, setLocalEvents] = useState(events);

  const handleToggleSubscription = (eventId: string, currentStatus: boolean) => {
    // Оптимистичное обновление UI
    setLocalEvents(prev => 
      prev.map(event => 
        event._id === eventId 
          ? { 
              ...event, 
              isAttended: !currentStatus,
              regedUsers: currentStatus ? event.regedUsers - 1 : event.regedUsers + 1
            }
          : event
      )
    );

    // Вызов callback функции для обновления на сервере
    if (onToggleSubscription) {
      onToggleSubscription(eventId, !currentStatus);
    }
  };

  if ((!schedule || schedule.length === 0) && (!localEvents || localEvents.length === 0)) {
    return (
      <EmptyState
        message="Расписание пока пустое"
        subMessage="Здесь будет отображаться расписание занятий. Следи за обновлениями и не пропускай важные события!"
        emoji="📚"
      />
    );
  }

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className={styles.ScheduleList}>
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
                .filter((item: ScheduleItem) => item.dayOfWeek === index)
                .map((item: ScheduleItem) => (
                  <div key={item._id} className={styles.scheduleItem}>
                    <span className={styles.itemTitle}>{item.name}</span>
                    <span className={styles.itemDescription}>
                      {item.type === 'lecture' ? '📖 Лекция' : '🛠 Практика'} • Ауд. {item.roomNumber}
                    </span>
                    <span className={styles.itemTime}>⏰ {item.timeFrom} - {item.timeTo}</span>
                  </div>
                ))}

              {/* Мероприятия */}
              {localEvents
                .filter((event: EventItem) => 
                  isSameDay(startOfDay(parseISO(event.eventDate)), startOfDay(date))
                )
                .map((event: EventItem) => (
                  <div key={event._id} className={styles.eventItem}>
                    <div className={styles.eventHeader}>
                      <span className={styles.itemTitle}>📝 {event.name}</span>
                      {event.graphId && (
                        <span className={styles.graphName}>{event.graphId.name}</span>
                      )}
                    </div>
                    <span className={styles.itemDescription}>{event.description}</span>
                    <span className={styles.itemDescription}>📍 {event.place}</span>
                    <span className={styles.itemTime}>⏰ {event.timeFrom} - {event.timeTo}</span>
                    
                    <div className={styles.eventActions}>
                      <span className={styles.registeredCount}>
                        👥 {event.regedUsers} участников
                      </span>
                      <button
                        className={`${styles.subscriptionButton} ${
                          event.isAttended ? styles.subscribed : styles.unsubscribed
                        }`}
                        onClick={() => handleToggleSubscription(event._id, event.isAttended)}
                      >
                        {event.isAttended ? '✓ Участвую' : '+ Участвовать'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
