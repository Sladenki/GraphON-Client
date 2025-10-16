'use client'

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { 
  Edit3, 
  Trash2, 
  Save, 
  X,
  UserPlus,
  UserX,
  LogIn,
  Share2,
  CalendarClock,
  MapPinned,
  UsersRound,
  Calendar,
  Clock
} from "lucide-react";
import { useEventRegistration } from "@/hooks/useEventRegistration";
import { useAuth } from "@/providers/AuthProvider";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { UserRole } from "@/types/user.interface";
import { useDeclensionWord } from "@/hooks/useDeclension";
import DeleteConfirmPopUp from './DeleteConfirmPopUp/DeleteConfirmPopUp';
import AttendeesPopUp from './AttendeesPopUp/AttendeesPopUp';
import styles from './EventCard.module.scss';
import ActionButton from '@/components/ui/ActionButton/ActionButton';
import { linkifyText } from '@/lib/linkify';
import { notifyError, notifySuccess } from '@/lib/notifications';
import { DatePicker, TimeInput } from '@heroui/react';
import { parseDate } from '@internationalized/date';
import { I18nProvider } from '@react-aria/i18n';

interface EventProps {
  event: {
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
  };
  isAttended?: boolean;
  onDelete?: (eventId: string) => void;
  disableRegistration?: boolean;
}

