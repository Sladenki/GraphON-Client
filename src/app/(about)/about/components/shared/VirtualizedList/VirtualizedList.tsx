'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { settings } = useAboutPageOptimization();

  // Оптимизируем для мобильных устройств
  const optimizedItemHeight = useMemo(() => {
    return settings.isMobile ? Math.max(itemHeight, 60) : itemHeight;
  }, [itemHeight, settings.isMobile]);

  const optimizedOverscan = useMemo(() => {
    return settings.isMobile ? Math.min(overscan, 3) : overscan;
  }, [overscan, settings.isMobile]);

  // Вычисляем видимые элементы
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / optimizedItemHeight) - optimizedOverscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / optimizedItemHeight) + optimizedOverscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, optimizedItemHeight, optimizedOverscan, items.length]);

  // Обработчик скролла с дебаунсингом
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, []);

  // Вычисляем общую высоту списка
  const totalHeight = items.length * optimizedItemHeight;

  // Вычисляем смещение для видимых элементов
  const offsetY = visibleRange.startIndex * optimizedItemHeight;

  // Получаем только видимые элементы
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  // Оптимизация для мобильных устройств
  const containerStyle = useMemo(() => ({
    height: containerHeight,
    overflow: 'auto',
    willChange: 'scroll-position',
    WebkitOverflowScrolling: 'touch' as const,
    ...(settings.isMobile && {
      overscrollBehavior: 'contain' as const
    })
  }), [containerHeight, settings.isMobile]);

  const contentStyle = useMemo(() => ({
    height: totalHeight,
    position: 'relative' as const,
    willChange: 'transform'
  }), [totalHeight]);

  const itemsStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: offsetY,
    left: 0,
    right: 0,
    willChange: 'transform'
  }), [offsetY]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={containerStyle}
      onScroll={handleScroll}
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
                  position: 'relative'
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