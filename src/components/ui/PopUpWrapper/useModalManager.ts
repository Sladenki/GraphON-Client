import { useEffect, useCallback } from 'react';

interface UseModalManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const useModalManager = ({ isOpen, onClose }: UseModalManagerProps) => {
  // Блокировка скролла body при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      
      // Применяем стили для блокировки скролла
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      
      // Сохраняем позицию скролла
      document.body.setAttribute('data-scroll-y', scrollY.toString());
      
      return () => {
        // Восстанавливаем скролл при закрытии
        const savedScrollY = document.body.getAttribute('data-scroll-y');
        
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.removeAttribute('data-scroll-y');
        
        if (savedScrollY) {
          window.scrollTo(0, parseInt(savedScrollY, 10));
        }
      };
    }
  }, [isOpen]);

  // Обработчик клавиши Escape
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen, onClose]);

  // Обработчик клика вне модального окна
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  return {
    handleOverlayClick,
  };
}; 