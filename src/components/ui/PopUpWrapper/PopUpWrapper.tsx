import React, { FC } from "react";
import styles from "./PopUpWrapper.module.scss";

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
  if (!isOpen) return null;

  // Обработчик клика вне окна для его закрытия
  const handleOverlayClick = (e: any) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.popupOverlay} onClick={handleOverlayClick}>
      <div 
        className={styles.popupContent}
        style={{ width, height }}
      >
        <button onClick={onClose} className={styles.closeButton}>
          Закрыть
        </button>
        {children}
      </div>
    </div>
  );
};

export default PopUpWrapper;
