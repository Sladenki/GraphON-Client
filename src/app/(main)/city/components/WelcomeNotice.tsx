'use client';

import React, { useEffect, useState } from 'react';
import { Info, X } from 'lucide-react';
import styles from './WelcomeNotice.module.scss';

const STORAGE_KEY = 'city_page_welcome_seen';

const WelcomeNotice: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Проверяем, видел ли пользователь это сообщение
    if (typeof window !== 'undefined') {
      const hasSeenNotice = localStorage.getItem(STORAGE_KEY);
      if (!hasSeenNotice) {
        // Показываем с небольшой задержкой для плавного появления
        setTimeout(() => setIsVisible(true), 500);
      }
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Сохраняем информацию, что пользователь видел сообщение
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  };

  if (!isVisible) return null;

  return (
    <div className={styles.backdrop} onClick={handleClose}>
      <div className={styles.notice} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose} aria-label="Закрыть">
          <X size={20} />
        </button>
        
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Info size={32} />
          </div>
          <h3 className={styles.title}>🗺️ Тестируем карту событий</h3>
        </div>
        
        <div className={styles.content}>
          <p>
            Мы запустили экспериментальную версию интерактивной карты событий Калининграда!
          </p>
          <p>
            <strong>Все события реальные и актуальные</strong>, но их визуальное положение на карте пока может немного отличаться от точного адреса.
          </p>
          <p className={styles.footer}>
            Спасибо за понимание! Мы активно улучшаем сервис и будем рады вашим отзывам и предложениям.
          </p>
        </div>
        
        <button className={styles.confirmButton} onClick={handleClose}>
          Отлично, понятно! ✨
        </button>
      </div>
    </div>
  );
};

export default WelcomeNotice;

