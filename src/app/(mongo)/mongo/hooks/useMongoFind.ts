import { useCallback, useState } from 'react';
import { postFind } from '../api';
import { FetchState, MongoDocument, MongoFindOptions } from '../utils/types';
import { toast } from 'sonner';

export function useMongoFind(dbName: string) {
  const [state, setState] = useState<FetchState<MongoDocument[]>>({ loading: false, error: null, data: null });
  const [durationMs, setDurationMs] = useState<number | null>(null);

  const find = useCallback(async (collection: string, query: Record<string, unknown>, options: MongoFindOptions) => {
    setState({ loading: true, error: null, data: null });
    const started = performance.now();
    try {
      const docs = await postFind(dbName, collection, query, options);
      setDurationMs(performance.now() - started);
      setState({ loading: false, error: null, data: docs });
    } catch (e) {
      const msg = (e as Error).message;
      setState({ loading: false, error: msg, data: null });
      toast.error(`Ошибка запроса: ${msg}`);
    }
  }, [dbName]);

  return { ...state, durationMs, find };
}


