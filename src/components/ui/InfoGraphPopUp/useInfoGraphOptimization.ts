import { useEffect, useCallback, useMemo } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export const useInfoGraphOptimization = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTouchDevice = useMediaQuery('(hover: none)');
  
  // Определяем устройство для оптимизации
  const shouldOptimize = useMemo(() => isMobile && isTouchDevice, [isMobile, isTouchDevice]);
  
  // Оптимизация анимаций на мобильных
  useEffect(() => {
    if (shouldOptimize) {
      // Уменьшаем частоту рендеринга для экономии батареи
      const optimizeAnimations = () => {
        const style = document.createElement('style');
        style.textContent = `
          @media (max-width: 768px) and (hover: none) {
            *, *::before, *::after {
              animation-duration: 0.1s !important;
              animation-delay: 0s !important;
              transition-duration: 0.1s !important;
              transition-delay: 0s !important;
            }
          }
        `;
        document.head.appendChild(style);
        
        return () => {
          document.head.removeChild(style);
        };
      };
      
      const cleanup = optimizeAnimations();
      return cleanup;
    }
  }, [shouldOptimize]);
  
  // Мемоизированные настройки изображения
  const imageSettings = useMemo(() => ({
    loading: 'lazy' as const,
    placeholder: 'blur' as const,
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7+H0A=',
    quality: shouldOptimize ? 75 : 90,
    sizes: shouldOptimize ? '(max-width: 640px) 120px, (max-width: 768px) 150px, 200px' : '200px',
  }), [shouldOptimize]);
  
  // Оптимизированные обработчики событий
  const createOptimizedHandler = useCallback((handler: (e: any) => void) => {
    if (shouldOptimize) {
      // Добавляем дебаунсинг для мобильных
      let timeoutId: NodeJS.Timeout;
      return (e: any) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => handler(e), 100);
      };
    }
    return handler;
  }, [shouldOptimize]);
  
  // Настройки для запросов
  const querySettings = useMemo(() => ({
    retry: shouldOptimize ? 1 : 2,
    retryDelay: shouldOptimize ? 500 : 1000,
    staleTime: shouldOptimize ? 30000 : 10000, // Дольше кешируем на мобильных
  }), [shouldOptimize]);
  
  return {
    shouldOptimize,
    isMobile,
    imageSettings,
    createOptimizedHandler,
    querySettings,
  };
}; 