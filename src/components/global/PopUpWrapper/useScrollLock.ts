import { useEffect, useRef } from 'react';

export const useScrollLock = (isLocked: boolean) => {
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    if (!isLocked) return;

    const body = document.body;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Сохраняем текущую позицию скролла
    scrollPositionRef.current = window.scrollY;
    
    // Сохраняем оригинальные стили
    const originalOverflow = body.style.overflow;
    const originalPaddingRight = body.style.paddingRight;
    
    // Применяем блокировку
    body.style.overflow = 'hidden';
    
    // Компенсируем ширину скроллбара только если он есть
    if (scrollBarWidth > 0) {
      body.style.paddingRight = `${scrollBarWidth}px`;
    }

    // Cleanup
    return () => {
      body.style.overflow = originalOverflow;
      body.style.paddingRight = originalPaddingRight;
    };
  }, [isLocked]);
};

