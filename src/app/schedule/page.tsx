'use client';

import ScheduleList from "@/components/ui/ScheduleList/ScheduleList";
import { SpinnerLoader } from "@/components/SpinnerLoader/SpinnerLoader";
import { GraphSubsService } from "@/services/graphSubs.service";
import { useQuery } from "@tanstack/react-query";

import styles from './Schedule.module.scss'
import { WarningText } from "@/components/WarningText/WarningText";

const Schedule = () => {

  // Запрос данных через useQuery
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['graphSubs/getSubsSchedule'],
    queryFn: () => GraphSubsService.getSubsSchedule(),
  });

  // Преобразуем расписание по дням
  const scheduleByDays = data?.data;

  console.log('scheduleByDays', scheduleByDays)

  // Выводим состояние загрузки или ошибки
  if (isLoading) return <SpinnerLoader/>;
  if (isError) return <p>Ошибка: {error.message}</p>;

  return (
    <div className={styles.ScheduleWrapper}>
      {scheduleByDays== 0 || scheduleByDays.events == 0 ? (
        <div className={styles.warningText}>
          <WarningText text="Ваше личное расписание строиться на основе подписанных графов." />
          <WarningText text="Чтобы появилось расписание, сначала нужно подписаться на графы" />
        </div>
      ) : (
        <ScheduleList schedule={scheduleByDays} events={[]} />
      )}
    </div>
  );
}

export default Schedule;
