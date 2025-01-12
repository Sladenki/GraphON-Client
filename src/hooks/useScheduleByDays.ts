import React from 'react';

// Определяем тип для элемента расписания
interface ScheduleItem {
  _id: string;
  dayOfWeek: number; // Индекс дня недели (0-4)
  name: string;
  timeFrom: string;
  timeTo: string;
  roomNumber: number;
}

// Определяем тип для расписания по дням недели
type ScheduleByDays = {
  [key: number]: ScheduleItem[];
};

// Хук для распределения расписания по дням недели
export const useScheduleByDays = (data: ScheduleItem[] | undefined): ScheduleByDays => {
  return React.useMemo(() => {
    if (!data) {
      // Возвращаем объект с пустыми массивами для каждого дня недели
      return { 0: [], 1: [], 2: [], 3: [], 4: [] };
    }

    // Создаём объект-расписание с пустыми массивами для каждого дня
    const scheduleTemplate: ScheduleByDays = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
    };

    // Заполняем расписание, распределяя элементы по дням недели
    data.forEach((item) => {
      if (scheduleTemplate[item.dayOfWeek]) {
        scheduleTemplate[item.dayOfWeek].push(item);
      }
    });

    return scheduleTemplate;
  }, [data]);
};