// Простой компонент аватара группы
const GroupAvatar: React.FC<{ 
  src: string; 
  alt: string; 
  fallback: string;
}> = ({ src, alt, fallback }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={styles.groupAvatar}>
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          className={styles.avatarImage}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={styles.avatarFallback}>
          {fallback.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

const EventCard: React.FC<EventProps> = ({ 
  event, 
  isAttended, 
  onDelete,
  disableRegistration
}) => {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const { canAccessEditor } = useRoleAccess(user?.role as UserRole);
  
  // Состояния
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(event);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAttendeesOpen, setIsAttendeesOpen] = useState(false);
  
  // Хуки
  const { isRegistered, toggleRegistration, isLoading } = useEventRegistration(
    event._id, 
    isAttended
  );
  
  // Проверка прав на просмотр участников
  const canViewAttendees = Boolean(
    user && (
      user.role === UserRole.Create ||
      (user._id && event.graphId?.ownerUserId && user._id === event.graphId.ownerUserId) ||
      (user.role === UserRole.Admin && !!user.selectedGraphId && (user.selectedGraphId as any)._id === event.globalGraphId)
    )
  );
  
  // Форматирование времени
  const formattedTime = useMemo(() => {
    if (event.isDateTbd) return "Дата и время уточняется";
    
    const date = new Date(event.eventDate);
    const dateStr = date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return `${dateStr}, ${event.timeFrom} - ${event.timeTo}`;
  }, [event.eventDate, event.timeFrom, event.timeTo, event.isDateTbd]);

  // Значение для HTML input[type="date"] в формате YYYY-MM-DD
  const dateInputValue = useMemo(() => {
    const value = editedEvent?.eventDate;
    if (!value) return '';
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
      // Если уже в нужном формате, отдадим как есть
      return value;
    }
    // Нормализуем к локальной дате без смещения времени
    const tzOffset = parsed.getTimezoneOffset() * 60000;
    const local = new Date(parsed.getTime() - tzOffset);
    return local.toISOString().slice(0, 10);
  }, [editedEvent?.eventDate]);
  const datePickerValue = useMemo(() => {
    return editedEvent?.eventDate ? parseDate(dateInputValue) : null;
  }, [dateInputValue, editedEvent?.eventDate]);
  
  // URL изображения
  const fullImageUrl = useMemo(() => {
    if (!event.graphId.imgPath) return '';
    const baseUrl = process.env.NEXT_PUBLIC_S3_URL;
    return `${baseUrl}/${event.graphId.imgPath}`;
  }, [event.graphId.imgPath]);
  
  // Обработчики
  const handleRegistration = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      await toggleRegistration();
    } catch (error) {
      console.error('Registration error:', error);
    }
  }, [isLoggedIn, toggleRegistration]);
  
  const handleEdit = useCallback(async () => {
    // Здесь должна быть логика сохранения изменений
    setIsEditing(false);
  }, []);
  
  const handleCancel = useCallback(() => {
    setEditedEvent(event);
    setIsEditing(false);
  }, [event]);
  
  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
  }, []);
  
  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);
  
  const handleConfirmDelete = useCallback(async () => {
    if (onDelete) {
      await onDelete(event._id);
    }
    setShowDeleteConfirm(false);
  }, [event._id, onDelete]);
  
  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);
  
  const updateEditedEvent = useCallback((key: string, value: string | boolean) => {
    setEditedEvent(prev => ({ ...prev, [key]: value }));
  }, []);
  
  // Обработчик перехода на страницу группы
  const handleGroupClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const graphId = typeof event.graphId === 'object' ? event.graphId._id : event.graphId;
    if (graphId) {
      router.push(`/groups/${graphId}`);
    }
  }, [event.graphId, router]);

  const handleShare = useCallback(async () => {
    try {
      const shareUrl = `${window.location.origin}/events/${event._id}`;
      const text = `${event.name} — ${formattedTime}${event.place ? `, ${event.place}` : ''}`;
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;

      const win = window.open(telegramUrl, '_blank', 'noopener,noreferrer');
      if (!win) {
        window.location.href = telegramUrl;
      }
      notifySuccess('Откройте Telegram и выберите чат');
    } catch (err) {
      const fallbackUrl = `${window.location.origin}/events/${event._id}`;
      try {
        if (navigator.share) {
          await navigator.share({ title: event.name, text: `${event.name}`, url: fallbackUrl } as any);
          return;
        }
      } catch {}
      try {
        await navigator.clipboard.writeText(fallbackUrl);
        notifySuccess('Ссылка скопирована в буфер обмена');
      } catch {
        notifyError('Не удалось открыть Telegram', 'Скопируйте ссылку вручную');
      }
    }
  }, [event._id, event.name, formattedTime, event.place]);
  
  // Кнопки действий
  const actionButtons = useMemo(() => {
    if (!canAccessEditor) return null;

    return (
      <div className={styles.actionButtons}>
        {isEditing ? (
          <>
            <button
              className={`${styles.actionButton} ${styles.saveButton}`}
              onClick={handleEdit}
              title="Сохранить изменения"
            >
              <Save size={16} />
            </button>
            <button
              className={`${styles.actionButton} ${styles.cancelButton}`}
              onClick={handleCancel}
              title="Отменить редактирование"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <button
              className={`${styles.actionButton} ${styles.editButton}`}
              onClick={handleStartEdit}
              disabled={!!disableRegistration}
              title="Редактировать мероприятие"
            >
              <Edit3 size={16} />
            </button>
            <button
              className={`${styles.actionButton} ${styles.deleteButton}`}
              onClick={handleDelete}
              disabled={!!disableRegistration}
              title="Удалить мероприятие"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    );
  }, [canAccessEditor, isEditing, handleEdit, handleCancel, handleStartEdit, handleDelete, disableRegistration]);

  // Кнопка регистрации
  const registerButton = useMemo(() => (
    <ActionButton
      onClick={handleRegistration}
      disabled={isLoading || !!disableRegistration}
      variant={isRegistered ? 'danger' : 'primary'}
      icon={
        isLoading ? (
          <div className={styles.spinner} />
        ) : !isLoggedIn ? (
          <LogIn size={16} />
        ) : isRegistered ? (
          <UserX size={16} />
        ) : (
          <UserPlus size={16} />
        )
      }
      label={
        disableRegistration ? 'Регистрация недоступна' : isLoggedIn
          ? (isRegistered ? 'Отменить регистрацию' : 'Зарегистрироваться')
          : 'Необходимо войти'
      }
    />
  ), [isLoggedIn, isRegistered, isLoading, handleRegistration, disableRegistration]);

  if (!event || !event._id) {
    return null;
  }

  return (
    <div className={styles.eventCardWrapper}>
      <div className={styles.eventCard}>
        {/* Header - название и группа */}
        <div className={styles.cardHeader}>
          <div className={styles.headerTop}>
            <div className={styles.groupInfo} onClick={handleGroupClick}>
              <GroupAvatar
              src={fullImageUrl}
              alt={event.graphId.name}
              fallback={event.graphId.name}
            />
              <span className={styles.groupName}>{event.graphId.name}</span>
            </div>
            
            <div className={styles.headerActions}>
              <button 
                className={styles.shareButton}
                onClick={handleShare}
                aria-label="Поделиться"
              >
                <Share2 size={16} />
              </button>
              {actionButtons}
            </div>
          </div>
          
          <div className={styles.titleSection}>
            {isEditing ? (
              <input
                type="text"
                value={editedEvent.name}
                onChange={(e) => updateEditedEvent('name', e.target.value)}
                className={styles.titleInput}
                placeholder="Название мероприятия"
              />
            ) : (
              <h2 className={styles.eventTitle}>
                {event.name}
              </h2>
            )}
          </div>
        </div>
        
        {/* Description */}
        <div className={styles.cardBody}>
        {isEditing ? (
            <textarea
            value={editedEvent.description}
              onChange={(e) => updateEditedEvent('description', e.target.value)}
              className={styles.descriptionInput}
              placeholder="Описание мероприятия"
              rows={3}
          />
        ) : (
            <div className={styles.description}>
            {linkifyText(event.description)}
            </div>
          )}
        </div>

        {/* Important Info - время, место и участники */}
        <div className={styles.importantInfo}>
          {isEditing ? (
            <>
              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="editIsDateTbd"
                  checked={editedEvent.isDateTbd || false}
                  onChange={(e) => updateEditedEvent('isDateTbd', e.target.checked)}
                />
                <label htmlFor="editIsDateTbd">Дата и время уточняется</label>
              </div>

              {!editedEvent.isDateTbd && (
                <>
                  <div className={styles.timeInfo}>
                    <CalendarClock size={20} />
                    <I18nProvider locale="ru-RU">
                      <DatePicker
                        label="Дата"
                        aria-label="Дата"
                        variant="bordered"
                        size="sm"
                        value={datePickerValue as any}
                        onChange={(v: any) => updateEditedEvent('eventDate', v ? v.toString() : '')}
                        className={styles.dateInput}
                      />
                    </I18nProvider>
                  </div>
                  <div className={styles.timeInfo}>
                    <Clock size={20} />
                    <div className={styles.timeInputs}>
                      <input
                        type="time"
                        value={editedEvent.timeFrom}
                        onChange={(e) => updateEditedEvent('timeFrom', e.target.value)}
                        className={styles.timeInput}
                      />
                      <input
                        type="time"
                        value={editedEvent.timeTo}
                        onChange={(e) => updateEditedEvent('timeTo', e.target.value)}
                        className={styles.timeInput}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className={styles.placeInfo}>
                <MapPinned size={20} />
                <input
                  type="text"
                  value={editedEvent.place}
                  onChange={(e) => updateEditedEvent('place', e.target.value)}
                  className={styles.placeInput}
                  placeholder="Место проведения"
                />
              </div>
            </>
          ) : (
            <>
              <div className={styles.timeInfo}>
                <CalendarClock size={20} />
                <span className={styles.timeText}>{formattedTime}</span>
              </div>
              
              <div className={styles.placeInfo}>
                <MapPinned size={20} />
                <span className={styles.placeText}>{event.place}</span>
              </div>
            </>
          )}

          <div className={styles.participantsInfo}>
            <UsersRound size={18} />
            <span 
              className={`${styles.participantsText} ${canViewAttendees ? styles.clickable : ''}`}
              onClick={canViewAttendees ? () => setIsAttendeesOpen(true) : undefined}
              role={canViewAttendees ? 'button' : undefined}
              tabIndex={canViewAttendees ? 0 : undefined as unknown as number}
              onKeyDown={canViewAttendees ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (canViewAttendees) {
                    setIsAttendeesOpen(true);
                  }
                }
              } : undefined}
            >
              {event.regedUsers} участников
            </span>
          </div>
        </div>

        {/* Footer - участники и кнопка регистрации (десктоп) */}
        <div className={styles.cardFooter}>

          {isEditing ? null : registerButton}

            <div className={styles.participantsInfo}>
              <UsersRound size={18} />
              <span 
                className={`${styles.participantsText} ${canViewAttendees ? styles.clickable : ''}`}
                onClick={canViewAttendees ? () => setIsAttendeesOpen(true) : undefined}
                role={canViewAttendees ? 'button' : undefined}
                tabIndex={canViewAttendees ? 0 : undefined as unknown as number}
                onKeyDown={canViewAttendees ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (canViewAttendees) {
                      setIsAttendeesOpen(true);
                    }
                  }
                } : undefined}
              >
                {event.regedUsers} участников
              </span>
            </div>
        </div>
      </div>
      
      {/* PopUp подтверждения удаления */}
      <DeleteConfirmPopUp
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        eventName={event.name}
        isDeleting={false}
      />

      {/* PopUp со списком участников */}
      <AttendeesPopUp
        isOpen={isAttendeesOpen}
        onClose={() => setIsAttendeesOpen(false)}
        eventId={event._id}
        eventName={event.name}
      />
    </div>
  );
};

export default EventCard;