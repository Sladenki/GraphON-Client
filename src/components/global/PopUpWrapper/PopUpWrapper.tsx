import React, { FC, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./PopUpWrapper.module.scss";
import { X } from 'lucide-react';
import { useModalManager, useModalState } from "./useModalManager";

interface PopUpWrapperProps {
  isOpen: boolean; // Управляет открытием/закрытием попапа
  onClose: () => void; // Функция для закрытия попапа
  children: React.ReactNode; // Контент внутри попапа
  width?: number | string; // Необязательная ширина
  height?: number | string; // Необязательная высота
  modalId?: string; // Уникальный ID для modal окна
}

const PopUpWrapper: FC<PopUpWrapperProps> = ({ 
  isOpen, 
  onClose, 
  children,
  width = 'auto', // Дефолтное значение для ширины
  height = 'auto', // Дефолтное значение для высоты
  modalId = 'popup-wrapper' // Дефолтный ID
 }) => {
  const modalContainer = useModalManager();
  const { registerModal } = useModalState();
  const unregisterRef = useRef<(() => void) | null>(null);

  // Регистрируем/отменяем регистрацию modal окна при изменении isOpen
  useEffect(() => {
    if (isOpen) {
      unregisterRef.current = registerModal(modalId);
    } else {
      if (unregisterRef.current) {
        unregisterRef.current();
        unregisterRef.current = null;
      }
    }

    return () => {
      if (unregisterRef.current) {
        unregisterRef.current();
        unregisterRef.current = null;
      }
    };
  }, [isOpen, modalId, registerModal]);

  // Блокируем/разблокируем общий скролл при изменении isOpen
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = ''; // Восстановление при размонтировании
    };
  }, [isOpen]);

  // Обработчик клика вне окна для его закрытия
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen || !modalContainer) return null;

  // Рендерим через портал в специальный контейнер
  return createPortal(
    <div className={styles.popupOverlay} onClick={handleOverlayClick}>
      <div className={styles.popupContent} style={{ width, height }}>
        <button onClick={onClose} className={styles.closeButton}>
          <X size={24} /> 
        </button>
        {children}
      </div>
    </div>,
    modalContainer
  );
};

export default PopUpWrapper;
