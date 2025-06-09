import { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EventRegService } from '@/services/eventReg.service';

export const useEventRegistration = (eventId: string, initialState?: boolean) => {
  const [isRegistered, setIsRegistered] = useState(initialState ?? false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => EventRegService.toggleEvent(eventId),
    onMutate: async () => {
      // Отменяем все исходящие запросы для этого события
      await queryClient.cancelQueries({ queryKey: ['eventRegistration', eventId] });
      await queryClient.cancelQueries({ queryKey: ['event', eventId] });

      // Сохраняем предыдущие состояния
      const previousRegistrationState = queryClient.getQueryData(['eventRegistration', eventId]);
      const previousEventData = queryClient.getQueryData(['event', eventId]);

      // Оптимистично обновляем состояние регистрации
      const newRegistrationState = !isRegistered;
      queryClient.setQueryData(['eventRegistration', eventId], newRegistrationState);
      setIsRegistered(newRegistrationState);

      // Оптимистично обновляем количество зарегистрированных пользователей
      queryClient.setQueryData(['event', eventId], (oldEvent: any) => {
        if (!oldEvent) return oldEvent;
        
        const currentCount = oldEvent.regedUsers || 0;
        const newCount = newRegistrationState 
          ? currentCount + 1
          : Math.max(0, currentCount - 1); // Не даем счетчику уйти в минус

        return {
          ...oldEvent,
          regedUsers: newCount
        };
      });

      // Также обновляем в списке событий, если он закеширован
      queryClient.setQueryData(['events'], (oldEvents: any[]) => {
        if (!oldEvents) return oldEvents;
        
        return oldEvents.map(event => {
          if (event._id === eventId) {
            const currentCount = event.regedUsers || 0;
            const newCount = newRegistrationState 
              ? currentCount + 1
              : Math.max(0, currentCount - 1);
            
            return {
              ...event,
              regedUsers: newCount
            };
          }
          return event;
        });
      });

      return { 
        previousRegistrationState, 
        previousEventData,
        wasRegistered: isRegistered 
      };
    },
    onError: (error, variables, context) => {
      // Откатываем все изменения в случае ошибки
      if (context?.previousRegistrationState !== undefined) {
        queryClient.setQueryData(['eventRegistration', eventId], context.previousRegistrationState);
      }
      
      if (context?.previousEventData !== undefined) {
        queryClient.setQueryData(['event', eventId], context.previousEventData);
      }

      // Восстанавливаем локальное состояние
      setIsRegistered(context?.wasRegistered ?? false);

      // Откатываем изменения в списке событий
      queryClient.setQueryData(['events'], (oldEvents: any[]) => {
        if (!oldEvents) return oldEvents;
        
        return oldEvents.map(event => {
          if (event._id === eventId) {
            const currentCount = event.regedUsers || 0;
            const rollbackCount = context?.wasRegistered 
              ? currentCount + 1
              : Math.max(0, currentCount - 1);
            
            return {
              ...event,
              regedUsers: rollbackCount
            };
          }
          return event;
        });
      });
    },
    onSuccess: () => {
      // Перезагружаем данные для синхронизации с сервером
      queryClient.invalidateQueries({ queryKey: ['eventRegistration', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const toggleRegistration = useCallback(() => {
    if (!mutation.isPending) {
      mutation.mutate();
    }
  }, [mutation]);

  return {
    isRegistered,
    toggleRegistration,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};