import { useEffect, useCallback, useRef } from 'react';
import { getModalState } from '../PopUpWrapper/useModalManager';

interface UseMobileNavOptimizationProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: string) => void;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export const useMobileNavOptimization = ({
  isOpen,
  setIsOpen,
  setActiveTab,
}: UseMobileNavOptimizationProps) => {
  const bodyOverflowRef = useRef<string>('');
  const touchStartRef = useRef<TouchPoint | null>(null);
  const touchMoveRef = useRef<TouchPoint | null>(null);

  // Конфигурация для свайпа
  const SWIPE_CONFIG = {
    minDistance: 50, // Минимальное расстояние для свайпа (в пикселях)
    maxTime: 300, // Максимальное время для свайпа (в мс)
    maxVerticalDistance: 100, // Максимальное вертикальное отклонение
  };

  // Функция для проверки, можно ли использовать свайп
  const canUseSwipe = useCallback(() => {
    const modalState = getModalState();
    return !modalState.isAnyModalOpen;
  }, []);

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

  // Обработчик начала касания
  const handleTouchStart = useCallback((event: TouchEvent) => {
    // Блокируем свайп если открыт любой popup
    if (!canUseSwipe()) {
      touchStartRef.current = null;
      touchMoveRef.current = null;
      return;
    }

    // Проверяем, происходит ли событие внутри области карточек
    const target = event.target as HTMLElement;
    const isInScrollableArea = target.closest('.themeScroll, .subgraphContent, [data-scrollable="true"]') || 
                              target.classList.contains('themeScroll') ||
                              target.classList.contains('subgraphContent') ||
                              target.dataset.scrollable === 'true';
    
    if (isInScrollableArea) {
      // Не инициализируем свайп внутри скроллируемых областей
      touchStartRef.current = null;
      touchMoveRef.current = null;
      return;
    }
    
    const touch = event.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    touchMoveRef.current = null;
  }, [canUseSwipe]);

  // Обработчик движения касания
  const handleTouchMove = useCallback((event: TouchEvent) => {
    // Блокируем свайп если открыт любой popup
    if (!canUseSwipe() || !touchStartRef.current) {
      return;
    }
    
    // Проверяем, происходит ли событие внутри области карточек или других скроллируемых контейнеров
    const target = event.target as HTMLElement;
    const isInScrollableArea = target.closest('.themeScroll, .subgraphContent, [data-scrollable="true"]') || 
                              target.classList.contains('themeScroll') ||
                              target.classList.contains('subgraphContent') ||
                              target.dataset.scrollable === 'true';
    
    if (isInScrollableArea) {
      // Разрешаем нативный скролл в областях карточек
      return;
    }
    
    const touch = event.touches[0];
    const currentPoint = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    
    // Вычисляем направление движения для предотвращения конфликтов со скроллом
    const deltaX = Math.abs(currentPoint.x - touchStartRef.current.x);
    const deltaY = Math.abs(currentPoint.y - touchStartRef.current.y);
    
    // Если горизонтальное движение превышает вертикальное, это может быть свайп
    if (deltaX > deltaY && deltaX > 10) {
      // Предотвращаем скролл только для потенциальных свайпов вне скроллируемых областей
      event.preventDefault();
    }
    
    touchMoveRef.current = currentPoint;
  }, [canUseSwipe]);

  // Обработчик окончания касания
  const handleTouchEnd = useCallback(() => {
    // Блокируем свайп если открыт любой popup
    if (!canUseSwipe() || !touchStartRef.current || !touchMoveRef.current) {
      touchStartRef.current = null;
      touchMoveRef.current = null;
      return;
    }

    const startPoint = touchStartRef.current;
    const endPoint = touchMoveRef.current;

    // Вычисляем расстояние и время
    const deltaX = endPoint.x - startPoint.x;
    const deltaY = Math.abs(endPoint.y - startPoint.y);
    const deltaTime = endPoint.time - startPoint.time;

    // Проверяем общие условия для свайпа
    const isWithinTimeLimit = deltaTime < SWIPE_CONFIG.maxTime;
    const isHorizontalSwipe = deltaY < SWIPE_CONFIG.maxVerticalDistance;

    if (isWithinTimeLimit && isHorizontalSwipe) {
      // Свайп слева направо для открытия (когда панель закрыта)
      const isRightSwipe = deltaX > SWIPE_CONFIG.minDistance;
      if (isRightSwipe && !isOpen) {
        setIsOpen(true);
      }
      
      // Свайп справа налево для закрытия (когда панель открыта)
      const isLeftSwipe = deltaX < -SWIPE_CONFIG.minDistance;
      if (isLeftSwipe && isOpen) {
        setIsOpen(false);
      }
    }

    // Очищаем ссылки
    touchStartRef.current = null;
    touchMoveRef.current = null;
  }, [isOpen, setIsOpen, canUseSwipe]);

  // Добавляем обработчики touch событий
  useEffect(() => {
    const passiveOptions = { passive: true };
    const activeOptions = { passive: false }; // Для touchmove нужен preventDefault
    
    document.addEventListener('touchstart', handleTouchStart, passiveOptions);
    document.addEventListener('touchmove', handleTouchMove, activeOptions);
    document.addEventListener('touchend', handleTouchEnd, passiveOptions);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
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