import { useEffect, useState, useCallback, useMemo } from 'react';

interface PerformanceConfig {
  isMobile: boolean;
  isLowEndDevice: boolean;
  shouldReduceMotion: boolean;
  shouldOptimizeGraphics: boolean;
  isHighRefreshRate: boolean;
  hasTouchScreen: boolean;
}

export const useAboutPageOptimization = () => {
  const [config, setConfig] = useState<PerformanceConfig>({
    isMobile: false,
    isLowEndDevice: false,
    shouldReduceMotion: false,
    shouldOptimizeGraphics: false,
    isHighRefreshRate: false,
    hasTouchScreen: false,
  });

  const [isClient, setIsClient] = useState(false);

  // Функция для определения характеристик устройства
  const detectDeviceCapabilities = useCallback(() => {
    const isMobile = window.innerWidth <= 768;
    const isLowEndDevice = navigator.hardwareConcurrency <= 4 || 
                          (navigator as any).deviceMemory <= 4 ||
                          window.innerWidth <= 480;
    const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shouldOptimizeGraphics = isMobile || isLowEndDevice || 
                                 window.innerWidth <= 480 ||
                                 window.devicePixelRatio > 2;
    
    // Определяем поддержку высокого refresh rate
    const isHighRefreshRate = 'devicePixelRatio' in window && 
                             window.devicePixelRatio >= 2 && 
                             'ontouchstart' in window;
    
    // Определяем наличие touch screen
    const hasTouchScreen = 'ontouchstart' in window || 
                          navigator.maxTouchPoints > 0;

    setConfig({
      isMobile,
      isLowEndDevice,
      shouldReduceMotion,
      shouldOptimizeGraphics,
      isHighRefreshRate,
      hasTouchScreen,
    });
  }, []);

  // Определение характеристик устройства
  useEffect(() => {
    setIsClient(true);
    detectDeviceCapabilities();
    
    window.addEventListener('resize', detectDeviceCapabilities, { passive: true });
    return () => window.removeEventListener('resize', detectDeviceCapabilities);
  }, [detectDeviceCapabilities]);

  // Оптимизированные настройки для компонентов
  const componentConfig = useMemo(() => ({
    // Настройки для SpaceBackground
    spaceBackground: {
      enabled: !config.isMobile && !config.shouldOptimizeGraphics,
      starCount: config.isLowEndDevice ? 50 : 200,
      animationSpeed: config.shouldReduceMotion ? 0.5 : 1,
      quality: config.shouldOptimizeGraphics ? 'low' : 'high',
    },
    
    // Настройки для анимаций
    animations: {
      duration: config.shouldReduceMotion ? 0.2 : 0.4,
      easing: config.shouldReduceMotion ? 'ease' : 'cubic-bezier(0.4, 0, 0.2, 1)',
      staggerDelay: config.shouldReduceMotion ? 0.1 : 0.2,
    },
    
    // Настройки для изображений
    images: {
      quality: config.shouldOptimizeGraphics ? 0.7 : 1,
      format: config.shouldOptimizeGraphics ? 'webp' : 'auto',
      lazyLoading: true,
    },
    
    // Настройки для 3D эффектов
    threeD: {
      enabled: !config.isMobile && !config.shouldOptimizeGraphics,
      quality: config.shouldOptimizeGraphics ? 'low' : 'high',
      antialiasing: !config.shouldOptimizeGraphics,
    },
    
    // Настройки для скролла
    scroll: {
      // Улучшенные настройки для мобильных
      smoothScrolling: config.hasTouchScreen,
      momentumScrolling: config.isHighRefreshRate,
      scrollBehavior: config.hasTouchScreen ? 'smooth' : 'auto',
      // Оптимизация для touch устройств
      touchAction: config.hasTouchScreen ? 'pan-y' : 'auto',
      // Улучшенная производительность скролла
      willChange: config.isMobile ? 'scroll-position' : 'auto',
      // Оптимизация для iOS
      webkitOverflowScrolling: config.hasTouchScreen ? 'touch' : 'auto',
    },
    
    // Настройки для производительности
    performance: {
      // Оптимизация рендеринга
      transform3d: config.isMobile,
      backfaceVisibility: config.isMobile,
      // Оптимизация анимаций
      animationFrameRate: config.isHighRefreshRate ? 60 : 30,
      // Оптимизация памяти
      memoryOptimization: config.isLowEndDevice,
    },
  }), [config]);

  // Хук для условной загрузки тяжелых компонентов
  const useConditionalLoading = (threshold = 500) => {
    const [shouldLoad, setShouldLoad] = useState(!config.isMobile);
    const [hasIntersected, setHasIntersected] = useState(false);

    useEffect(() => {
      if (config.isMobile) {
        const handleScroll = () => {
          if (window.scrollY > threshold && !hasIntersected) {
            setShouldLoad(true);
            setHasIntersected(true);
          }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
      }
    }, [config.isMobile, threshold, hasIntersected]);

    return shouldLoad;
  };

  // Хук для оптимизированных анимаций
  const useOptimizedAnimation = (defaultVariants: any) => {
    return useMemo(() => {
      if (config.shouldReduceMotion) {
        return {
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: { duration: 0.2 }
          }
        };
      }
      return defaultVariants;
    }, [defaultVariants, config.shouldReduceMotion]);
  };

  // Хук для определения видимости элемента
  const useIntersectionObserver = (options = {}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [ref, setRef] = useState<HTMLElement | null>(null);

    useEffect(() => {
      if (!ref || !isClient) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.isIntersecting);
        },
        {
          threshold: 0.1,
          rootMargin: '50px',
          ...options,
        }
      );

      observer.observe(ref);
      return () => observer.disconnect();
    }, [ref, isClient, options]);

    return { ref: setRef, isVisible };
  };

  // Хук для дебаунсинга
  const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  // Хук для оптимизации скролла
  const useOptimizedScroll = (callback: () => void, delay = 16) => {
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
      let timeoutId: NodeJS.Timeout;

      const handleScroll = () => {
        if (!isScrolling) {
          setIsScrolling(true);
          callback();
        }

        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setIsScrolling(false);
        }, delay);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(timeoutId);
      };
    }, [callback, delay, isScrolling]);
  };

  // Хук для плавного скролла
  const useSmoothScroll = () => {
    const scrollToElement = useCallback((element: HTMLElement | string, offset = 0) => {
      const targetElement = typeof element === 'string' 
        ? document.querySelector(element) as HTMLElement
        : element;
      
      if (!targetElement) return;

      const targetPosition = targetElement.offsetTop - offset;
      
      if (config.hasTouchScreen) {
        // Плавный скролл для touch устройств
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      } else {
        // Обычный скролл для десктопа
        window.scrollTo(0, targetPosition);
      }
    }, [config.hasTouchScreen]);

    return { scrollToElement };
  };

  // Хук для оптимизации touch событий
  const useTouchOptimization = () => {
    const [isTouching, setIsTouching] = useState(false);

    const handleTouchStart = useCallback(() => {
      setIsTouching(true);
    }, []);

    const handleTouchEnd = useCallback(() => {
      setIsTouching(false);
    }, []);

    return {
      isTouching,
      handleTouchStart,
      handleTouchEnd,
    };
  };

  return {
    config,
    isClient,
    componentConfig,
    useConditionalLoading,
    useOptimizedAnimation,
    useIntersectionObserver,
    useDebounce,
    useOptimizedScroll,
    useSmoothScroll,
    useTouchOptimization,
  };
}; 