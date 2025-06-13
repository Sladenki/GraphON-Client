'use client'

import React, { useEffect, useState, useMemo } from "react";
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
  MapPin, 
  Users, 
  Clock, 
  Calendar,
  Edit3, 
  Trash2, 
  Save, 
  X,
  UserPlus,
  UserX,
  LogIn,
  CalendarClock,
  MapPinned,
  UsersRound
} from "lucide-react";
import { useEventRegistration } from "@/hooks/useEventRegistration";
import { useAuth } from "@/providers/AuthProvider";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { EventService } from "@/services/event.service";
import { UserRole } from "@/types/user.interface";
import { notifyError, notifyInfo, notifySuccess } from "@/lib/notifications";
import { useRouter } from "next/navigation";
import styles from './EventCard.module.scss';

const BASE_S3_URL = process.env.NEXT_PUBLIC_S3_URL;

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
  console.log('EventCard render with props:', { initialEvent, isAttended });
  
  const { isLoggedIn, user } = useAuth();
  const { canAccessEditor } = useRoleAccess(user?.role as UserRole);
  const [isEditing, setIsEditing] = useState(false);
  const [event, setEvent] = useState(initialEvent);
  const [editedEvent, setEditedEvent] = useState({
    name: initialEvent.name,
    description: initialEvent.description,
    eventDate: initialEvent.eventDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    timeFrom: initialEvent.timeFrom,
    timeTo: initialEvent.timeTo,
    place: initialEvent.place
  });

  const { isRegistered, toggleRegistration, isLoading, error } = useEventRegistration(
    event?._id || '', 
    isAttended
  );

  const router = useRouter();

  const handleRegistration = async () => {
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
    } catch (error) {
      console.error('Ошибка при изменении статуса регистрации:', error);
      notifyError("Произошла ошибка", "Не удалось изменить статус регистрации");
    }
  };

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

  const handleCancel = () => {
    setIsEditing(false);
    setEditedEvent({
      name: event.name,
      description: event.description,
      eventDate: event.eventDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      timeFrom: event.timeFrom,
      timeTo: event.timeTo,
      place: event.place
    });
  };

  console.log('event', event)

  const fullImageUrl = useMemo(() => 
    event ? `${BASE_S3_URL}/${event.graphId.imgPath}` : "", 
    [event]
  );

  console.log('fullImageUrl', fullImageUrl)

  if (!event || !event._id) {
    console.error('Invalid event data:', event);
    return null;
  }

  return (
    <Card 
      className={styles.eventCard}
      style={{ 
        '--heroui-primary': 'rgb(150, 130, 238)',
        '--heroui-primary-50': 'rgba(150, 130, 238, 0.1)',
        '--heroui-primary-100': 'rgba(150, 130, 238, 0.2)'
      } as React.CSSProperties}
    >
      {/* Header */}
      <CardHeader className={styles.cardHeader}>
        <div className={styles.headerContent}>
          {event?.graphId?.imgPath && (
            <div className={styles.graphAvatar}>
              <Image
                src={fullImageUrl || ""}
                alt={event.graphId.name}
                className={styles.avatarImage}
              />
            </div>
          )}
          <div className={styles.titleSection}>
            {isEditing ? (
              <Input
                value={editedEvent.name}
                onChange={(e) => setEditedEvent(prev => ({ ...prev, name: e.target.value }))}
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
        
        {canAccessEditor && (
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
                    onPress={() => setIsEditing(true)}
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
        )}
      </CardHeader>
      
      {/* Body */}
      <CardBody className={styles.cardBody}>
        {isEditing ? (
          <Textarea
            value={editedEvent.description}
            onChange={(e) => setEditedEvent(prev => ({ ...prev, description: e.target.value }))}
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
          <div className={styles.editForm}>
            <Input
              type="date"
              label="Дата мероприятия"
              value={editedEvent.eventDate}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, eventDate: e.target.value }))}
              variant="bordered"
              startContent={<Calendar size={16} />}
              className={styles.dateInput}
            />
            <div className={styles.timeInputs}>
              <Input
                type="time"
                label="Время начала"
                value={editedEvent.timeFrom}
                onChange={(e) => setEditedEvent(prev => ({ ...prev, timeFrom: e.target.value }))}
                variant="bordered"
                startContent={<Clock size={16} />}
                className={styles.timeInput}
              />
              <Input
                type="time"
                label="Время окончания"
                value={editedEvent.timeTo}
                onChange={(e) => setEditedEvent(prev => ({ ...prev, timeTo: e.target.value }))}
                variant="bordered"
                startContent={<Clock size={16} />}
                className={styles.timeInput}
              />
            </div>
            <Input
              label="Место проведения"
              value={editedEvent.place}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, place: e.target.value }))}
              variant="bordered"
              startContent={<MapPinned size={16} />}
              placeholder="Введите место проведения"
              className={styles.placeInput}
            />
          </div>
        ) : (
          <div className={styles.eventInfo}>
            <div className={styles.infoSection}>
              <div className={styles.infoItem}>
                <CalendarClock size={18} />
                <span className={styles.infoText}>
                  {formatEventTime(event.eventDate, event.timeFrom, event.eventDate, event.timeTo)}
                </span>
              </div>
              
              <div className={styles.infoItem}>
                <MapPinned size={18} />
                <span className={styles.infoText}>{event.place}</span>
              </div>
              
              <div className={styles.infoItem}>
                <UsersRound size={18} />
                <span className={styles.infoText}>{event.regedUsers} участников</span>
              </div>
            </div>
            
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
              style={{
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
              }}
            >
              {isLoggedIn 
                ? isRegistered 
                  ? 'Отменить регистрацию' 
                  : 'Зарегистрироваться' 
                : 'Войдите, чтобы зарегистрироваться'
              }
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default EventCard;