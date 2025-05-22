import React, { useState } from "react";
import styles from "./EventCard.module.scss";
import { useEventRegistration } from "@/hooks/useEventRegistration";
import { useAuth } from "@/providers/AuthProvider";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { EventService } from "@/services/event.service";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/user.interface";

interface EventProps {
  event: any;
  isAttended?: boolean;
  onDelete?: (eventId: string) => void;
}

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

const EventCard: React.FC<EventProps> = ({ event: initialEvent, isAttended, onDelete }) => {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const { canAccessEditor } = useRoleAccess(user?.role as UserRole);
  const [isEditing, setIsEditing] = useState(false);
  const [event, setEvent] = useState(initialEvent);
  const [editedEvent, setEditedEvent] = useState({
    name: initialEvent.name,
    description: initialEvent.description,
    eventDate: initialEvent.eventDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    timeFrom: initialEvent.timeFrom,
    timeTo: initialEvent.timeTo
  });

  const { isRegistered, toggleRegistration, isLoading } = useEventRegistration(
    event?._id || '', 
    isAttended
  );

  const handleRegistration = async () => {
    try {
      await toggleRegistration();
      // Обновляем количество зарегистрированных пользователей
      setEvent((prev: typeof event) => ({
        ...prev,
        regedUsers: isRegistered 
          ? (prev.regedUsers || 1) - 1  // Уменьшаем при отмене регистрации
          : (prev.regedUsers || 0) + 1  // Увеличиваем при регистрации
      }));
    } catch (error) {
      console.error('Ошибка при изменении статуса регистрации:', error);
    }
  };

  const handleDelete = async () => {
    if (!event._id) return;
    
    try {
      await EventService.deleteEvent(event._id);
      onDelete?.(event._id);
    } catch (error) {
      console.error('Ошибка при удалении мероприятия:', error);
    }
  };

  const handleEdit = async () => {
    if (!event._id) return;
    
    try {
      const updatedEvent = await EventService.updateEvent(event._id, {
        ...editedEvent,
        graphId: event.graphId?._id || ''
      });
      setEvent(updatedEvent.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка при редактировании мероприятия:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedEvent(prev => ({ ...prev, [name]: value }));
  };

  if (!event || !event._id) return null;

  return (
    <div className={styles.eventCard}>
      <div className={styles.header}>
        {isEditing ? (
          <input
            type="text"
            name="name"
            value={editedEvent.name}
            onChange={handleChange}
            className={styles.editInput}
          />
        ) : (
          <h3 className={styles.title}>{event.name || 'Название не указано'}</h3>
        )}
        <span className={styles.author}>{event.graphId?.name || 'Автор не указан'}</span>
        {canAccessEditor && (
          <div className={styles.actions}>
            {isEditing ? (
              <>
                <button 
                  className={styles.saveButton}
                  onClick={handleEdit}
                  title="Сохранить изменения"
                >
                  💾
                </button>
                <button 
                  className={styles.cancelButton}
                  onClick={() => {
                    setIsEditing(false);
                    setEditedEvent({
                      name: event.name,
                      description: event.description,
                      eventDate: event.eventDate?.split('T')[0] || new Date().toISOString().split('T')[0],
                      timeFrom: event.timeFrom,
                      timeTo: event.timeTo
                    });
                  }}
                  title="Отменить редактирование"
                >
                  ❌
                </button>
              </>
            ) : (
              <button 
                className={styles.editButton}
                onClick={() => setIsEditing(true)}
                title="Редактировать мероприятие"
              >
                ✏️
              </button>
            )}
            <button 
              className={styles.deleteButton}
              onClick={handleDelete}
              title="Удалить мероприятие"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
      
      {isEditing ? (
        <textarea
          name="description"
          value={editedEvent.description}
          onChange={handleChange}
          className={styles.editTextarea}
        />
      ) : (
        <p className={styles.description}>
          {event.description || 'Описание отсутствует'}
        </p>
      )}
      
      <div className={styles.footer}>
        {isEditing ? (
          <div className={styles.editTime}>
            <input
              type="date"
              name="eventDate"
              value={editedEvent.eventDate}
              onChange={handleChange}
              className={styles.editInput}
            />
            <div className={styles.timeInputs}>
              <input
                type="time"
                name="timeFrom"
                value={editedEvent.timeFrom}
                onChange={handleChange}
                className={styles.editInput}
              />
              <input
                type="time"
                name="timeTo"
                value={editedEvent.timeTo}
                onChange={handleChange}
                className={styles.editInput}
              />
            </div>
          </div>
        ) : (
          <div className={styles.eventInfo}>
            <span className={styles.time}>
              {formatEventTime(event.eventDate, event.timeFrom, event.eventDate, event.timeTo)}
            </span>
            <div className={styles.usersCount}>
              <span className={styles.usersIcon}>👥</span>
              <span>{event.regedUsers || 0}</span>
            </div>
          </div>
        )}
        
        <button 
          className={styles.registerButton} 
          onClick={handleRegistration}
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
