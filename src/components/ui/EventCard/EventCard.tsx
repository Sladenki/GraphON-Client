'use client'

import React, { useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Input,
  Textarea,
  Chip,
  Tooltip,
  Divider,
  ButtonGroup,
  Spinner,
  Image as HeroImage
} from "@heroui/react";
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
import { useEventCardOptimization } from './useEventCardOptimization';
import { useDeclensionWord } from "@/hooks/useDeclension";
import DeleteConfirmPopUp from './DeleteConfirmPopUp/DeleteConfirmPopUp';
import AttendeesPopUp from './AttendeesPopUp/AttendeesPopUp';
// import { useRouter } from 'next/navigation';
import styles from './EventCard.module.scss';
import { linkifyText } from '@/lib/linkify';
import { notifyError, notifySuccess } from '@/lib/notifications';

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

// Lazy загружаемое изображение для графа
const LazyGraphAvatar = React.memo<{ 
  src: string; 
  alt: string; 
  fallback: string;
}>(({ src, alt, fallback }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (!src || hasError) {
      setHasError(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && imgRef.current) {
          const nativeImg = new window.Image();
          nativeImg.onload = () => setIsLoaded(true);
          nativeImg.onerror = () => setHasError(true);
          nativeImg.src = src;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, hasError]);

  return (
    <div className={styles.graphAvatar} ref={imgRef}>
      {isLoaded && !hasError ? (
        <HeroImage
          src={src}
          alt={alt}
          className={styles.avatarImage}
          width={48}
          height={48}
          loading="lazy"
        />
      ) : (
        <div className={styles.avatarFallback}>
          {fallback.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
});
LazyGraphAvatar.displayName = 'LazyGraphAvatar';

// Оптимизированные компоненты для редактирования без лишних ререндеров
const EditFormInputs = React.memo<{ 
  editedEvent: any; 
  updateEditedEvent: (key: string, value: string | boolean) => void;
}>(({ editedEvent, updateEditedEvent }) => {
  // Мемоизированные обработчики для предотвращения ререндеров
  const handleDateChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateEditedEvent('eventDate', e.target.value);
  }, [updateEditedEvent]);

  const handleTimeFromChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateEditedEvent('timeFrom', e.target.value);
  }, [updateEditedEvent]);

  const handleTimeToChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateEditedEvent('timeTo', e.target.value);
  }, [updateEditedEvent]);

  const handlePlaceChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateEditedEvent('place', e.target.value);
  }, [updateEditedEvent]);

  const handleIsDateTbdChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateEditedEvent('isDateTbd', e.target.checked);
  }, [updateEditedEvent]);

  return (
  <div className={styles.editForm}>
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
        <input
          type="checkbox"
          id="editIsDateTbd"
          checked={editedEvent.isDateTbd || false}
          onChange={handleIsDateTbdChange}
          style={{ width: '16px', height: '16px' }}
        />
        <label htmlFor="editIsDateTbd" style={{ fontSize: '14px', color: '#374151' }}>
          Дата и время уточняется
        </label>
      </div>
    </div>

    {!editedEvent.isDateTbd && (
      <>
        <Input
          type="date"
          label="Дата мероприятия"
          value={editedEvent.eventDate}
          onChange={handleDateChange}
          variant="bordered"
          startContent={<Calendar size={16} />}
          className={styles.dateInput}
        />
        <div className={styles.timeInputs}>
          <Input
            type="time"
            label="Время начала"
            value={editedEvent.timeFrom}
            onChange={handleTimeFromChange}
            variant="bordered"
            startContent={<Clock size={16} />}
            className={styles.timeInput}
          />
          <Input
            type="time"
            label="Время окончания"
            value={editedEvent.timeTo}
            onChange={handleTimeToChange}
            variant="bordered"
            startContent={<Clock size={16} />}
            className={styles.timeInput}
          />
        </div>
      </>
    )}

    <Input
      label="Место проведения"
      value={editedEvent.place}
      onChange={handlePlaceChange}
      variant="bordered"
      startContent={<MapPinned size={16} />}
      placeholder="Введите место проведения"
      className={styles.placeInput}
    />
  </div>
  );
});

EditFormInputs.displayName = 'EditFormInputs';

