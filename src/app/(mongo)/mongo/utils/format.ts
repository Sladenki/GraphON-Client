export function formatBytes(num?: number): string {
  if (!num || !Number.isFinite(num)) return '';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let n = num;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 100 ? 0 : n >= 10 ? 1 : 2)} ${units[i]}`;
}

export function formatNumber(num?: number): string {
  if (typeof num !== 'number' || !Number.isFinite(num)) return '';
  try {
    return new Intl.NumberFormat('ru-RU').format(num);
  } catch {
    return String(num);
  }
}


