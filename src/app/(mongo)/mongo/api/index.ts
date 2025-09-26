import type { MongoDocument, MongoFindOptions } from '@/app/(mongo)/mongo/utils/types';

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200/api').replace(/\/+$/, '');

export async function getCollections(dbName: string): Promise<string[]> {
  const res = await fetch(`${API_BASE}/mongo/collections/${dbName}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const json: unknown = await res.json();
  const names: string[] = Array.isArray(json)
    ? json
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object' && 'name' in item) return String((item as any).name);
          return null;
        })
        .filter((x): x is string => Boolean(x))
    : [];
  return names;
}

export async function postFind(dbName: string, collection: string, query: Record<string, unknown>, options: MongoFindOptions): Promise<MongoDocument[]> {
  const res = await fetch(`${API_BASE}/mongo/find/${dbName}/${encodeURIComponent(collection)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, options }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ''}`);
  }
  return res.json();
}

export async function patchDocument(dbName: string, collection: string, id: string, payload: Record<string, unknown>): Promise<{ matchedCount: number; modifiedCount: number; upsertedId: string | null }> {
  const res = await fetch(`${API_BASE}/mongo/doc/${dbName}/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ''}`);
  }
  return res.json();
}

export async function deleteDocument(dbName: string, collection: string, id: string): Promise<{ deletedCount: number }> {
  const res = await fetch(`${API_BASE}/mongo/doc/${dbName}/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ''}`);
  }
  return res.json();
}


