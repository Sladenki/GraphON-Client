import React from "react";
import styles from "./EventCard.module.scss";
import { useEventRegistration } from "@/hooks/useEventRegistration";

interface EventProps {
  event: {
    _id?: string;
    name?: string;
    description?: string;
    eventDate?: string;
    timeFrom?: string;
    timeTo?: string;
    graphId?: {
      name?: string;
    };
  };
}

const formatDateTime = (dateString?: string, timeString?: string): string => {
  if (!dateString || !timeString) return 'Время не указано';
  
  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date(dateString);
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    
    if (isNaN(date.getTime())) return 'Некорректная дата';
    
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Ошибка форматирования даты:', error);
    return 'Ошибка формата даты';
  }
};

const EventCard: React.FC<EventProps> = ({ event }) => {

  console.log('event', event)

  if (!event?._id) return null;

  const { isRegistered, toggleRegistration, isLoading } = useEventRegistration(event._id);

  return (
    <>
      <div className={styles.eventCard}>
        <div className={styles.header}>
          <h3 className={styles.title}>{event.name || 'Название не указано'}</h3>
          <span className={styles.author}>{event.graphId?.name || 'Автор не указан'}</span>
        </div>
        <p className={styles.description}>{event.description || 'Описание отсутствует'}</p>
        <div className={styles.footer}>
          <span className={styles.time}>
            {formatDateTime(event.eventDate, event.timeFrom)} - {formatDateTime(event.eventDate, event.timeTo)}
          </span>
          <button 
            className={styles.registerButton} 
            onClick={toggleRegistration}
            disabled={isLoading}
          >
            {isRegistered ? 'Отменить регистрацию' : 'Зарегистрироваться'}
          </button>
        </div>
      </div>
    </>
  );
};

export default EventCard;
