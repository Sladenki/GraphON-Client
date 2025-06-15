import { useEffect, useCallback, useRef } from 'react';

interface UseMobileNavOptimizationProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: string) => void;
}

interface TouchData {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
}

export const useMobileNavOptimization = ({
  isOpen,
  setIsOpen,
  setActiveTab,
}: UseMobileNavOptimizationProps) => {
  const bodyOverflowRef = useRef<string>('');
  const touchDataRef = useRef<TouchData | null>(null);
  const swipeThreshold = 50; // Минимальное расстояние для срабатывания свайпа
  const swipeTimeThreshold = 300; // Максимальное время для быстрого свайпа (мс)
  const edgeThreshold = 20; // Область от края экрана для начала свайпа (px)

  // Оптимизированная блокировка скролла
  useEffect(() => {
    if (isOpen) {
      // Сохраняем текущее значение overflow
      bodyOverflowRef.current = document.body.style.overflow || '';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      
      return () => {
        document.body.style.overflow = bodyOverflowRef.current;
        document.body.style.touchAction = '';
      };
    }
  }, [isOpen]);

  // Обработчики touch событий для свайпа
  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0];
    const now = Date.now();
    
    touchDataRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      startTime: now,
    };
    
    // Предотвращаем случайные свайпы - начинаем только от края экрана
    if (!isOpen && touch.clientX > edgeThreshold) {
      touchDataRef.current = null;
    }
  }, [isOpen, edgeThreshold]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!touchDataRef.current) return;
    
    const touch = event.touches[0];
    touchDataRef.current.currentX = touch.clientX;
    touchDataRef.current.currentY = touch.clientY;
    
    // Если меню открыто и пользователь свайпает влево, предотвращаем скролл
    if (isOpen) {
      const deltaX = touch.clientX - touchDataRef.current.startX;
      const deltaY = Math.abs(touch.clientY - touchDataRef.current.startY);
      
      // Если горизонтальное движение больше вертикального, предотвращаем скролл
      if (Math.abs(deltaX) > deltaY && deltaX < 0) {
        event.preventDefault();
      }
    }
  }, [isOpen]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!touchDataRef.current) return;
    
    const touchData = touchDataRef.current;
    const deltaX = touchData.currentX - touchData.startX;
    const deltaY = Math.abs(touchData.currentY - touchData.startY);
    const deltaTime = Date.now() - touchData.startTime;
    
    // Проверяем условия для срабатывания свайпа
    const isHorizontalSwipe = Math.abs(deltaX) > deltaY;
    const isDistanceEnough = Math.abs(deltaX) >= swipeThreshold;
    const isTimeValid = deltaTime <= swipeTimeThreshold;
    const isQuickSwipe = isDistanceEnough && isTimeValid;
    
    if (isHorizontalSwipe && (isQuickSwipe || Math.abs(deltaX) >= swipeThreshold * 2)) {
      if (!isOpen && deltaX > 0) {
        // Свайп вправо - открываем меню
        setIsOpen(true);
      } else if (isOpen && deltaX < 0) {
        // Свайп влево - закрываем меню
        setIsOpen(false);
      }
    }
    
    touchDataRef.current = null;
  }, [isOpen, setIsOpen, swipeThreshold, swipeTimeThreshold]);

  // Добавляем обработчики touch событий
  useEffect(() => {
    // Добавляем только на touch устройствах
    if ('ontouchstart' in window) {
      const options = { passive: false };
      
      document.addEventListener('touchstart', handleTouchStart, options);
      document.addEventListener('touchmove', handleTouchMove, options);
      document.addEventListener('touchend', handleTouchEnd, options);
      
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Мемоизированные обработчики
  const handleOpenMenu = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const handleCloseMenu = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    // Предотвращаем закрытие при клике на дочерние элементы
    if (event.target === event.currentTarget) {
      setIsOpen(false);
    }
  }, [setIsOpen]);

  const handleTabChange = useCallback((tabName: string) => {
    setActiveTab(tabName);
    setIsOpen(false);
  }, [setActiveTab, setIsOpen]);

  // Обработка клавиши Escape
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen, setIsOpen]);

  return {
    handleOpenMenu,
    handleCloseMenu,
    handleBackdropClick,
    handleTabChange,
  };
}; 