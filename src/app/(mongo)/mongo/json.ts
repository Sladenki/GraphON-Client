export function safeParseJson<T>(text: string): { ok: true; value: T } | { ok: false; error: string } {
  if (text.trim() === '') return { ok: true, value: {} as unknown as T };
  try {
    const value = JSON.parse(text);
    return { ok: true, value };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function extractId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && '$oid' in (value as any) && typeof (value as any).$oid === 'string') {
    return (value as any).$oid as string;
  }
  return null;
}


