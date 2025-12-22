'use client';

import { SpinnerLoader } from "@/components/global/SpinnerLoader/SpinnerLoader";
import { GraphSubsService } from "@/services/graphSubs.service";
import { useQuery } from "@tanstack/react-query";
import { CalendarX, LogIn } from 'lucide-react';

import styles from './Schedule.module.scss'
import { useRouter } from "next/navigation";
import { notifyError } from "@/lib/notifications";
import { AxiosError } from "axios";
import { EmptyState } from "@/components/global/EmptyState/EmptyState";
import Calendar from "../../../components/shared/Calendar/Calendar";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect } from "react";


const Schedule = () => {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();

  // Проверяем авторизацию перед запросом
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      notifyError('Необходима авторизация', 'Пожалуйста, войдите в систему для просмотра расписания');
      router.push('/signIn');
    }
  }, [isLoggedIn, authLoading, router]);

  // Получаем расписание и мероприятия по подписанным графам 
  // Запрос выполняется только если пользователь авторизован
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['subsSchedule'],
    queryFn: () => GraphSubsService.getSubsSchedule(),
    enabled: isLoggedIn && !authLoading, // Запрос только для авторизованных пользователей
  });

  // Показываем загрузку при проверке авторизации
  if (authLoading) return <SpinnerLoader/>;

  // Если пользователь не авторизован, показываем сообщение
  if (!isLoggedIn) {
    return (
      <div className={styles.ScheduleWrapper}>
        <EmptyState
          message="Необходима авторизация"
          subMessage="Пожалуйста, войдите в систему для просмотра расписания"
          icon={LogIn}
        />
      </div>
    );
  }

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
      <Calendar schedule={scheduleByDays.schedule} events={scheduleByDays.events} />
      {/* {scheduleByDays.schedule == 0 && scheduleByDays.events == 0 ? (
        <EmptyState
          message="Тут пока пусто"
          subMessage="На этой неделе нет занятий или мероприятий"
          icon={CalendarX}
        />
      ) : (
        <Calendar schedule={scheduleByDays.schedule} events={scheduleByDays.events} />
      )} */}
    </div>
  );
}

export default Schedule;
