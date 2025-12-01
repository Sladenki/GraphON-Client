import React, { FC, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./PopUpWrapper.module.scss";
import { X } from 'lucide-react';
import { useModalManager, incrementModalOpenCount, decrementModalOpenCount } from "./useModalManager";
import { useScrollLock } from "./useScrollLock";


interface PopUpWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
  hideCloseButton?: boolean;
  preventClose?: boolean;
}

const PopUpWrapper: FC<PopUpWrapperProps> = ({ 
  isOpen, 
  onClose, 
  children,
  width = 'auto',
  height = 'auto',
  hideCloseButton = false,
  preventClose = false
}) => {
  const modalContainer = useModalManager();
  
  // Блокируем скролл когда попап открыт
  useScrollLock(isOpen);

  // Закрытие по Escape
  useEffect(() => {
    // Управляем счетчиком реально открытых модалок
    if (isOpen) incrementModalOpenCount();
    return () => {
      if (isOpen) decrementModalOpenCount();
    };
  }, [isOpen]);

  // Закрытие по Escape
  useEffect(() => {
    if (!isOpen || preventClose) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, preventClose]);

  // Обработчик клика вне окна
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (preventClose) return
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose, preventClose]
  );

  if (!isOpen || !modalContainer) return null;

  return createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.content} style={{ width, height }}>
        {!hideCloseButton && (
          <button 
            onClick={onClose} 
            className={styles.closeButton}
            aria-label="Закрыть"
          >
            <X size={24} /> 
          </button>
        )}
        {children}
      </div>
    </div>,
    modalContainer
  );
};

export default PopUpWrapper;
