import type { MongoDocument, MongoFindOptions, MongoCollectionInfo } from '@/app/(mongo)/mongo/utils/types';

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200/api').replace(/\/+$/, '');

export async function getCollections(dbName: string): Promise<MongoCollectionInfo[]> {
  const res = await fetch(`${API_BASE}/mongo/collections/${dbName}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const json: unknown = await res.json();
  const items: MongoCollectionInfo[] = Array.isArray(json)
    ? json
        .map((item) => {
          if (item && typeof item === 'object' && 'name' in item) {
            const obj = item as any;
            return {
              name: String(obj.name),
              type: typeof obj.type === 'string' ? obj.type : 'collection',
              count: typeof obj.count === 'number' ? obj.count : undefined,
              sizeBytes: typeof obj.sizeBytes === 'number' ? obj.sizeBytes : undefined,
              storageBytes: typeof obj.storageBytes === 'number' ? obj.storageBytes : undefined,
              totalIndexBytes: typeof obj.totalIndexBytes === 'number' ? obj.totalIndexBytes : undefined,
            } as MongoCollectionInfo;
          }
          if (typeof item === 'string') {
            return { name: item, type: 'collection' } as MongoCollectionInfo;
          }
          return null;
        })
        .filter((x): x is MongoCollectionInfo => Boolean(x))
    : [];
  return items;
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

export async function postImport(dbName: string, collection: string, file: File): Promise<{ insertedCount: number; message: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/mongo/import/${dbName}/${encodeURIComponent(collection)}`, {
    method: 'POST',
    body: formData,
  });
  
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ''}`);
  }
  
  return res.json();
}

