'use client';

import ScheduleList from "@/components/ui/ScheduleList/ScheduleList";
import { SpinnerLoader } from "@/components/ui/SpinnerLoader/SpinnerLoader";
import { useScheduleByDays } from "@/hooks/useScheduleByDays";
import { GraphSubsService } from "@/services/graphSubs.service";
import { useQuery } from "@tanstack/react-query";

import styles from './Schedule.module.scss'

const Schedule = () => {

  // Запрос данных через useQuery
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['graphSubs/getSubsSchedule'],
    queryFn: () => GraphSubsService.getSubsSchedule(),
  });

  // Преобразуем расписание по дням
  const scheduleByDays = useScheduleByDays(data?.data);

  console.log('data?.data', data?.data)

  // Выводим состояние загрузки или ошибки
  if (isLoading) return <SpinnerLoader/>;
  if (isError) return <p>Ошибка: {error.message}</p>;

  return (
    <div className={styles.ScheduleWrapper}>
      {data ? (
        <ScheduleList
          scheduleByDays={scheduleByDays}
          title="Расписание на неделю"
        />
      ) : (
        <span>Чтобы появилось расписание сначала нужно подписаться на графы</span>
      )}
    </div>
  );
}

export default Schedule;
