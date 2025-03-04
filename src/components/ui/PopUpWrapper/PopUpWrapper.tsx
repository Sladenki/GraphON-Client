import React, { FC, useCallback } from "react";
import styles from "./PopUpWrapper.module.scss";
import { X } from 'lucide-react';

interface PopUpWrapperProps {
  isOpen: boolean; // Управляет открытием/закрытием попапа
  onClose: () => void; // Функция для закрытия попапа
  children: React.ReactNode; // Контент внутри попапа
  width?: number | string; // Необязательная ширина
  height?: number | string; // Необязательная высота
}

const PopUpWrapper: FC<PopUpWrapperProps> = ({ 
  isOpen, 
  onClose, 
  children,
  width = 'auto', // Дефолтное значение для ширины
  height = 'auto' // Дефолтное значение для высоты
 }) => {

  // Обработчик клика вне окна для его закрытия
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div className={styles.popupOverlay} onClick={handleOverlayClick}>
      <div className={styles.popupContent} style={{ width, height }}>
        <button onClick={onClose} className={styles.closeButton}>
          <X size={24} /> 
        </button>
        {children}
      </div>
    </div>
  );
};

export default PopUpWrapper;
