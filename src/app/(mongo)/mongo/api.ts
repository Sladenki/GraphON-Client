import { MongoDocument, MongoFindOptions } from './types';

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


