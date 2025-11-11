"use client";

import { useState } from "react";
import { postImport } from "../api";

export function useMongoImport(dbName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<{ insertedCount: number; message: string } | null>(null);

  const importFile = async (collection: string, file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await postImport(dbName, collection, file);
      setResult(res);
      return res;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    importFile,
    loading,
    error,
    result,
  };
}

