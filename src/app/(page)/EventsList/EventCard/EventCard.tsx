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

const EventCard: React.FC<EventProps> = ({ event, isAttended }) => {
  const { isLoggedIn } = useAuth();

  // Проверяем наличие event и его _id перед использованием хука
  const { isRegistered, toggleRegistration, isLoading } = useEventRegistration(
    event?._id || '', 
    isAttended
  );

  console.log('isLoggedIn', isLoggedIn)
  console.log('event', event)

  if (!event || !event._id) return null;

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
            {
              isLoggedIn ? isRegistered ? 'Отменить регистрацию' : 'Зарегистрироваться' : 'Не авторизирован'
            }
          </button>
        </div>
      </div>
    </>
  );
};

export default EventCard;
