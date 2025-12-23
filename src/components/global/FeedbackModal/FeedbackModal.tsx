'use client';

import React, { useEffect, useState } from 'react';
 import { useAuth } from '@/providers/AuthProvider';
import PopUpWrapper from '../PopUpWrapper/PopUpWrapper';
import styles from './FeedbackModal.module.scss';
import { MessageCircle } from 'lucide-react';

const STORAGE_KEY = 'feedbackModalSeen';

const FeedbackModal: React.FC = () => {
   const { isLoggedIn, user } = useAuth();
   const canShow = Boolean(isLoggedIn && user);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Проверяем, видел ли пользователь это окно
    if (typeof window !== 'undefined') {
      setIsHydrated(true);
 
       // Только для авторизованных пользователей
       if (!canShow) {
         setIsOpen(false);
         return;
       }
 
      const hasSeenModal = localStorage.getItem(STORAGE_KEY);
      if (!hasSeenModal) {
        // Показываем с небольшой задержкой для плавного появления
         const t = window.setTimeout(() => setIsOpen(true), 800);
         return () => window.clearTimeout(t);
      }
    }
   }, [canShow]);
 
   // Если пользователь разлогинился — сразу закрываем
   useEffect(() => {
     if (!canShow && isOpen) {
       setIsOpen(false);
     }
   }, [canShow, isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    // Сохраняем информацию, что пользователь видел окно
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  };

  // Не показываем до завершения гидрации
  if (!isHydrated) return null;
   // Не показываем для неавторизованных
   if (!canShow) return null;

  return (
    <PopUpWrapper 
      isOpen={isOpen} 
      onClose={handleClose}
      width="min(92vw, 420px)"
      hideCloseButton={true}
      overlayClassName={styles.popupOverlay}
      contentClassName={styles.popupContent}
    >
      <div className={styles.feedbackModal}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <MessageCircle size={20} strokeWidth={1.8} />
          </div>
          <h2 className={styles.title}>
            Мы работаем над улучшением
          </h2>
        </div>

        <div className={styles.content}>
          <p className={styles.text}>
            Мы работаем над улучшением приложения, и ваше мнение очень важно для нас.
          </p>
          <p className={styles.text}>
            Вы можете поделиться своими идеями и пожеланиями — по дизайну, новому функционалу или любым другим улучшениям.
          </p>
        </div>

        <div className={styles.linkSection}>
          <a 
            href="https://t.me/graphon_support_bot" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.feedbackLink}
          >
            @graphon_support_bot
          </a>
        </div>

        <div className={styles.footer}>
          <button 
            className={styles.closeButton}
            onClick={handleClose}
          >
            Понятно
          </button>
        </div>
      </div>
    </PopUpWrapper>
  );
};

export default FeedbackModal;


