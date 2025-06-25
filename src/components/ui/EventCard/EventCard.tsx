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
import DeleteConfirmPopUp from './DeleteConfirmPopUp';
import styles from './EventCard.module.scss';

interface EventProps {
  event: {
    _id: string;
    graphId: {
      _id: string;
      name: string;
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
  };
  isAttended?: boolean;
  onDelete?: (eventId: string) => void;
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
  updateEditedEvent: (key: string, value: string) => void;
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

  return (
  <div className={styles.editForm}>
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
  regedUsers 
}: { 
  formattedTime: string, 
  place: string, 
  regedUsers: number 
}) => (
  <div className={styles.infoSection}>
    <div className={styles.infoItem}>
      <CalendarClock size={18} />
      <span className={styles.infoText}>{formattedTime}</span>
    </div>
    
    <div className={styles.infoItem}>
      <MapPinned size={18} />
      <span className={styles.infoText}>{place}</span>
    </div>
    
    <div className={styles.infoItem}>
      <UsersRound size={18} />
      <span className={styles.infoText}>{regedUsers} участников</span>
    </div>
  </div>
));

EventInfo.displayName = 'EventInfo';

const EventCard: React.FC<EventProps> = React.memo(({ 
  event: initialEvent, 
  isAttended, 
  onDelete 
}) => {
  const { isLoggedIn, user } = useAuth();
  const { canAccessEditor } = useRoleAccess(user?.role as UserRole);
  
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
  }, [canAccessEditor, isEditing, handleEdit, handleCancel, handleStartEdit, handleDelete]);

  const registerButton = useMemo(() => (
    <Button
      color={isLoggedIn ? (isRegistered ? "danger" : "primary") : "default"}
      variant={isRegistered ? "flat" : "solid"}
      size="md"
      onPress={handleRegistration}
      isDisabled={isLoading}
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
      {isLoggedIn 
        ? isRegistered 
          ? 'Отменить регистрацию' 
          : 'Зарегистрироваться' 
        : 'Войдите, чтобы зарегистрироваться'
      }
    </Button>
  ), [isLoggedIn, isRegistered, isLoading, handleRegistration, registerButtonStyles]);

  // Early return для невалидных данных
  if (!event || !event._id) {
    return null;
  }

  return (
    <Card className={styles.eventCard}>
      {/* Header */}
      <CardHeader className={styles.cardHeader}>
        <div className={styles.headerContent}>
          <div className={styles.graphAvatar}>
            <LazyGraphAvatar
              src={fullImageUrl}
              alt={event.graphId.name}
              fallback={event.graphId.name}
            />
          </div>
          <div className={styles.titleSection}>
            {isEditing ? (
              <TitleInput
                value={editedEvent.name}
                onChange={(value) => updateEditedEvent('name', value)}
              />
            ) : (
              <h3 className={styles.title}>
                {event.name}
              </h3>
            )}
            
            <Chip
              variant="flat"
              size="sm"
              className={styles.graphChip}
            >
              {event.graphId.name}
            </Chip>
          </div>
        </div>
        
        {actionButtons}
      </CardHeader>
      
      {/* Body */}
      <CardBody className={styles.cardBody}>
        {isEditing ? (
          <DescriptionTextarea
            value={editedEvent.description}
            onChange={(value) => updateEditedEvent('description', value)}
          />
        ) : (
          <p className={styles.description}>
            {event.description}
          </p>
        )}
      </CardBody>

      <Divider className={styles.divider} />
      
      {/* Footer */}
      <CardFooter className={styles.cardFooter}>
        {isEditing ? (
          <EditFormInputs 
            editedEvent={editedEvent} 
            updateEditedEvent={updateEditedEvent}
          />
        ) : (
          <div className={styles.eventInfo}>
            <EventInfo 
              formattedTime={formattedTime}
              place={event.place}
              regedUsers={event.regedUsers}
            />
            
            {registerButton}
          </div>
        )}
      </CardFooter>
      
      {/* PopUp подтверждения удаления */}
      <DeleteConfirmPopUp
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        eventName={event.name}
        isDeleting={isDeleting}
      />
    </Card>
  );
});

EventCard.displayName = 'EventCard';

export default EventCard;