import { useEffect, useState, useCallback, useMemo } from 'react';

interface PerformanceSettings {
  reducedMotion: boolean;
  lowPowerMode: boolean;
  isMobile: boolean;
  pixelRatio: number;
  animationFrameRate: number;
}

export const useAboutPageOptimization = () => {
  const [settings, setSettings] = useState<PerformanceSettings>({
    reducedMotion: false,
    lowPowerMode: false,
    isMobile: false,
    pixelRatio: 1,
    animationFrameRate: 60
  });

  // Определяем мобильное устройство
  useEffect(() => {
    const checkDevice = () => {
      const isMobile = window.innerWidth <= 768;
      const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);
      
      setSettings(prev => ({
        ...prev,
        isMobile,
        pixelRatio
      }));
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Проверяем настройки доступности
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const lowPowerQuery = window.matchMedia('(prefers-reduced-data: reduce)');
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({
        ...prev,
        reducedMotion: e.matches
      }));
    };

    const handlePowerChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({
        ...prev,
        lowPowerMode: e.matches
      }));
    };

    setSettings(prev => ({
      ...prev,
      reducedMotion: mediaQuery.matches,
      lowPowerMode: lowPowerQuery.matches
    }));

    mediaQuery.addEventListener('change', handleMotionChange);
    lowPowerQuery.addEventListener('change', handlePowerChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      lowPowerQuery.removeEventListener('change', handlePowerChange);
    };
  }, []);

  // Оптимизированные настройки анимаций
  const animationSettings = useMemo(() => ({
    duration: settings.reducedMotion ? 0.1 : 0.3,
    ease: settings.reducedMotion ? 'linear' : [0.4, 0, 0.2, 1],
    frameRate: settings.lowPowerMode ? 30 : settings.animationFrameRate,
    staggerDelay: settings.reducedMotion ? 0 : 0.1
  }), [settings.reducedMotion, settings.lowPowerMode, settings.animationFrameRate]);

  // Дебаунсинг для скролла
  const debouncedScroll = useCallback((callback: () => void, delay: number = 16) => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    };
  }, []);

  // Оптимизация для Intersection Observer
  const observerOptions = useMemo(() => ({
    root: null,
    rootMargin: settings.isMobile ? '50px' : '100px',
    threshold: settings.reducedMotion ? 0.1 : 0.3
  }), [settings.isMobile, settings.reducedMotion]);

  // Настройки для Three.js
  const threeJSSettings = useMemo(() => ({
    pixelRatio: settings.pixelRatio,
    antialias: !settings.lowPowerMode,
    powerPreference: settings.lowPowerMode ? 'default' : 'high-performance',
    alpha: true,
    stencil: false,
    depth: true
  }), [settings.pixelRatio, settings.lowPowerMode]);

  return {
    settings,
    animationSettings,
    debouncedScroll,
    observerOptions,
    threeJSSettings
  };
}; 