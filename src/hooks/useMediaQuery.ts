import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Устанавливаем начальное значение
    setMatches(media.matches);

    // Создаем функцию-обработчик
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Добавляем слушатель
    media.addEventListener('change', listener);

    // Очищаем слушатель при размонтировании
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}
