import React, { FC, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./PopUpWrapper.module.scss";
import { X } from 'lucide-react';
import { useModalManager } from './useModalManager';
import { useUIState } from '@/contexts/UIStateContext';

interface PopUpWrapperProps {
  isOpen: boolean; // Управляет открытием/закрытием попапа
  onClose: () => void; // Функция для закрытия попапа
  children: React.ReactNode; // Контент внутри попапа
  width?: number | string; // Необязательная ширина
  height?: number | string; // Необязательная высота
  popupType?: 'schedule' | 'info' | 'other'; // Тип попапа для контекста
}

const PopUpWrapper: FC<PopUpWrapperProps> = ({ 
  isOpen, 
  onClose, 
  children,
  width = 'auto', // Дефолтное значение для ширины
  height = 'auto', // Дефолтное значение для высоты
  popupType = 'other'
 }) => {

  const { setSchedulePopUpOpen, setInfoPopUpOpen } = useUIState();

  // Синхронизируем состояние с контекстом
  useEffect(() => {
    if (popupType === 'schedule') {
      setSchedulePopUpOpen(isOpen);
    } else if (popupType === 'info') {
      setInfoPopUpOpen(isOpen);
    }
  }, [isOpen, popupType, setSchedulePopUpOpen, setInfoPopUpOpen]);

  // Используем хук для управления модальным окном
  const { handleOverlayClick } = useModalManager({ isOpen, onClose });

  if (!isOpen) return null;

  const modalContent = (
    <div className={styles.popupOverlay} onClick={handleOverlayClick}>
      <div className={styles.popupContent} style={{ width, height }}>
        <button onClick={onClose} className={styles.closeButton} aria-label="Закрыть">
          <X size={24} /> 
        </button>
        {children}
      </div>
    </div>
  );

  // Рендерим модальное окно в body через портал
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : modalContent;
};

export default PopUpWrapper;
