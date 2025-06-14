'use client';

import React, { useState, useEffect, useRef } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Card, CardBody, Divider, Chip, Button } from '@heroui/react';
import { Clock, MapPin, Users } from 'lucide-react';
import { useEventRegistration } from '@/hooks/useEventRegistration';
import { useAuth } from '@/providers/AuthProvider';
import { EmptyState } from '@/components/global/EmptyState/EmptyState';
import { ScheduleItem, EventItem } from '@/types/schedule';
import styles from './Schedule.module.scss';

interface SchedulePageProps {
  schedule: ScheduleItem[];
  events: EventItem[];
  onToggleSubscription?: (eventId: string, isAttended: boolean) => void;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ 
  schedule, 
  events, 
  onToggleSubscription 
}) => {
  const { isLoggedIn } = useAuth();
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [localEvents, setLocalEvents] = useState(events);
  const daysContainerRef = useRef<HTMLDivElement>(null);

  // Синхронизируем localEvents с входящими props
  React.useEffect(() => {
    setLocalEvents(events);
  }, [events]);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Автоскролл к текущему дню при загрузке
  useEffect(() => {
    const scrollToToday = () => {
      if (daysContainerRef.current) {
        const today = new Date();
        const todayIndex = daysOfWeek.findIndex(day => isSameDay(day, today));
        
        if (todayIndex !== -1) {
          const container = daysContainerRef.current;
          const dayButton = container.children[todayIndex] as HTMLElement;
          
          if (dayButton) {
            const containerWidth = container.offsetWidth;
            const buttonWidth = dayButton.offsetWidth;
            const buttonLeft = dayButton.offsetLeft;
            
            // Вычисляем позицию для центрирования кнопки
            const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
            
            container.scrollTo({
              left: Math.max(0, scrollPosition),
              behavior: 'smooth'
            });
          }
        }
      }
    };

    // Небольшая задержка для корректного расчета размеров
    const timer = setTimeout(scrollToToday, 100);
    return () => clearTimeout(timer);
  }, [daysOfWeek]);

  const handleToggleSubscription = (eventId: string, currentStatus: boolean) => {
    // Оптимистичное обновление UI
    setLocalEvents(prev => 
      prev.map(event => 
        event._id === eventId 
          ? { 
              ...event, 
              isAttended: !currentStatus,
              regedUsers: currentStatus ? event.regedUsers - 1 : event.regedUsers + 1
            }
          : event
      )
    );

    // Вызов callback функции для обновления на сервере
    if (onToggleSubscription) {
      onToggleSubscription(eventId, !currentStatus);
    }
  };

  // Функция для скролла к выбранному дню (показывает предыдущие дни)
  const scrollToSelectedDay = (day: Date) => {
    if (daysContainerRef.current) {
      const dayIndex = daysOfWeek.findIndex(d => isSameDay(d, day));
      
      if (dayIndex !== -1) {
        const container = daysContainerRef.current;
        
        // Определяем целевой индекс для скролла (показываем 1-2 дня до выбранного)
        let targetIndex;
        if (dayIndex === 0) {
          targetIndex = 0; // Понедельник - остаемся на месте
        } else if (dayIndex === 1) {
          targetIndex = 0; // Вторник - показываем с понедельника
        } else {
          targetIndex = dayIndex - 2; // Остальные дни - показываем 2 дня до
        }
        
        const targetButton = container.children[targetIndex] as HTMLElement;
        
        if (targetButton) {
          const targetLeft = targetButton.offsetLeft;
          
          console.log(`Скролл к дню ${dayIndex}, целевой индекс: ${targetIndex}, позиция: ${targetLeft}`);
          
          container.scrollTo({
            left: targetLeft,
            behavior: 'smooth'
          });
        }
      }
    }
  };

  // Обработчик выбора дня с мягким автоскроллом
  const handleDaySelect = (day: Date) => {
    setSelectedDay(day);
    scrollToSelectedDay(day);
  };

  // Фильтруем события и расписание для выбранного дня
  const selectedDayIndex = getDay(selectedDay) === 0 ? 6 : getDay(selectedDay) - 1; // Конвертируем в понедельник = 0
  const selectedDaySchedule = schedule.filter(item => item.dayOfWeek === selectedDayIndex);
  const selectedDayEvents = localEvents.filter(event => 
    isSameDay(parseISO(event.eventDate), selectedDay)
  );

  return (
    <div className={styles.schedulePage}>
      {/* Селектор дней недели */}
      <div className={styles.weekSelector}>
        <div className={styles.selectorHeader}>
          <h2 className={styles.weekTitle}>
            {format(selectedDay, 'EEEE, dd MMMM', { locale: ru })}
          </h2>
          <div className={styles.quickActions}>
            <Button
              size="sm"
              variant="flat"
              className={styles.todayButton}
              onClick={() => handleDaySelect(new Date())}
              startContent="📅"
            >
              Сегодня
            </Button>
            <Chip
              size="sm"
              variant="flat"
              className={styles.eventsCount}
            >
              {selectedDaySchedule.length + selectedDayEvents.length} событий
            </Chip>
          </div>
        </div>
        
        <div className={styles.daysContainer} ref={daysContainerRef}>
          {daysOfWeek.map((day, index) => {
            const isSelected = isSameDay(day, selectedDay);
            const isToday = isSameDay(day, new Date());
            const dayScheduleCount = schedule.filter(item => item.dayOfWeek === index).length;
            const dayEventsCount = localEvents.filter(event => 
              isSameDay(parseISO(event.eventDate), day)
            ).length;
            const totalEvents = dayScheduleCount + dayEventsCount;
            
            return (
              <button
                key={index}
                className={`${styles.dayButton} ${isSelected ? styles.selected : ''} ${isToday ? styles.today : ''}`}
                onClick={() => handleDaySelect(day)}
              >
                <span className={styles.dayName}>
                  {format(day, 'EE', { locale: ru })}
                </span>
                <span className={styles.dayDate}>
                  {format(day, 'dd', { locale: ru })}
                </span>
                <span className={styles.dayMonth}>
                  {format(day, 'MMM', { locale: ru })}
                </span>
                {totalEvents > 0 && (
                  <span className={styles.eventsBadge}>
                    {totalEvents}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Секция расписания на день */}
      <div className={styles.scheduleSection}>
        {selectedDaySchedule.length === 0 && selectedDayEvents.length === 0 ? (
          <EmptyState
            message="Нет событий на этот день"
            subMessage="Выберите другой день или создайте новое мероприятие"
            emoji="📅"
          />
        ) : (
          <div className={styles.eventsList}>
            {/* Расписание занятий */}
            {selectedDaySchedule.length > 0 && (
              <div className={styles.eventsGroup}>
                <div className={styles.groupHeader}>
                  <h3 className={styles.groupTitle}>📚 Занятия</h3>
                  <Chip size="sm" variant="flat" className={styles.groupCount}>
                    {selectedDaySchedule.length}
                  </Chip>
                </div>
                <div className={styles.groupContent}>
                  {selectedDaySchedule.map((item) => (
                    <ScheduleCard key={item._id} scheduleItem={item} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Мероприятия */}
            {selectedDayEvents.length > 0 && (
              <div className={styles.eventsGroup}>
                <div className={styles.groupHeader}>
                  <h3 className={styles.groupTitle}>🎯 Мероприятия</h3>
                  <Chip size="sm" variant="flat" className={styles.groupCount}>
                    {selectedDayEvents.length}
                  </Chip>
                </div>
                <div className={styles.groupContent}>
                  {selectedDayEvents.map((event) => (
                    <EventCard
                      key={event._id}
                      event={event}
                      onToggleSubscription={handleToggleSubscription}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Компонент карточки расписания
interface ScheduleCardProps {
  scheduleItem: ScheduleItem;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ scheduleItem }) => {
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
};

// Компонент карточки мероприятия
interface EventCardProps {
  event: EventItem;
  onToggleSubscription: (eventId: string, currentStatus: boolean) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onToggleSubscription }) => {
  const { isLoggedIn } = useAuth();
  const { isRegistered, toggleRegistration, isLoading } = useEventRegistration(
    event._id,
    event.isAttended
  );

  const handleRegistration = async () => {
    if (!isLoggedIn) return;
    
    try {
      await toggleRegistration();
      onToggleSubscription(event._id, event.isAttended);
    } catch (error) {
      console.error('Ошибка при изменении статуса регистрации:', error);
    }
  };

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
              <div className={styles.metaItem}>
                <Users size={14} />
                <span>{event.regedUsers} участников</span>
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
};

export default SchedulePage; 