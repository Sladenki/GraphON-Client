import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ScheduleItem, EventItem } from '@/types/schedule';

interface UseScheduleOptimizationProps {
  schedule: ScheduleItem[];
  events: EventItem[];
  onToggleSubscription?: (eventId: string, isAttended: boolean) => void;
}

export const useScheduleOptimization = ({
  schedule,
  events,
  onToggleSubscription
}: UseScheduleOptimizationProps) => {
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [localEvents, setLocalEvents] = useState(events);
  const daysContainerRef = useRef<HTMLDivElement>(null);

  // Синхронизируем localEvents с входящими props
  useEffect(() => {
    setLocalEvents(events);
  }, [events]);

  // Мемоизированные вычисления для дней недели
  const weekData = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const today = new Date();
    
    return {
      weekStart,
      daysOfWeek,
      today,
      todayIndex: daysOfWeek.findIndex(day => isSameDay(day, today))
    };
  }, []);

  // Мемоизированные данные для выбранного дня
  const selectedDayData = useMemo(() => {
    const selectedDayIndex = getDay(selectedDay) === 0 ? 6 : getDay(selectedDay) - 1;
    const selectedDaySchedule = schedule.filter(item => item.dayOfWeek === selectedDayIndex);
    const selectedDayEvents = localEvents.filter(event => 
      isSameDay(parseISO(event.eventDate), selectedDay)
    );
    
    return {
      selectedDayIndex,
      selectedDaySchedule,
      selectedDayEvents,
      totalEvents: selectedDaySchedule.length + selectedDayEvents.length,
      isEmpty: selectedDaySchedule.length === 0 && selectedDayEvents.length === 0
    };
  }, [selectedDay, schedule, localEvents]);

  // Мемоизированные данные для каждого дня недели
  const weekDaysData = useMemo(() => {
    return weekData.daysOfWeek.map((day, index) => {
      const isSelected = isSameDay(day, selectedDay);
      const isToday = isSameDay(day, weekData.today);
      const dayScheduleCount = schedule.filter(item => item.dayOfWeek === index).length;
      const dayEventsCount = localEvents.filter(event => 
        isSameDay(parseISO(event.eventDate), day)
      ).length;
      const totalEvents = dayScheduleCount + dayEventsCount;
      
      return {
        day,
        index,
        isSelected,
        isToday,
        totalEvents,
        dayName: format(day, 'EE', { locale: ru }),
        dayDate: format(day, 'dd', { locale: ru }),
        dayMonth: format(day, 'MMM', { locale: ru })
      };
    });
  }, [weekData, selectedDay, schedule, localEvents]);

  // Мемоизированный заголовок
  const selectedDayTitle = useMemo(() => {
    return format(selectedDay, 'EEEE, dd MMMM', { locale: ru });
  }, [selectedDay]);

  // Оптимизированный скролл к дню
  const scrollToDay = useCallback((targetDay: Date, behavior: ScrollBehavior = 'smooth') => {
    if (!daysContainerRef.current) return;

    const dayIndex = weekData.daysOfWeek.findIndex(d => isSameDay(d, targetDay));
    if (dayIndex === -1) return;

    const container = daysContainerRef.current;
    const dayButton = container.children[dayIndex] as HTMLElement;
    
    if (!dayButton) return;

    const containerWidth = container.offsetWidth;
    const buttonWidth = dayButton.offsetWidth;
    const buttonLeft = dayButton.offsetLeft;
    
    // Вычисляем позицию для центрирования кнопки
    const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
    
    container.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior
    });
  }, [weekData.daysOfWeek]);

  // Автоскролл к текущему дню при загрузке
  useEffect(() => {
    const timer = setTimeout(() => {
      if (weekData.todayIndex !== -1) {
        scrollToDay(weekData.today, 'smooth');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [weekData.today, weekData.todayIndex, scrollToDay]);

  // Обработчик выбора дня
  const handleDaySelect = useCallback((day: Date) => {
    setSelectedDay(day);
    scrollToDay(day);
  }, [scrollToDay]);

  // Обработчик переключения подписки
  const handleToggleSubscription = useCallback((eventId: string, currentStatus: boolean) => {
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
    onToggleSubscription?.(eventId, !currentStatus);
  }, [onToggleSubscription]);

  // Обработчик кнопки "Сегодня"
  const handleTodayClick = useCallback(() => {
    handleDaySelect(new Date());
  }, [handleDaySelect]);

  return {
    selectedDay,
    selectedDayData,
    selectedDayTitle,
    weekDaysData,
    daysContainerRef,
    handleDaySelect,
    handleToggleSubscription,
    handleTodayClick
  };
}; 