import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ScheduleItem, EventItem } from '@/types/schedule';
import { useDebounce } from '@/hooks/useDebounce';

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
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const daysContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Дебаунсинг для календарных вычислений на мобильных
  const debouncedSelectedDay = useDebounce(selectedDay, 100);

  // Синхронизируем localEvents с входящими props
  useEffect(() => {
    setLocalEvents(events);
    if (events.length > 0 && isFirstLoad) {
      setIsFirstLoad(false);
    }
  }, [events, isFirstLoad]);

  // Мемоизированные вычисления для дней недели с оптимизацией
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
  }, []); // Не зависит от изменяющихся данных

  // Мемоизированные данные для выбранного дня с дебаунсингом
  const selectedDayData = useMemo(() => {
    const day = debouncedSelectedDay;
    const selectedDayIndex = getDay(day) === 0 ? 6 : getDay(day) - 1;
    
    // Оптимизированная фильтрация с кэшированием
    const selectedDaySchedule = schedule.filter(item => item.dayOfWeek === selectedDayIndex);
    const selectedDayEvents = localEvents.filter(event => {
      if (!event?.eventDate) return false;
      try {
        return isSameDay(parseISO(event.eventDate), day);
      } catch {
        return false;
      }
    });
    
    return {
      selectedDayIndex,
      selectedDaySchedule,
      selectedDayEvents,
      totalEvents: selectedDaySchedule.length + selectedDayEvents.length,
      isEmpty: selectedDaySchedule.length === 0 && selectedDayEvents.length === 0
    };
  }, [debouncedSelectedDay, schedule, localEvents]);

  // Мемоизированные данные для каждого дня недели с оптимизацией
  const weekDaysData = useMemo(() => {
    // Используем Map для кэширования результатов фильтрации
    const scheduleByDay = new Map<number, number>();
    const eventsByDay = new Map<number, number>();
    
    // Предварительно подсчитываем количество для каждого дня
    schedule.forEach(item => {
      const count = scheduleByDay.get(item.dayOfWeek) || 0;
      scheduleByDay.set(item.dayOfWeek, count + 1);
    });
    
    localEvents.forEach(event => {
      if (!event?.eventDate) return;
      try {
        const eventDate = parseISO(event.eventDate);
        weekData.daysOfWeek.forEach((day, index) => {
          if (isSameDay(eventDate, day)) {
            const count = eventsByDay.get(index) || 0;
            eventsByDay.set(index, count + 1);
          }
        });
      } catch {
        // Игнорируем некорректные даты
      }
    });
    
    return weekData.daysOfWeek.map((day, index) => {
      const isSelected = isSameDay(day, selectedDay);
      const isToday = isSameDay(day, weekData.today);
      const dayScheduleCount = scheduleByDay.get(index) || 0;
      const dayEventsCount = eventsByDay.get(index) || 0;
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

  // Мемоизированный заголовок с кэшированием
  const selectedDayTitle = useMemo(() => {
    return format(selectedDay, 'EEEE, dd MMMM', { locale: ru });
  }, [selectedDay]);

  // Оптимизированный скролл к дню с дебаунсингом
  const scrollToDay = useCallback((targetDay: Date, behavior: ScrollBehavior = 'smooth') => {
    if (!daysContainerRef.current) return;

    // Очищаем предыдущий таймаут
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Дебаунсим скролл для мобильных устройств
    scrollTimeoutRef.current = setTimeout(() => {
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
    }, 50); // Небольшая задержка для дебаунсинга
  }, [weekData.daysOfWeek]);

  // Автоскролл к текущему дню при загрузке с оптимизацией
  useEffect(() => {
    if (isFirstLoad) return;
    
    const timer = setTimeout(() => {
      if (weekData.todayIndex !== -1) {
        scrollToDay(weekData.today, 'auto'); // Используем 'auto' для первичной загрузки
      }
    }, 150); // Увеличиваем задержку для мобильных
    
    return () => clearTimeout(timer);
  }, [weekData.today, weekData.todayIndex, scrollToDay, isFirstLoad]);

  // Обработчик выбора дня с оптимизацией
  const handleDaySelect = useCallback((day: Date) => {
    // Предотвращаем лишние обновления
    if (isSameDay(day, selectedDay)) return;
    
    setSelectedDay(day);
    // Используем requestAnimationFrame для плавности на мобильных
    requestAnimationFrame(() => {
      scrollToDay(day, 'smooth');
    });
  }, [selectedDay, scrollToDay]);

  // Оптимизированный обработчик переключения подписки
  const handleToggleSubscription = useCallback((eventId: string, currentStatus: boolean) => {
    // Оптимистичное обновление UI с валидацией
    setLocalEvents(prev => 
      prev.map(event => {
        if (event._id !== eventId) return event;
        
        const newRegedUsers = currentStatus 
          ? Math.max(0, event.regedUsers - 1) 
          : event.regedUsers + 1;
        
        return { 
          ...event, 
          isAttended: !currentStatus,
          regedUsers: newRegedUsers
        };
      })
    );

    // Вызов callback функции для обновления на сервере
    onToggleSubscription?.(eventId, !currentStatus);
  }, [onToggleSubscription]);

  // Обработчик кнопки "Сегодня" с оптимизацией
  const handleTodayClick = useCallback(() => {
    const today = new Date();
    handleDaySelect(today);
  }, [handleDaySelect]);

  // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    selectedDay,
    selectedDayData,
    selectedDayTitle,
    weekDaysData,
    daysContainerRef,
    handleDaySelect,
    handleToggleSubscription,
    handleTodayClick,
    isFirstLoad
  };
}; 