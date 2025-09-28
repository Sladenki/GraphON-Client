import { useCallback } from 'react';
import { toast } from 'sonner';
import { API_BASE } from '../api';

export function useMongoExport(dbName: string) {
  const triggerDownload = useCallback((href: string, suggestedName: string) => {
    try {
      const a = document.createElement('a');
      a.href = href;
      a.rel = 'noopener';
      a.download = suggestedName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      window.open(href, '_blank');
    }
  }, []);

  const exportCollection = useCallback(async (collection: string, params: URLSearchParams, fmt: 'json' | 'ndjson') => {
    const base = (API_BASE || '').replace(/\/+$/, '');
    params.set('format', fmt);
    const url = `${base}/mongo/export/${encodeURIComponent(dbName)}/${encodeURIComponent(collection)}?${params.toString()}`;
    const ts = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}`;
    const ext = fmt === 'json' ? 'json' : 'ndjson';
    const filename = `${collection}-${timestamp}.${ext}`;
    try {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        toast.error(`Экспорт не удался: ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`);
        return;
      }
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      triggerDownload(href, filename);
      setTimeout(() => URL.revokeObjectURL(href), 10_000);
    } catch (e) {
      const msg = (e as Error).message;
      toast.error(`Ошибка сети при экспорте: ${msg}`);
    }
  }, [dbName, triggerDownload]);

  return { exportCollection };
}