// Оптимизированный компонент для редактирования названия
const TitleInput = React.memo<{
  value: string;
  onChange: (value: string) => void;
}>(({ value, onChange }) => {
  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder="Название мероприятия"
      variant="bordered"
      size="lg"
      classNames={{
        input: styles.titleInput
      }}
    />
  );
});
TitleInput.displayName = 'TitleInput';

// Оптимизированный компонент для редактирования описания
const DescriptionTextarea = React.memo<{
  value: string;
  onChange: (value: string) => void;
}>(({ value, onChange }) => {
  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <Textarea
      value={value}
      onChange={handleChange}
      placeholder="Описание мероприятия"
      variant="bordered"
      minRows={3}
      maxRows={6}
      className={styles.descriptionInput}
    />
  );
});
DescriptionTextarea.displayName = 'DescriptionTextarea';

const EventInfo = React.memo(({ 
  formattedTime, 
  place, 
  regedUsers,
  canViewAttendees,
  onParticipantsClick
}: { 
  formattedTime: string, 
  place: string, 
  regedUsers: number,
  canViewAttendees?: boolean,
  onParticipantsClick?: () => void
}) => {
  const correctRegedUsers = useDeclensionWord(regedUsers, 'PARTICIPANT');
  
  return (
    <div className={styles.infoSection}>
      <div className={styles.infoItem}>
        <CalendarClock size={18} />
        <span className={styles.infoText}>{formattedTime}</span>
      </div>
      
      <div className={styles.infoItem}>
        <MapPinned size={18} />
        <span className={styles.infoText}>{place}</span>
      </div>
      
      <div
        className={`${styles.infoItem} ${canViewAttendees ? styles.clickable : ''}`}
        onClick={canViewAttendees ? onParticipantsClick : undefined}
        role={canViewAttendees ? 'button' : undefined}
        tabIndex={canViewAttendees ? 0 : undefined as unknown as number}
        onKeyDown={canViewAttendees ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (onParticipantsClick) {
              onParticipantsClick();
            }
          }
        } : undefined}
      >
        <UsersRound size={18} />
        <span className={styles.infoText}>{regedUsers} {correctRegedUsers}</span>
      </div>
    </div>
  );
});

EventInfo.displayName = 'EventInfo';

