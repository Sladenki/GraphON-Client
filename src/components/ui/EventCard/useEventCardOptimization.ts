import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notifyError, notifyInfo, notifySuccess } from '@/lib/notifications';
import { EventService } from '@/services/event.service';

interface Event {
  _id: string;
  graphId: {
    _id: string;
    name: string;
    ownerUserId?: string;
    imgPath?: string;
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
  isDateTbd?: boolean;
}

interface UseEventCardOptimizationProps {
  initialEvent: Event;
  isAttended?: boolean;
  onDelete?: (eventId: string) => void;
  isLoggedIn: boolean;
  toggleRegistration: () => Promise<void>;
  isRegistered: boolean;
  isLoading: boolean;
}

export const useEventCardOptimization = ({
  initialEvent,
  isAttended,
  onDelete,
  isLoggedIn,
  toggleRegistration,
  isRegistered,
  isLoading
}: UseEventCardOptimizationProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [event, setEvent] = useState<Event>(initialEvent);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Мемоизируем начальное состояние редактирования
  const initialEditState = useMemo(() => ({
    name: initialEvent.name,
    description: initialEvent.description,
    eventDate: initialEvent.eventDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    timeFrom: initialEvent.timeFrom,
    timeTo: initialEvent.timeTo,
    place: initialEvent.place,
    isDateTbd: initialEvent.isDateTbd || false
  }), [initialEvent]);

  const [editedEvent, setEditedEvent] = useState(initialEditState);

  // Обновляем количество участников с оптимизацией
  useEffect(() => {
    const originalCount = initialEvent.regedUsers || 0;
    const wasInitiallyRegistered = isAttended || false;
    
    let updatedCount = originalCount;
    
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

  // Мемоизированный URL изображения
  const fullImageUrl = useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_S3_URL;
    return event?.graphId?.imgPath ? `${baseUrl}/${event.graphId.imgPath}` : '';
  }, [event?.graphId?.imgPath]);

  // Мемоизированное форматирование времени
  const formattedTime = useMemo(() => {
    const { eventDate, timeFrom, timeTo, isDateTbd } = event;
    
    // Если дата уточняется, показываем соответствующее сообщение
    if (isDateTbd) return 'Дата и время уточняется';
    
    if (!eventDate || !timeFrom || !timeTo) return 'Время не указано';

    try {
      const start = new Date(eventDate);
      const [startHours, startMinutes] = timeFrom.split(':');
      start.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10));

      const end = new Date(eventDate);
      const [endHours, endMinutes] = timeTo.split(':');
      end.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10));

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'Некорректная дата';

      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const durationText = duration === 1 ? 'час' : 
                          duration >= 2 && duration <= 4 ? 'часа' : 
                          'часов';

      return `${start.toLocaleString('ru-RU', { day: 'numeric', month: 'long' })}\n${start.toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' })} (${Math.floor(duration)} ${durationText})`;
    } catch {
      return 'Ошибка формата времени';
    }
  }, [event.eventDate, event.timeFrom, event.timeTo, event.isDateTbd]);

  // Мемоизированные обработчики
  const handleRegistration = useCallback(async () => {
    if (!isLoggedIn) {
      router.push('/signIn');
      return;
    }

    try {
      await toggleRegistration();

      if (!isRegistered) {
        notifySuccess("Вы записались на мероприятие", "Оно появится в вашем личном расписании");
      } else {
        notifyInfo("Вы отменили участие", "Мероприятие удалено из вашего расписания");
      }
    } catch {
      notifyError("Произошла ошибка", "Не удалось изменить статус регистрации");
    }
  }, [isLoggedIn, isRegistered, router, toggleRegistration]);

  // Показать PopUp подтверждения удаления
  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  // Подтвержденное удаление
  const handleConfirmDelete = useCallback(async () => {
    if (!event._id) return;
    
    setIsDeleting(true);
    try {
      await EventService.deleteEvent(event._id);
      setShowDeleteConfirm(false);
      notifySuccess("Мероприятие удалено", "Мероприятие успешно удалено из системы");
      onDelete?.(event._id);
    } catch {
      notifyError("Ошибка", "Не удалось удалить мероприятие");
    } finally {
      setIsDeleting(false);
    }
  }, [event._id, onDelete]);

  // Отмена удаления
  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  const handleEdit = useCallback(async () => {
    if (!event._id) return;
    
    try {
      const updatedEvent = await EventService.updateEvent(event._id, {
        ...editedEvent,
        graphId: event.graphId._id,
        // Если дата уточняется, отправляем isDateTbd: true
        ...(editedEvent.isDateTbd && { eventDate: undefined, timeFrom: undefined, timeTo: undefined })
      });
      setEvent(updatedEvent.data);
      setIsEditing(false);
      notifySuccess("Успешно", "Мероприятие обновлено");
    } catch {
      notifyError("Ошибка", "Не удалось обновить мероприятие");
    }
  }, [event._id, event.graphId._id, editedEvent]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditedEvent(initialEditState);
  }, [initialEditState]);

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Мгновенное обновление состояния для отзывчивого интерфейса
  const updateEditedEvent = useCallback((key: string, value: string | boolean) => {
      setEditedEvent(prev => ({ ...prev, [key]: value }));
  }, []);

  // Мемоизированные стили кнопки регистрации
  const registerButtonStyles = useMemo(() => ({
    backgroundColor: isLoggedIn 
      ? (isRegistered 
        ? 'rgba(239, 68, 68, 0.2)' 
        : 'rgb(150, 130, 238)') 
      : 'rgba(100, 116, 139, 0.15)',
    color: isLoggedIn 
      ? (isRegistered 
        ? 'rgb(239, 68, 68)' 
        : 'white') 
      : 'var(--heroui-default)',
    border: isLoggedIn 
      ? (isRegistered 
        ? '1px solid rgba(239, 68, 68, 0.3)' 
        : '1px solid rgb(150, 130, 238)') 
      : '1px solid rgba(100, 116, 139, 0.25)'
  }), [isLoggedIn, isRegistered]);

  // Удален код очистки таймера, так как дебаунсинг больше не используется

  return {
    event,
    editedEvent,
    isEditing,
    fullImageUrl,
    formattedTime,
    registerButtonStyles,
    showDeleteConfirm,
    isDeleting,
    handleRegistration,
    handleDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleEdit,
    handleCancel,
    handleStartEdit,
    updateEditedEvent
  };
}; 