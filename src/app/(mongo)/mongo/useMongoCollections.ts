import { useCallback, useEffect, useState } from 'react';
import { getCollections } from './api';
import { FetchState } from './types';
import { toast } from 'sonner';

export function useMongoCollections(dbName: string) {
  const [state, setState] = useState<FetchState<string[]>>({ loading: false, error: null, data: null });

  const refetch = useCallback(async () => {
    setState((s) => ({ loading: true, error: null, data: s.data }));
    try {
      const names = await getCollections(dbName);
      setState({ loading: false, error: null, data: names });
    } catch (e) {
      const msg = (e as Error).message;
      setState({ loading: false, error: msg, data: null });
      toast.error(`Не удалось получить коллекции: ${msg}`);
    }
  }, [dbName]);

  useEffect(() => { refetch(); }, [refetch]);

  return { ...state, refetch };
}


