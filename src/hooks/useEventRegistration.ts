import { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EventRegService } from '@/services/eventReg.service';

export const useEventRegistration = (eventId: string, initialState?: boolean) => {
  const [isRegistered, setIsRegistered] = useState(initialState ?? false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => EventRegService.toggleEvent(eventId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['eventRegistration', eventId] });

      const previousState = queryClient.getQueryData(['eventRegistration', eventId]);
      queryClient.setQueryData(['eventRegistration', eventId], (old: boolean) => !old);

      setIsRegistered((prev) => !prev);

      return { previousState };
    },
    onError: (_, __, context) => {
      if (context?.previousState !== undefined) {
        queryClient.setQueryData(['eventRegistration', eventId], context.previousState);
      }
      setIsRegistered((prev) => !prev);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventRegistration', eventId] });
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
  };
};
