import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GraphSubsService } from '@/services/graphSubs.service';

export const useSubscription = (initialIsSubscribed: boolean, graphId: string) => {
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const queryClient = useQueryClient();

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
        queryClient.invalidateQueries({
            queryKey: ['subscriptions', graphId],
        });
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
