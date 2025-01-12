'use client';

import ScheduleItem from "@/components/ui/ScheduleItem/ScheduleItem";
import { useScheduleByDays } from "@/hooks/useScheduleByDays";
import { GraphSubsService } from "@/services/graphSubs.service";
import { useQuery } from "@tanstack/react-query";

const Schedule = () => {
  const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];

  // Запрос данных через useQuery
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['graphSubs/getSubsSchedule'],
    queryFn: () => GraphSubsService.getSubsSchedule(),
  });

  // Преобразуем расписание по дням
  const scheduleByDays = useScheduleByDays(data?.data);

  // Выводим состояние загрузки или ошибки
  if (isLoading) return <p>Загрузка...</p>;
  if (isError) return <p>Ошибка: {error.message}</p>;


  return (
    <>
      <h1>Граф - {data && data.data[0].graphId.name}</h1>
      {data && (

        <div>
          <h2>Расписание</h2>
          <div>
            {daysOfWeek.map((day, index) => (
              <div key={index} style={{ marginBottom: '20px' }}>
                <h3>{day}</h3>
                {scheduleByDays[index]?.length > 0 ? (
                  <ul>
                    {scheduleByDays[index].map((item) => (
                      <ScheduleItem
                        key={item._id}
                        name={item.name}
                        timeFrom={item.timeFrom}
                        timeTo={item.timeTo}
                        roomNumber={item.roomNumber}
                      />
                    ))}
                  </ul>
                ) : (
                  <p>Нет мероприятий</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default Schedule;
