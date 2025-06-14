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
  Image
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

// Мемоизированные компоненты для оптимизации
const EditFormInputs = React.memo(({ 
  editedEvent, 
  updateEditedEvent 
}: { 
  editedEvent: any, 
  updateEditedEvent: (key: string, value: string) => void 
}) => (
  <div className={styles.editForm}>
    <Input
      type="date"
      label="Дата мероприятия"
      value={editedEvent.eventDate}
      onChange={(e) => updateEditedEvent('eventDate', e.target.value)}
      variant="bordered"
      startContent={<Calendar size={16} />}
      className={styles.dateInput}
    />
    <div className={styles.timeInputs}>
      <Input
        type="time"
        label="Время начала"
        value={editedEvent.timeFrom}
        onChange={(e) => updateEditedEvent('timeFrom', e.target.value)}
        variant="bordered"
        startContent={<Clock size={16} />}
        className={styles.timeInput}
      />
      <Input
        type="time"
        label="Время окончания"
        value={editedEvent.timeTo}
        onChange={(e) => updateEditedEvent('timeTo', e.target.value)}
        variant="bordered"
        startContent={<Clock size={16} />}
        className={styles.timeInput}
      />
    </div>
    <Input
      label="Место проведения"
      value={editedEvent.place}
      onChange={(e) => updateEditedEvent('place', e.target.value)}
      variant="bordered"
      startContent={<MapPinned size={16} />}
      placeholder="Введите место проведения"
      className={styles.placeInput}
    />
  </div>
));

EditFormInputs.displayName = 'EditFormInputs';

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
    handleRegistration,
    handleDelete,
    handleEdit,
    handleCancel,
    handleStartEdit,
    updateEditedEvent
  } = useEventCardOptimization({
    initialEvent,
    isAttended,
    onDelete,
    isLoggedIn,
    toggleRegistration: async () => {
      await toggleRegistration();
    },
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
          {fullImageUrl && (
            <div className={styles.graphAvatar}>
              <Image
                src={fullImageUrl}
                alt={event.graphId.name}
                className={styles.avatarImage}
                loading="lazy"
              />
            </div>
          )}
          <div className={styles.titleSection}>
            {isEditing ? (
              <Input
                value={editedEvent.name}
                onChange={(e) => updateEditedEvent('name', e.target.value)}
                placeholder="Название мероприятия"
                variant="bordered"
                size="lg"
                classNames={{
                  input: styles.titleInput
                }}
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
          <Textarea
            value={editedEvent.description}
            onChange={(e) => updateEditedEvent('description', e.target.value)}
            placeholder="Описание мероприятия"
            variant="bordered"
            minRows={3}
            maxRows={6}
            className={styles.descriptionInput}
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
    </Card>
  );
});

EventCard.displayName = 'EventCard';

export default EventCard;