import { useEffect, useCallback, useRef } from 'react';

interface UseMobileNavOptimizationProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export const useMobileNavOptimization = ({
  isOpen,
  setIsOpen,
  setActiveTab,
}: UseMobileNavOptimizationProps) => {
  const bodyOverflowRef = useRef<string>('');

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