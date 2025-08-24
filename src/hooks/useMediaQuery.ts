import { useState, useEffect } from 'react';

// Кэш для медиа-запросов
const mediaQueryCache = new Map<string, MediaQueryList>();

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // SSR-безопасная инициализация
    if (typeof window === 'undefined') return false;
    
    // Используем кэш для повторных запросов
    let media = mediaQueryCache.get(query);
    if (!media) {
      media = window.matchMedia(query);
      mediaQueryCache.set(query, media);
    }
    
    return media.matches;
  });

  useEffect(() => {
    // Получаем из кэша или создаем новый
    let media = mediaQueryCache.get(query);
    if (!media) {
      media = window.matchMedia(query);
      mediaQueryCache.set(query, media);
    }
    
    // Проверяем начальное значение
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Оптимизированный обработчик
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Используем современный API
    if (media.addEventListener) {
      media.addEventListener('change', handleChange);
      return () => media!.removeEventListener('change', handleChange);
    } else {
      // Fallback для старых браузеров
      media.addListener(handleChange);
      return () => media!.removeListener(handleChange);
    }
  }, [query, matches]);

  return matches;
}
