export function safeParseJson<T>(text: string): { ok: true; value: T } | { ok: false; error: string } {
  if (text.trim() === '') return { ok: true, value: {} as unknown as T };
  try {
    const value = JSON.parse(text);
    return { ok: true, value };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}


