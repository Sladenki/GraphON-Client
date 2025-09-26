import { useCallback, useState } from 'react';
import { deleteDocument, patchDocument } from '../api';
import { toast } from 'sonner';

export function useMongoDocOps(dbName: string) {
  const [loading, setLoading] = useState<boolean>(false);

  const patch = useCallback(async (collection: string, id: string, payload: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await patchDocument(dbName, collection, id, payload);
      toast.success(`Обновлено: matched=${res.matchedCount}, modified=${res.modifiedCount}`);
      return res;
    } catch (e) {
      const msg = (e as Error).message;
      toast.error(`Ошибка обновления: ${msg}`);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [dbName]);

  const remove = useCallback(async (collection: string, id: string) => {
    setLoading(true);
    try {
      const res = await deleteDocument(dbName, collection, id);
      toast.success(`Удалено: ${res.deletedCount}`);
      return res;
    } catch (e) {
      const msg = (e as Error).message;
      toast.error(`Ошибка удаления: ${msg}`);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [dbName]);

  return { loading, patch, remove };
}


