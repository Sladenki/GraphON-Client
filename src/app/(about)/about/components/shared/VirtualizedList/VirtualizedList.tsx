'use client';

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useAboutPageOptimization } from '../../../hooks/useAboutPageOptimization';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  className?: string;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5,
  className = ''
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { config, componentConfig } = useAboutPageOptimization();

  // Оптимизируем для мобильных устройств
  const optimizedItemHeight = useMemo(() => {
    return config.isMobile ? Math.max(itemHeight, 60) : itemHeight;
  }, [itemHeight, config.isMobile]);

  const optimizedOverscan = useMemo(() => {
    return config.isMobile ? Math.min(overscan, 3) : overscan;
  }, [overscan, config.isMobile]);

  // Вычисляем видимые элементы
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / optimizedItemHeight) - optimizedOverscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / optimizedItemHeight) + optimizedOverscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, optimizedItemHeight, optimizedOverscan, items.length]);

  // Улучшенный обработчик скролла с дебаунсингом
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
    
    // Устанавливаем флаг скролла для оптимизации
    if (!isScrolling) {
      setIsScrolling(true);
    }
  }, [isScrolling]);

  // Сбрасываем флаг скролла через небольшую задержку
  useEffect(() => {
    if (isScrolling) {
      const timeoutId = setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      return () => clearTimeout(timeoutId);
    }
  }, [isScrolling]);

  // Вычисляем общую высоту списка
  const totalHeight = items.length * optimizedItemHeight;

  // Вычисляем смещение для видимых элементов
  const offsetY = visibleRange.startIndex * optimizedItemHeight;

  // Получаем только видимые элементы
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  // Улучшенная оптимизация для мобильных устройств
  const containerStyle = useMemo(() => ({
    height: containerHeight,
    overflow: 'auto' as const,
    willChange: componentConfig.scroll.willChange,
    WebkitOverflowScrolling: componentConfig.scroll.webkitOverflowScrolling as 'touch' | 'auto',
    touchAction: componentConfig.scroll.touchAction,
    scrollBehavior: componentConfig.scroll.scrollBehavior as 'smooth' | 'auto',
    // Дополнительные оптимизации для iOS
    ...(config.hasTouchScreen && {
      overscrollBehavior: 'contain' as const,
    }),
    // Оптимизация производительности
    ...(config.isMobile && {
      transform: componentConfig.performance.transform3d ? 'translateZ(0)' : 'none',
      backfaceVisibility: componentConfig.performance.backfaceVisibility ? 'hidden' as const : 'visible' as const,
    }),
  }), [containerHeight, config, componentConfig]);

  const contentStyle = useMemo(() => ({
    height: totalHeight,
    position: 'relative' as const,
    willChange: 'transform',
    // Оптимизация для GPU
    ...(config.isMobile && {
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden' as const,
    }),
  }), [totalHeight, config.isMobile]);

  const itemsStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: offsetY,
    left: 0,
    right: 0,
    willChange: 'transform',
    // Плавные переходы для мобильных
    ...(config.hasTouchScreen && {
      transition: isScrolling ? 'none' : 'transform 0.1s ease-out',
    }),
  }), [offsetY, config.hasTouchScreen, isScrolling]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={containerStyle}
      onScroll={handleScroll}
      onTouchStart={() => {
        // Оптимизация для touch событий
        if (config.hasTouchScreen) {
          setIsScrolling(true);
        }
      }}
      onTouchEnd={() => {
        if (config.hasTouchScreen) {
          setTimeout(() => setIsScrolling(false), 100);
        }
      }}
    >
      <div style={contentStyle}>
        <div style={itemsStyle}>
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            return (
              <div
                key={actualIndex}
                style={{
                  height: optimizedItemHeight,
                  position: 'relative',
                  // Оптимизация для touch устройств
                  ...(config.hasTouchScreen && {
                    touchAction: 'pan-y',
                    userSelect: 'none' as const,
                  }),
                  // Оптимизация производительности
                  ...(config.isMobile && {
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden' as const,
                  }),
                }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 