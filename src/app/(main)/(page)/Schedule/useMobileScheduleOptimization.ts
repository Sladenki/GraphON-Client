import { useState, useEffect, useMemo, useCallback } from 'react';

interface UseMobileScheduleOptimizationProps {
  isActive: boolean;
}

export const useMobileScheduleOptimization = ({ isActive }: UseMobileScheduleOptimizationProps) => {
  const [isLowPerformanceDevice, setIsLowPerformanceDevice] = useState(false);
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'fast' | 'unknown'>('unknown');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
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
    
    // Определяем мобильное устройство
    const isMobileDevice = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(isMobileDevice);
    
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

  // Стратегия анимаций
  const shouldUseAnimations = useCallback(() => {
    return !prefersReducedMotion && !isLowPerformanceDevice && !isMobile;
  }, [prefersReducedMotion, isLowPerformanceDevice, isMobile]);

  // Стратегия рендеринга
  const shouldUseSimplifiedRendering = useCallback(() => {
    return isLowPerformanceDevice || isMobile || connectionSpeed === 'slow';
  }, [isLowPerformanceDevice, isMobile, connectionSpeed]);

  // Стратегия градиентов и эффектов
  const shouldUseGradients = useCallback(() => {
    return !isLowPerformanceDevice && !isMobile;
  }, [isLowPerformanceDevice, isMobile]);

  // Стратегия backdrop-filter
  const shouldUseBackdropFilter = useCallback(() => {
    return !isLowPerformanceDevice && !isMobile;
  }, [isLowPerformanceDevice, isMobile]);

  // Количество одновременно рендерящихся карточек
  const getMaxVisibleCards = useCallback(() => {
    if (isLowPerformanceDevice) return 5;
    if (isMobile) return 10;
    return 20;
  }, [isLowPerformanceDevice, isMobile]);

  // Задержка для debounce операций
  const getDebounceDelay = useCallback(() => {
    if (isLowPerformanceDevice) return 500;
    if (isMobile) return 300;
    return 150;
  }, [isLowPerformanceDevice, isMobile]);

  // CSS классы для оптимизации
  const getOptimizationClasses = useMemo(() => {
    const classes: string[] = [];
    
    if (isLowPerformanceDevice) classes.push('low-performance');
    if (isMobile) classes.push('mobile-optimized');
    if (prefersReducedMotion) classes.push('reduced-motion');
    if (connectionSpeed === 'slow') classes.push('slow-connection');
    
    return classes.join(' ');
  }, [isLowPerformanceDevice, isMobile, prefersReducedMotion, connectionSpeed]);

  return {
    isLowPerformanceDevice,
    connectionSpeed,
    prefersReducedMotion,
    isMobile,
    shouldUseAnimations,
    shouldUseSimplifiedRendering,
    shouldUseGradients,
    shouldUseBackdropFilter,
    getMaxVisibleCards,
    getDebounceDelay,
    getOptimizationClasses,
  };
}; 