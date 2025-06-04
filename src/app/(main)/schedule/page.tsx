'use client';


import { SpinnerLoader } from "@/components/global/SpinnerLoader/SpinnerLoader";
import { GraphSubsService } from "@/services/graphSubs.service";
import { useQuery } from "@tanstack/react-query";

import styles from './Schedule.module.scss'
import { WarningText } from "@/components/ui/WarningText/WarningText";
import { ScheduleList } from "@/components/ui/ScheduleList/ScheduleList";

const Schedule = () => {

  // Получаем расписание и мероприятия по подписанным графам 
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['graphSubs/getSubsSchedule'],
    queryFn: () => GraphSubsService.getSubsSchedule(),
  });

  // Преобразуем расписание по дням
  const scheduleByDays = data?.data;

  // Выводим состояние загрузки или ошибки
  if (isLoading) return <SpinnerLoader/>;
  if (isError) return <p>Ошибка: {error.message}</p>;

  return (
    <div className={styles.ScheduleWrapper}>
      {scheduleByDays.schedule == 0 && scheduleByDays.events == 0 ? (
        <div className={styles.warningText}>
          <WarningText text="Ваше личное расписание строиться на основе подписанных графов." />
          <WarningText text="Чтобы появилось расписание, сначала нужно подписаться на графы" />
        </div>
      ) : (
        <ScheduleList schedule={scheduleByDays.schedule} events={scheduleByDays.events} />
      )}
    </div>
  );
}

export default Schedule;
