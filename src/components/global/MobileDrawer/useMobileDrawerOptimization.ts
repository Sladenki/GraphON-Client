import { useEffect, useCallback, useRef } from 'react';
import { getModalState } from '../PopUpWrapper/useModalManager';

interface UseMobileDrawerOptimizationProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
  fromEdge?: boolean; // признак начала жеста у левого края
}

/**
 * Хук для оптимизации работы мобильного drawer
 * 
 * Поддерживаемые жесты:
 * - Свайп слева направо (в любом месте экрана) - открывает боковую панель
 * - Свайп справа налево (когда панель открыта) - закрывает боковую панель
 * - Минимальное расстояние свайпа: 50px
 * - Максимальное время свайпа: 300ms
 * - Максимальное вертикальное отклонение: 100px
 */
export const useMobileDrawerOptimization = ({
  isOpen,
  setIsOpen,
}: UseMobileDrawerOptimizationProps) => {
  const bodyOverflowRef = useRef<string>('');
  const touchStartRef = useRef<TouchPoint | null>(null);
  const touchMoveRef = useRef<TouchPoint | null>(null);

  // Конфигурация для свайпа
  const SWIPE_CONFIG = {
    minDistance: 35, // минимум жеста короче — открытие легче
    maxTime: 600, // больше времени на жест — меньше промахов
    maxVerticalDistance: 160, // допускаем большее вертикальное отклонение
    edgeZone: Number.POSITIVE_INFINITY, // разрешаем старт в любом месте экрана
    horizontalDominanceRatio: 1.5, // |ΔX| должен заметно превышать |ΔY|
  } as const;

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
    
    // Проверяем, разрешен ли свайп в этом контейнере
    const isSwipeEnabled = target.closest('[data-swipe-enabled="true"]');
    
    // Если свайп разрешен в контейнере, всегда инициализируем его
    if (isSwipeEnabled) {
      const touch = event.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
        fromEdge: touch.clientX <= SWIPE_CONFIG.edgeZone,
      };
      touchMoveRef.current = null;
      return;
    }
    
    // Исключаем drawer из проверки скроллируемых областей
    const isInsideDrawer = target.closest('[class*="drawer"]');
    
    if (!isInsideDrawer) {
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
    }
    
    const touch = event.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      fromEdge: touch.clientX <= SWIPE_CONFIG.edgeZone,
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
    
    // Проверяем, разрешен ли свайп в этом контейнере
    const isSwipeEnabled = target.closest('[data-swipe-enabled="true"]');
    
    // Если свайп разрешен в контейнере, обрабатываем движение
    if (isSwipeEnabled) {
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
      if (deltaX > deltaY * SWIPE_CONFIG.horizontalDominanceRatio && deltaX > 16) {
        // Предотвращаем скролл только для потенциальных свайпов
        event.preventDefault();
      }
      
      touchMoveRef.current = currentPoint;
      return;
    }
    
    // Исключаем drawer из проверки скроллируемых областей
    const isInsideDrawer = target.closest('[class*="drawer"]');
    
    if (!isInsideDrawer) {
      const isInScrollableArea = target.closest('.themeScroll, .subgraphContent, [data-scrollable="true"]') || 
                                target.classList.contains('themeScroll') ||
                                target.classList.contains('subgraphContent') ||
                                target.dataset.scrollable === 'true';
      
      if (isInScrollableArea) {
        // Разрешаем нативный скролл в областях карточек
        return;
      }
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
    if (deltaX > deltaY * SWIPE_CONFIG.horizontalDominanceRatio && deltaX > 16) {
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
    const isHorizontalSwipe = deltaY < SWIPE_CONFIG.maxVerticalDistance && Math.abs(deltaX) > Math.abs(deltaY) * SWIPE_CONFIG.horizontalDominanceRatio;

    if (isWithinTimeLimit && isHorizontalSwipe) {
      // Свайп слева направо для открытия (когда панель закрыта)
      const isRightSwipe = deltaX > SWIPE_CONFIG.minDistance;
      if (isRightSwipe && !isOpen && !!startPoint.fromEdge) {
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

  // Добавляем обработчики touch событий (capture, чтобы не блокировались дочерними элементами)
  useEffect(() => {
    const passiveCapture = { passive: true, capture: true } as AddEventListenerOptions;
    const activeCapture = { passive: false, capture: true } as AddEventListenerOptions; // Для touchmove нужен preventDefault
    
    document.addEventListener('touchstart', handleTouchStart, passiveCapture);
    document.addEventListener('touchmove', handleTouchMove, activeCapture);
    document.addEventListener('touchend', handleTouchEnd, passiveCapture);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, passiveCapture);
      document.removeEventListener('touchmove', handleTouchMove, activeCapture);
      document.removeEventListener('touchend', handleTouchEnd, passiveCapture);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Мемоизированные обработчики
  const handleOpenDrawer = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const handleCloseDrawer = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    // Предотвращаем закрытие при клике на дочерние элементы
    if (event.target === event.currentTarget) {
      setIsOpen(false);
    }
  }, [setIsOpen]);

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
    handleOpenDrawer,
    handleCloseDrawer,
    handleBackdropClick,
  };
};