const EventCard: React.FC<EventProps> = React.memo(({ 
  event: initialEvent, 
  isAttended, 
  onDelete,
  disableRegistration
}) => {
  // const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const { canAccessEditor } = useRoleAccess(user?.role as UserRole);
  const [isAttendeesOpen, setIsAttendeesOpen] = React.useState(false);
  const canViewAttendees = Boolean(
    user && (
      user.role === UserRole.Create ||
      (user._id && initialEvent.graphId?.ownerUserId && user._id === initialEvent.graphId.ownerUserId) ||
      // @ts-ignore
      (user.role === UserRole.Admin && !!user.selectedGraphId && user.selectedGraphId._id === initialEvent.globalGraphId)
    )
  );
  
  const { isRegistered, toggleRegistration, isLoading } = useEventRegistration(
    initialEvent?._id || '', 
    isAttended
  );

  const {
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
  } = useEventCardOptimization({
    initialEvent,
    isAttended,
    onDelete,
    isLoggedIn,
    // @ts-expect-error 123
    toggleRegistration,
    isRegistered,
    isLoading
  });

  // Мемоизированные элементы для предотвращения лишних рендеров
  const actionButtons = useMemo(() => {
    if (!canAccessEditor) return null;

    return (
      <ButtonGroup variant="flat" size="sm" className={styles.actionButtons}>
        {isEditing ? (
          <>
            <Tooltip content="Сохранить изменения">
              <Button
                isIconOnly
                color="success"
                variant="flat"
                onPress={handleEdit}
                className={styles.actionButton}
              >
                <Save size={16} />
              </Button>
            </Tooltip>
            <Tooltip content="Отменить редактирование">
              <Button
                isIconOnly
                color="default"
                variant="flat"
                onPress={handleCancel}
                className={styles.actionButton}
              >
                <X size={16} />
              </Button>
            </Tooltip>
          </>
        ) : (
          <>
            <Tooltip content="Редактировать мероприятие">
              <Button
                isIconOnly
                color="primary"
                variant="flat"
                isDisabled={!!disableRegistration}
                onPress={handleStartEdit}
                className={styles.actionButton}
              >
                <Edit3 size={16} />
              </Button>
            </Tooltip>
            <Tooltip content="Удалить мероприятие">
              <Button
                isIconOnly
                color="danger"
                variant="flat"
                isDisabled={!!disableRegistration}
                onPress={handleDelete}
                className={styles.actionButton}
              >
                <Trash2 size={16} />
              </Button>
            </Tooltip>
          </>
        )}
      </ButtonGroup>
    );
  }, [canAccessEditor, isEditing, handleEdit, handleCancel, handleStartEdit, handleDelete, disableRegistration]);

  const registerButton = useMemo(() => (
    <Button
      color={isLoggedIn ? (isRegistered ? "danger" : "primary") : "default"}
      variant={isRegistered ? "flat" : "solid"}
      size="md"
      onPress={handleRegistration}
      isDisabled={isLoading || !!disableRegistration}
      startContent={
        isLoading ? (
          <Spinner size="sm" />
        ) : !isLoggedIn ? (
          <LogIn size={16} />
        ) : isRegistered ? (
          <UserX size={16} />
        ) : (
          <UserPlus size={16} />
        )
      }
      className={styles.registerButton}
      style={registerButtonStyles}
    >
      {disableRegistration ? 'Регистрация недоступна' : isLoggedIn 
        ? isRegistered 
          ? 'Отменить регистрацию' 
          : 'Зарегистрироваться' 
        : 'Войдите, чтобы зарегистрироваться'
      }
    </Button>
  ), [isLoggedIn, isRegistered, isLoading, handleRegistration, registerButtonStyles, disableRegistration]);

  const handleShare = React.useCallback(async () => {
    try {
      const shareUrl = `${window.location.origin}/events/${event._id}`;
      const text = `${event.name} — ${formattedTime}${event.place ? `, ${event.place}` : ''}`;
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;

      const win = window.open(telegramUrl, '_blank', 'noopener,noreferrer');
      if (!win) {
        // Попап заблокирован — пробуем навигацию текущим окном
        window.location.href = telegramUrl;
      }
      notifySuccess('Откройте Telegram и выберите чат');
    } catch (err) {
      // Фолбек: системный share, затем буфер обмена
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
  }, [event?._id, event?.name, formattedTime, event?.place]);

  // Навигация по клику отключена по требованию

  // Early return для невалидных данных
  if (!event || !event._id) {
    return null;
  }

  return (
    <div className={styles.eventCardWrapper}>
      <div className={styles.eventCard}>
        {/* Header - название и группа */}
        <div className={styles.cardHeader}>
          <div className={styles.headerTop}>
            <div className={styles.groupInfo}>
              <div className={styles.groupAvatar}>
                <LazyGraphAvatar
                  src={fullImageUrl}
                  alt={event.graphId.name}
                  fallback={event.graphId.name}
                />
              </div>
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
              <TitleInput
                value={editedEvent.name}
                onChange={(value) => updateEditedEvent('name', value)}
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
            <DescriptionTextarea
              value={editedEvent.description}
              onChange={(value) => updateEditedEvent('description', value)}
            />
          ) : (
            <div className={styles.description}>
              {linkifyText(event.description)}
            </div>
          )}
        </div>

        {/* Important Info - время и место */}
        <div className={styles.importantInfo}>
          <div className={styles.timeInfo}>
            <CalendarClock size={20} />
            <span className={styles.timeText}>{formattedTime}</span>
          </div>
          
          <div className={styles.placeInfo}>
            <MapPinned size={20} />
            <span className={styles.placeText}>{event.place}</span>
          </div>
        </div>

        {/* Footer - участники и кнопка регистрации */}
        <div className={styles.cardFooter}>
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
          
          {isEditing ? (
            <EditFormInputs 
              editedEvent={editedEvent} 
              updateEditedEvent={updateEditedEvent}
            />
          ) : (
            registerButton
          )}
        </div>
      </div>
      
      {/* PopUp подтверждения удаления */}
      <DeleteConfirmPopUp
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        eventName={event.name}
        isDeleting={isDeleting}
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
});

EventCard.displayName = 'EventCard';

export default EventCard;