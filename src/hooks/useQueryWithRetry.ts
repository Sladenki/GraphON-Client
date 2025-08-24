import { useCallback } from 'react';
import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';

interface UseQueryWithRetryProps<TData> {
  queryKey: unknown[];
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  gcTime?: number;
  staleTime?: number;
  retry?: number;
  retryDelay?: number | ((attemptIndex: number) => number);
}

export const useQueryWithRetry = <TData>({
  queryKey,
  queryFn,
  enabled = true,
  gcTime = 10 * 60 * 1000, // 10 минут по умолчанию
  staleTime = 5 * 60 * 1000, // 5 минут по умолчанию
  retry = 2,
  retryDelay = (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
}: UseQueryWithRetryProps<TData>) => {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey,
    queryFn,
    enabled,
    gcTime,
    staleTime,
    retry,
    retryDelay
  } as UseQueryOptions<TData>);

  const handleRetry = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const handleOptimisticUpdate = useCallback((
    updater: (old: TData | undefined) => TData | undefined
  ) => {
    queryClient.setQueryData(queryKey, updater);
  }, [queryClient, queryKey]);

  return {
    ...queryResult,
    handleRetry,
    handleOptimisticUpdate
  };
}; 