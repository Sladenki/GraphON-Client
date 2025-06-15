import { useState, useEffect, useCallback } from 'react';

interface UseMobileOptimizationProps {
  activeTab: string;
}

export const useMobileOptimization = ({ activeTab }: UseMobileOptimizationProps) => {
  const [isLowPerformanceDevice, setIsLowPerformanceDevice] = useState(false);
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'fast' | 'unknown'>('unknown');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Определяем производительность устройства
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Проверяем hardware concurrency (количество ядер)
    const cores = navigator.hardwareConcurrency || 4;
    
    // Проверяем memory (если доступно)
    const memory = (navigator as any).deviceMemory;
    
    // Определяем низкопроизводительное устройство
    const isLowPerformance = cores < 4 || (memory && memory < 4);
    setIsLowPerformanceDevice(isLowPerformance);
    
  }, []);

  // Определяем скорость соединения
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      const updateConnectionSpeed = () => {
        const effectiveType = connection.effectiveType;
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          setConnectionSpeed('slow');
        } else if (effectiveType === '3g' || effectiveType === '4g') {
          setConnectionSpeed('fast');
        }
      };
      
      updateConnectionSpeed();
      connection.addEventListener('change', updateConnectionSpeed);
      
      return () => {
        connection.removeEventListener('change', updateConnectionSpeed);
      };
    }
  }, []);

  // Проверяем предпочтения пользователя по анимациям
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Оптимизированная стратегия загрузки в зависимости от условий
  const shouldPreloadNextTab = useCallback(() => {
    // Не предзагружаем на медленных устройствах или соединениях
    if (isLowPerformanceDevice || connectionSpeed === 'slow') {
      return false;
    }
    return true;
  }, [isLowPerformanceDevice, connectionSpeed]);

  // Время задержки для предзагрузки в зависимости от производительности
  const getPreloadDelay = useCallback(() => {
    if (isLowPerformanceDevice) return 2000;
    if (connectionSpeed === 'slow') return 1500;
    return 500;
  }, [isLowPerformanceDevice, connectionSpeed]);

  // Стратегия анимаций
  const shouldUseAnimations = useCallback(() => {
    return !prefersReducedMotion && !isLowPerformanceDevice;
  }, [prefersReducedMotion, isLowPerformanceDevice]);

  // Количество компонентов для предзагрузки
  const getMaxPreloadComponents = useCallback(() => {
    if (isLowPerformanceDevice) return 1;
    if (connectionSpeed === 'slow') return 2;
    return 3;
  }, [isLowPerformanceDevice, connectionSpeed]);

  return {
    isLowPerformanceDevice,
    connectionSpeed,
    prefersReducedMotion,
    shouldPreloadNextTab,
    getPreloadDelay,
    shouldUseAnimations,
    getMaxPreloadComponents,
  };
}; 