import React from 'react';
import { Card, CardBody, Divider, Chip, Button } from '@heroui/react';
import { Clock, MapPin, Users } from 'lucide-react';
import { useEventRegistration } from '@/hooks/useEventRegistration';
import { useAuth } from '@/providers/AuthProvider';
import { ScheduleItem, EventItem } from '@/types/schedule';
import styles from './Schedule.module.scss';

// Мемоизированный компонент карточки расписания
interface ScheduleCardProps {
  scheduleItem: ScheduleItem;
}

export const ScheduleCard = React.memo<ScheduleCardProps>(({ scheduleItem }) => {
  return (
    <Card className={styles.scheduleCard}>
      <CardBody className={styles.scheduleCardBody}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon}>
            {scheduleItem.type === 'lecture' ? '📖' : '🛠'}
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>{scheduleItem.name}</h3>
            <div className={styles.cardMeta}>
              <div className={styles.metaItem}>
                <Clock size={14} />
                <span>{scheduleItem.timeFrom} - {scheduleItem.timeTo}</span>
              </div>
              <div className={styles.metaItem}>
                <MapPin size={14} />
                <span>Ауд. {scheduleItem.roomNumber}</span>
              </div>
            </div>
          </div>
          <Chip
            size="sm"
            variant="flat"
            className={styles.typeChip}
          >
            {scheduleItem.type === 'lecture' ? 'Лекция' : 'Практика'}
          </Chip>
        </div>
      </CardBody>
    </Card>
  );
});
ScheduleCard.displayName = 'ScheduleCard';

// Мемоизированный компонент карточки мероприятия
interface EventCardProps {
  event: EventItem;
  onToggleSubscription: (eventId: string, currentStatus: boolean) => void;
}

export const EventCard = React.memo<EventCardProps>(({ event, onToggleSubscription }) => {
  const { isLoggedIn } = useAuth();
  const { isRegistered, toggleRegistration, isLoading } = useEventRegistration(
    event._id,
    event.isAttended
  );

  const handleRegistration = React.useCallback(async () => {
    if (!isLoggedIn) return;
    
    try {
      await toggleRegistration();
      onToggleSubscription(event._id, event.isAttended);
    } catch (error) {
      console.error('Ошибка при изменении статуса регистрации:', error);
    }
  }, [isLoggedIn, toggleRegistration, onToggleSubscription, event._id, event.isAttended]);

  return (
    <Card className={styles.eventCard}>
      <CardBody className={styles.eventCardBody}>
        <div className={styles.cardHeader}>
          <div className={styles.cardIcon}>
            📝
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardTitleRow}>
              <h3 className={styles.cardTitle}>{event.name}</h3>
              {event.graphId && (
                <Chip
                  size="sm"
                  variant="flat"
                  className={styles.graphChip}
                >
                  {event.graphId.name}
                </Chip>
              )}
            </div>
            <p className={styles.cardDescription}>{event.description}</p>
            <div className={styles.cardMeta}>
              <div className={styles.metaItem}>
                <Clock size={14} />
                <span>{event.timeFrom} - {event.timeTo}</span>
              </div>
              <div className={styles.metaItem}>
                <MapPin size={14} />
                <span>{event.place}</span>
              </div>
            </div>
          </div>
        </div>
        
        <Divider className={styles.cardDivider} />
        
        <div className={styles.cardFooter}>
          <div className={styles.participantsInfo}>
            <Users size={16} />
            <span>{event.regedUsers} участников</span>
          </div>
          
          {isLoggedIn && (
            <Button
              size="sm"
              variant={isRegistered ? "solid" : "bordered"}
              color={isRegistered ? "success" : "primary"}
              className={styles.subscriptionButton}
              onClick={handleRegistration}
              isLoading={isLoading}
              startContent={isRegistered ? "✓" : "+"}
            >
              {isRegistered ? 'Участвую' : 'Участвовать'}
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
});
EventCard.displayName = 'EventCard';

// Мемоизированный компонент кнопки дня
interface DayButtonProps {
  dayData: {
    day: Date;
    index: number;
    isSelected: boolean;
    isToday: boolean;
    totalEvents: number;
    dayName: string;
    dayDate: string;
    dayMonth: string;
  };
  onDaySelect: (day: Date) => void;
}

export const DayButton = React.memo<DayButtonProps>(({ dayData, onDaySelect }) => {
  const handleClick = React.useCallback(() => {
    onDaySelect(dayData.day);
  }, [onDaySelect, dayData.day]);

  return (
    <button
      className={`${styles.dayButton} ${dayData.isSelected ? styles.selected : ''} ${dayData.isToday ? styles.today : ''}`}
      onClick={handleClick}
    >
      <span className={styles.dayName}>{dayData.dayName}</span>
      <span className={styles.dayDate}>{dayData.dayDate}</span>
      <span className={styles.dayMonth}>{dayData.dayMonth}</span>
      {dayData.totalEvents > 0 && (
        <span className={styles.eventsBadge}>
          {dayData.totalEvents}
        </span>
      )}
    </button>
  );
});
DayButton.displayName = 'DayButton';

// Мемоизированный компонент группы событий
interface EventsGroupProps {
  title: string;
  icon: string;
  count: number;
  children: React.ReactNode;
}

export const EventsGroup = React.memo<EventsGroupProps>(({ title, icon, count, children }) => {
  return (
    <div className={styles.eventsGroup}>
      <div className={styles.groupHeader}>
        <h3 className={styles.groupTitle}>{icon} {title}</h3>
        <Chip size="sm" variant="flat" className={styles.groupCount}>
          {count}
        </Chip>
      </div>
      <div className={styles.groupContent}>
        {children}
      </div>
    </div>
  );
});
EventsGroup.displayName = 'EventsGroup'; 