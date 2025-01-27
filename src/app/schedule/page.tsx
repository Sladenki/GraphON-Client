'use client';

import ScheduleList from "@/components/ui/ScheduleList/ScheduleList";
import { SpinnerLoader } from "@/components/ui/SpinnerLoader/SpinnerLoader";
import { useScheduleByDays } from "@/hooks/useScheduleByDays";
import { GraphSubsService } from "@/services/graphSubs.service";
import { useQuery } from "@tanstack/react-query";

const Schedule = () => {

  // Запрос данных через useQuery
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['graphSubs/getSubsSchedule'],
    queryFn: () => GraphSubsService.getSubsSchedule(),
  });

  // Преобразуем расписание по дням
  const scheduleByDays = useScheduleByDays(data?.data);

  // console.log('scheduleByDays', scheduleByDays)

  // Выводим состояние загрузки или ошибки
  if (isLoading) return <SpinnerLoader/>;
  if (isError) return <p>Ошибка: {error.message}</p>;


  return (
    <>
      {data && (
        <ScheduleList
          scheduleByDays={scheduleByDays}
          title="Расписание страница целая"
        />
      )}
    </>
  );
}

export default Schedule;
