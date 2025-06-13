'use client';

import { SpinnerLoader } from "@/components/global/SpinnerLoader/SpinnerLoader";
import { GraphSubsService } from "@/services/graphSubs.service";
import { useQuery } from "@tanstack/react-query";

import styles from './Schedule.module.scss'
import { ScheduleList } from "@/components/ui/ScheduleList/ScheduleList";
import { useRouter } from "next/navigation";
import { notifyError } from "@/lib/notifications";
import { AxiosError } from "axios";
import { EmptyState } from "@/components/global/EmptyState/EmptyState";

const Schedule = () => {
  const router = useRouter();

  // Получаем расписание и мероприятия по подписанным графам 
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['graphSubs/getSubsSchedule'],
    queryFn: () => GraphSubsService.getSubsSchedule(),
  });

  // Обработка ошибки 401
  if (isError) {
   if (error instanceof AxiosError && error.response?.status === 401) {
      notifyError('Ошибка авторизации');
      router.push('/signIn');
      return null; // Предотвращаем дальнейший рендеринг
    }
    return <p>Ошибка: {error.message}</p>;
  }

  // Преобразуем расписание по дням
  const scheduleByDays = data?.data;

  // Выводим состояние загрузки или ошибки
  if (isLoading) return <SpinnerLoader/>;

  return (
    <div className={styles.ScheduleWrapper}>
      {scheduleByDays.schedule == 0 && scheduleByDays.events == 0 ? (
        <EmptyState
          message="Тут пока пусто"
          subMessage="На этой неделе нет занятий или мероприятий"
        />
      ) : (
        <ScheduleList schedule={scheduleByDays.schedule} events={scheduleByDays.events} />
      )}
    </div>
  );
}

export default Schedule;
