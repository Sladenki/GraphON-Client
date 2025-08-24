'use client';

import { ReactNode, useRef, useEffect, useCallback } from 'react';
import { useAboutPageOptimization } from '../../../hooks/useAboutPageOptimization';

interface SmoothScrollProps {
  children: ReactNode;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  scrollThreshold?: number;
}

export const SmoothScroll = ({ 
  children, 
  className = '', 
  onScroll,
  scrollThreshold = 50 
}: SmoothScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { config, componentConfig, useSmoothScroll, useTouchOptimization } = useAboutPageOptimization();
  const { scrollToElement } = useSmoothScroll();
  const { isTouching, handleTouchStart, handleTouchEnd } = useTouchOptimization();

  // Обработчик скролла с оптимизацией
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    
    if (onScroll) {
      onScroll(scrollTop);
    }
  }, [onScroll]);

  // Оптимизация для touch устройств
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !config.hasTouchScreen) return;

    // Добавляем CSS для плавного скролла
    container.style.scrollBehavior = 'smooth';
    (container.style as any)['-webkit-overflow-scrolling'] = 'touch';
    container.style.overscrollBehavior = 'contain';
  }, [config.hasTouchScreen]);

  // Стили для контейнера
  const containerStyle = {
    height: '100%',
    overflow: 'auto' as const,
    willChange: componentConfig.scroll.willChange,
    WebkitOverflowScrolling: componentConfig.scroll.webkitOverflowScrolling as 'touch' | 'auto',
    touchAction: componentConfig.scroll.touchAction,
    scrollBehavior: componentConfig.scroll.scrollBehavior as 'smooth' | 'auto',
    // Дополнительные оптимизации для мобильных
    ...(config.isMobile && {
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden' as const,
    }),
    // Оптимизация для touch устройств
    ...(config.hasTouchScreen && {
      overscrollBehavior: 'contain' as const,
      userSelect: 'none' as const,
    }),
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={containerStyle}
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};

// Компонент для плавного скролла к элементам
export const SmoothScrollTo = ({ 
  target, 
  offset = 0, 
  children 
}: { 
  target: string | HTMLElement; 
  offset?: number; 
  children: ReactNode; 
}) => {
  const { useSmoothScroll } = useAboutPageOptimization();
  const { scrollToElement } = useSmoothScroll();

  const handleClick = useCallback(() => {
    scrollToElement(target, offset);
  }, [target, offset, scrollToElement]);

  return (
    <div onClick={handleClick} style={{ cursor: 'pointer' }}>
      {children}
    </div>
  );
};

// Компонент для отслеживания скролла
export const ScrollTracker = ({ 
  onScrollTop, 
  threshold = 100 
}: { 
  onScrollTop: (scrollTop: number) => void; 
  threshold?: number; 
}) => {
  const { useOptimizedScroll } = useAboutPageOptimization();

  useOptimizedScroll(() => {
    const scrollTop = window.scrollY;
    if (scrollTop > threshold) {
      onScrollTop(scrollTop);
    }
  }, 16);

  return null;
}; 