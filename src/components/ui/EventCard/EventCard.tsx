import React, { useEffect, useState } from "react";
import styles from "./EventCard.module.scss";
import { useEventRegistration } from "@/hooks/useEventRegistration";
import { useAuth } from "@/providers/AuthProvider";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { EventService } from "@/services/event.service";
import { UserRole } from "@/types/user.interface";
import { notifyError, notifyInfo, notifySuccess } from "@/lib/notifications";
import { useRouter } from "next/navigation";


interface EventProps {
  event: {
    _id: string;
    graphId: {
      _id: string;
      name: string;
    };
    globalGraphId: string;
    name: string;
    description: string;
    place: string;
    eventDate: string;
    timeFrom: string;
    timeTo: string;
    regedUsers: number;
    isAttended: boolean;
  };
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

    return `${start.toLocaleString('ru-RU', { day: 'numeric', month: 'long' })}\n${start.toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' })} (${Math.floor(duration)} ${durationText})`;
  } catch (error) {
    console.error('Ошибка форматирования времени:', error);
    return 'Ошибка формата времени';
  }
};

const EventCard: React.FC<EventProps> = ({ event: initialEvent, isAttended, onDelete }) => {
  const { isLoggedIn, user } = useAuth();
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

  const { isRegistered, toggleRegistration, isLoading, error } = useEventRegistration(
    event?._id || '', 
    isAttended
  );

  const router = useRouter();

  const handleRegistration = async () => {
    console.log('123')

    if (!isLoggedIn) {
      router.push('/signIn');
      return;
    }

    try {
      await toggleRegistration();

      // Уведомления показываем сразу на основе оптимистичного состояния
      if (!isRegistered) {
        notifySuccess("Вы записались на мероприятие", "Оно появится в вашем личном расписании");
      } else {
        notifyInfo("Вы отменили участие", "Мероприятие удалено из вашего расписания");
      }

    } catch (error) {
      console.error('Ошибка при изменении статуса регистрации:', error);
      // Показываем уведомление об ошибке
      notifyError("Произошла ошибка", "Не удалось изменить статус регистрации");
    }
  };

  // Синхронизируем локальное состояние с текущим статусом регистрации
  useEffect(() => {
    const originalCount = initialEvent.regedUsers || 0;
    const wasInitiallyRegistered = isAttended || false;
    
    let updatedCount = originalCount;
    
    // Обновляем счетчик только если статус изменился от начального
    if (isRegistered !== wasInitiallyRegistered) {
      updatedCount = isRegistered 
        ? originalCount + 1
        : Math.max(0, originalCount - 1);
    }
    
    setEvent(prev => ({
      ...prev,
      regedUsers: updatedCount
    }));
  }, [isRegistered, initialEvent.regedUsers, isAttended]);

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
        graphId: event.graphId._id
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
        <div className={styles.titleSection}>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={editedEvent.name}
              onChange={handleChange}
              className={styles.editInput}
              placeholder="Название мероприятия"
            />
          ) : (
            <h3 className={styles.title}>{event.name}</h3>
          )}
          <span className={styles.author}>{event.graphId.name}</span>
        </div>
        
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
              <>
                <button 
                  className={styles.editButton}
                  onClick={() => setIsEditing(true)}
                  title="Редактировать мероприятие"
                >
                  ✏️
                </button>
                <button 
                  className={styles.deleteButton}
                  onClick={handleDelete}
                  title="Удалить мероприятие"
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      {isEditing ? (
        <textarea
          name="description"
          value={editedEvent.description}
          onChange={handleChange}
          className={styles.editTextarea}
          placeholder="Описание мероприятия"
        />
      ) : (
        <p className={styles.description}>{event.description}</p>
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
            <span className={styles.location}>
              <span className={styles.locationIcon}>📍</span>
              <span>{event.place}</span>
            </span>
            <div className={styles.usersCount}>
              <span className={styles.usersIcon}>👥</span>
              <span>{event.regedUsers}</span>
            </div>
          </div>
        )}
        
        <button 
          className={styles.registerButton} 
          onClick={handleRegistration}
          disabled={isLoading}
          data-registered={isRegistered}
          data-logged={isLoggedIn}
        >
          {isLoggedIn 
            ? isRegistered 
              ? 'Отменить регистрацию' 
              : 'Зарегистрироваться' 
            : 'Войдите, чтобы зарегистрироваться'
          }
        </button>
      </div>
    </div>
  );
};

export default EventCard;
