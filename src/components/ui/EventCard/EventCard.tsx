import React from "react";
import styles from "./EventCard.module.scss";
import { useEventRegistration } from "@/hooks/useEventRegistration";
import { useAuth } from "@/providers/AuthProvider";

interface EventProps {
  event: any;
  isAttended?: boolean;
}

const formatDateTime = (dateString?: string, timeString?: string): string => {
  if (!dateString || !timeString) return 'Время не указано';
  
  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date(dateString);
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    
    if (isNaN(date.getTime())) return 'Некорректная дата';
    
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Ошибка форматирования даты:', error);
    return 'Ошибка формата даты';
  }
};

const formatEventTime = (startDate?: string, startTime?: string, endDate?: string, endTime?: string): string => {
  if (!startDate || !startTime || !endDate || !endTime) return 'Время не указано';

  try {
    const start = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':');
    start.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10));

    const end = new Date(endDate);
    const [endHours, endMinutes] = endTime.split(':');
    end.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10));

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Некорректная дата';

    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const durationText = duration === 1 ? 'час' : 
                        duration >= 2 && duration <= 4 ? 'часа' : 
                        'часов';

    return `Дата: ${start.toLocaleString('ru-RU', { day: 'numeric', month: 'long' })}\nВремя: ${start.toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' })} (${Math.floor(duration)} ${durationText})`;
  } catch (error) {
    console.error('Ошибка форматирования времени:', error);
    return 'Ошибка формата времени';
  }
};

const EventCard: React.FC<EventProps> = ({ event, isAttended }) => {
  const { isLoggedIn } = useAuth();

  const { isRegistered, toggleRegistration, isLoading } = useEventRegistration(
    event?._id || '', 
    isAttended
  );

  if (!event || !event._id) return null;

  return (
    <div className={styles.eventCard}>
      <div className={styles.header}>
        <h3 className={styles.title}>{event.name || 'Название не указано'}</h3>
        <span className={styles.author}>{event.graphId?.name || 'Автор не указан'}</span>
      </div>
      
      <p className={styles.description}>
        {event.description || 'Описание отсутствует'}
      </p>
      
      <div className={styles.footer}>
        <span className={styles.time}>
          {formatEventTime(event.eventDate, event.timeFrom, event.eventDate, event.timeTo)}
        </span>
        
        <button 
          className={styles.registerButton} 
          onClick={toggleRegistration}
          disabled={isLoading || !isLoggedIn}
          data-registered={isRegistered}
          data-logged={isLoggedIn}
        >
          {isLoggedIn 
            ? isRegistered 
              ? 'Отменить регистрацию' 
              : 'Зарегистрироваться' 
            : 'Не авторизирован'
          }
        </button>
      </div>
    </div>
  );
};

export default EventCard;
