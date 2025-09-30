import { useCallback, useEffect, useState } from 'react';
import { getCollections } from '../api';
import { FetchState, MongoCollectionInfo } from '../utils/types';
import { toast } from 'sonner';

export function useMongoCollections(dbName: string) {
  const [state, setState] = useState<FetchState<MongoCollectionInfo[]>>({ loading: false, error: null, data: null });

  const refetch = useCallback(async () => {
    setState((s) => ({ loading: true, error: null, data: s.data }));
    try {
      const items = await getCollections(dbName);
      setState({ loading: false, error: null, data: items });
    } catch (e) {
      const msg = (e as Error).message;
      setState({ loading: false, error: msg, data: null });
      toast.error(`Не удалось получить коллекции: ${msg}`);
    }
  }, [dbName]);

  useEffect(() => { refetch(); }, [refetch]);

  return { ...state, refetch };
}


