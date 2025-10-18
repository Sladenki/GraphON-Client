import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GraphSubsService } from '@/services/graphSubs.service';
import { useAuth } from '@/providers/AuthProvider';

export const useSubscription = (initialIsSubscribed: boolean, graphId: string) => {
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  // Синхронизируем состояние подписки когда данные графа загружаются
  useEffect(() => {
    setIsSubscribed(initialIsSubscribed);
  }, [initialIsSubscribed]);

  const mutation = useMutation({
    mutationFn: () => GraphSubsService.toggleGraphSub(graphId),
    onMutate: async () => {
        await queryClient.cancelQueries({
            queryKey: ['subscriptions', graphId],
        });

      const previousState = queryClient.getQueryData(['subscriptions', graphId]);

      queryClient.setQueryData(['subscriptions', graphId], (oldState: boolean) => !oldState);

      setIsSubscribed((prev) => !prev);

      return { previousState };
    },
    onError: (_, __, context) => {
      if (context?.previousState !== undefined) {
        queryClient.setQueryData(['subscriptions', graphId], context.previousState);
      }
      setIsSubscribed((prev) => !prev);
    },
    onSuccess: () => {
        // Инвалидируем кеш подписки для конкретного графа
        queryClient.invalidateQueries({
            queryKey: ['subscriptions', graphId],
        });
        
        // Инвалидируем кеш событий подписок для обновления раздела "Подписки"
        queryClient.invalidateQueries({
            queryKey: ['subsEvents'],
        });
        
        // Инвалидируем кеш пользователя для обновления счетчика подписок
        queryClient.invalidateQueries({
            queryKey: ['user'],
        });
        
        // Инвалидируем кеш всех графов для обновления состояния подписки
        queryClient.invalidateQueries({
            queryKey: ['graph'],
        });
        
        // Инвалидируем кеш конкретного графа
        queryClient.invalidateQueries({
            queryKey: ['graph', graphId],
        });
        
        // Инвалидируем кеш событий пользователя
        queryClient.invalidateQueries({
            queryKey: ['eventsList'],
        });
        
        // Обновляем данные пользователя для обновления счетчика подписок
        refreshUser();
    },
  });

  const toggleSubscription = useCallback(() => {
    if (!mutation.isPending) {
      mutation.mutate();
    }
  }, [mutation]);

  return {
    isSubscribed,
    toggleSubscription,
    isLoading: mutation.isPending,
  };
};