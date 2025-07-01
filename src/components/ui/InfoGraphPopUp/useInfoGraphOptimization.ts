import { useCallback, useMemo, useState, useEffect } from 'react';

export const useInfoGraphOptimization = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Отслеживаем изменения размера экрана
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile(); // Проверяем при монтировании
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Настройки для запросов
  const querySettings = useMemo(() => ({
    retry: isMobile ? 2 : 3,
    staleTime: isMobile ? 10 * 60 * 1000 : 5 * 60 * 1000, // 10 мин на мобильных, 5 мин на десктопе
    gcTime: isMobile ? 15 * 60 * 1000 : 10 * 60 * 1000,
  }), [isMobile]);

  // Настройки изображений для производительности
  const imageSettings = useMemo(() => ({
    priority: false,
    quality: isMobile ? 70 : 80,
    sizes: isMobile ? '150px' : '200px',
    placeholder: 'blur' as const,
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyatik+6.'
  }), [isMobile]);

  // Создаем оптимизированные обработчики событий с дебаунсингом для мобильных
  const createOptimizedHandler = useCallback((handler: (e: any) => void) => {
    let timeoutId: NodeJS.Timeout;
    
    return (e: any) => {
      if (isMobile) {
        // Дебаунсинг на мобильных устройствах
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => handler(e), 100);
      } else {
        handler(e);
      }
    };
  }, [isMobile]);

  return {
    isMobile,
    querySettings,
    imageSettings,
    createOptimizedHandler
  };
}; 