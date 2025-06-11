import React, { useEffect, useState } from "react";
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
  Spinner
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
  LogIn
} from "lucide-react";
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
      timeTo: event.timeTo
    });
  };

  if (!event || !event._id) return null;

  return (
    <Card 
      className="w-full max-w-2xl mx-auto shadow-md hover:shadow-lg transition-all duration-300"
      style={{ 
        '--heroui-primary': 'rgb(150, 130, 238)',
        '--heroui-primary-50': 'rgba(150, 130, 238, 0.1)',
        '--heroui-primary-100': 'rgba(150, 130, 238, 0.2)'
      } as React.CSSProperties}
    >
      {/* Header */}
      <CardHeader className="flex justify-between items-start gap-4 pb-2">
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editedEvent.name}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Название мероприятия"
              variant="bordered"
              size="lg"
              classNames={{
                input: "text-lg font-semibold"
              }}
            />
          ) : (
            <h3 className="text-xl font-bold text-foreground line-clamp-2 leading-tight">
              {event.name}
            </h3>
          )}
          
          <Chip
            variant="flat"
            size="sm"
            className="w-fit"
            style={{ backgroundColor: 'rgba(150, 130, 238, 0.1)', color: 'rgb(150, 130, 238)' }}
          >
            {event.graphId.name}
          </Chip>
        </div>
        
        {canAccessEditor && (
          <ButtonGroup variant="flat" size="sm">
            {isEditing ? (
              <>
                <Tooltip content="Сохранить изменения">
                  <Button
                    isIconOnly
                    color="success"
                    variant="flat"
                    onPress={handleEdit}
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
      <CardBody className="pt-0 pb-4">
        {isEditing ? (
          <Textarea
            value={editedEvent.description}
            onChange={(e) => setEditedEvent(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Описание мероприятия"
            variant="bordered"
            minRows={3}
            maxRows={6}
          />
        ) : (
          <p className="text-default-600 leading-relaxed">
            {event.description}
          </p>
        )}
      </CardBody>

      <Divider />
      
      {/* Footer */}
      <CardFooter className="flex flex-col gap-4 pt-4">
        {isEditing ? (
          <div className="flex flex-col gap-3 w-full">
            <Input
              type="date"
              label="Дата мероприятия"
              value={editedEvent.eventDate}
              onChange={(e) => setEditedEvent(prev => ({ ...prev, eventDate: e.target.value }))}
              variant="bordered"
              startContent={<Calendar size={16} />}
            />
            <div className="flex gap-2">
              <Input
                type="time"
                label="Время начала"
                value={editedEvent.timeFrom}
                onChange={(e) => setEditedEvent(prev => ({ ...prev, timeFrom: e.target.value }))}
                variant="bordered"
                startContent={<Clock size={16} />}
              />
              <Input
                type="time"
                label="Время окончания"
                value={editedEvent.timeTo}
                onChange={(e) => setEditedEvent(prev => ({ ...prev, timeTo: e.target.value }))}
                variant="bordered"
                startContent={<Clock size={16} />}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 w-full items-start sm:items-center justify-between">
            <div className="flex flex-col gap-2 text-small">
              <div className="flex items-center gap-2 text-default-600">
                <Clock size={16} />
                <span className="whitespace-pre-line">
                  {formatEventTime(event.eventDate, event.timeFrom, event.eventDate, event.timeTo)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-default-600">
                <MapPin size={16} />
                <span>{event.place}</span>
              </div>
              
              <div className="flex items-center gap-2 text-default-600">
                <Users size={16} />
                <span>{event.regedUsers} участников</span>
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
              className="min-w-fit whitespace-nowrap"
              style={
                !isLoggedIn 
                  ? {} 
                  : isRegistered 
                    ? { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)' }
                    : { backgroundColor: 'rgb(150, 130, 238)', color: 'white' }
              }
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