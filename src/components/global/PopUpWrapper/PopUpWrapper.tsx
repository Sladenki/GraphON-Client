import React, { FC, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./PopUpWrapper.module.scss";
import { X } from 'lucide-react';
import { useModalManager } from "./useModalManager";
import { useScrollLock } from "./useScrollLock";


interface PopUpWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
}

const PopUpWrapper: FC<PopUpWrapperProps> = ({ 
  isOpen, 
  onClose, 
  children,
  width = 'auto',
  height = 'auto'
}) => {
  const modalContainer = useModalManager();
  
  // Блокируем скролл когда попап открыт
  useScrollLock(isOpen);

  // Закрытие по Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Обработчик клика вне окна
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen || !modalContainer) return null;

  return createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.content} style={{ width, height }}>
        <button 
          onClick={onClose} 
          className={styles.closeButton}
          aria-label="Закрыть"
        >
          <X size={24} /> 
        </button>
        {children}
      </div>
    </div>,
    modalContainer
  );
};

export default PopUpWrapper;
