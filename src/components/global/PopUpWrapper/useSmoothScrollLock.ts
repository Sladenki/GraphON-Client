import { useEffect, useRef, useCallback } from 'react';

interface ScrollLockState {
  originalOverflow: string;
  originalPaddingRight: string;
  scrollBarWidth: number;
}

export const useSmoothScrollLock = (isLocked: boolean) => {
  const scrollLockStateRef = useRef<ScrollLockState | null>(null);
  const lockCountRef = useRef(0);

  // Функция для получения ширины скроллбара
  const getScrollBarWidth = useCallback(() => {
    // Создаем временный div для измерения ширины скроллбара
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);

    const inner = document.createElement('div');
    outer.appendChild(inner);

    const scrollBarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode?.removeChild(outer);

    return scrollBarWidth;
  }, []);

  // Функция для блокировки скролла
  const lockScroll = useCallback(() => {
    if (lockCountRef.current === 0) {
      const scrollBarWidth = getScrollBarWidth();
      const body = document.body;
      
      // Сохраняем текущие стили
      scrollLockStateRef.current = {
        originalOverflow: body.style.overflow || '',
        originalPaddingRight: body.style.paddingRight || '',
        scrollBarWidth,
      };

      // Применяем блокировку с компенсацией ширины скроллбара
      body.style.overflow = 'hidden';
      
      // Компенсируем ширину скроллбара только если он есть
      if (scrollBarWidth > 0 && window.innerWidth > document.documentElement.clientWidth) {
        body.style.paddingRight = `${scrollBarWidth}px`;
      }

      // Дополнительная блокировка для iOS Safari
      body.style.position = 'relative';
      body.style.touchAction = 'none';
    }
    
    lockCountRef.current++;
  }, [getScrollBarWidth]);

  // Функция для разблокировки скролла
  const unlockScroll = useCallback(() => {
    lockCountRef.current = Math.max(0, lockCountRef.current - 1);
    
    if (lockCountRef.current === 0 && scrollLockStateRef.current) {
      const body = document.body;
      const { originalOverflow, originalPaddingRight } = scrollLockStateRef.current;

      // Восстанавливаем оригинальные стили
      body.style.overflow = originalOverflow;
      body.style.paddingRight = originalPaddingRight;
      body.style.position = '';
      body.style.touchAction = '';
      
      scrollLockStateRef.current = null;
    }
  }, []);

  // Основной эффект
  useEffect(() => {
    if (isLocked) {
      lockScroll();
    } else {
      unlockScroll();
    }

    // Cleanup при размонтировании
    return () => {
      if (isLocked) {
        unlockScroll();
      }
    };
  }, [isLocked, lockScroll, unlockScroll]);

  // Cleanup при размонтировании компонента
  useEffect(() => {
    return () => {
      // Принудительная разблокировка при размонтировании
      if (scrollLockStateRef.current) {
        const body = document.body;
        body.style.overflow = scrollLockStateRef.current.originalOverflow;
        body.style.paddingRight = scrollLockStateRef.current.originalPaddingRight;
        body.style.position = '';
        body.style.touchAction = '';
        scrollLockStateRef.current = null;
        lockCountRef.current = 0;
      }
    };
  }, []);

  return {
    lockScroll,
    unlockScroll,
    isLocked: lockCountRef.current > 0,
  };
}; 