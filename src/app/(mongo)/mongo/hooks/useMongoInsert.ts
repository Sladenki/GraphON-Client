"use client";

import { useState } from "react";
import { postInsertOne } from "../api";

export function useMongoInsert(dbName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<{ insertedId: string; message: string } | null>(null);

  const insertOne = async (collection: string, doc: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await postInsertOne(dbName, collection, doc);
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
    insertOne,
    loading,
    error,
    result,
  };
}

