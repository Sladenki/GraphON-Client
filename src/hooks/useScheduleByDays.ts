import React from 'react';

export const useScheduleByDays = (data) => {
  return React.useMemo(() => {
    if (!data) return {};

    // Создаём пустую структуру для дней недели
    const scheduleTemplate = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
    };

    // Распределяем расписание по дням недели
    data.forEach((item) => {
      if (scheduleTemplate[item.dayOfWeek]) {
        scheduleTemplate[item.dayOfWeek].push(item);
      }
    });

    return scheduleTemplate;
  }, [data]);
};
