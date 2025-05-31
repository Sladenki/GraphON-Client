'use client'

import React, { useState, useEffect } from 'react';
import styles from './LoginButton.module.scss'
import { MessageCircle } from 'lucide-react';

interface User {
  avaPath?: string;
  firstName?: string;
  lastName?: string;
}

const LoginButton = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageTimer, setMessageTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (messageTimer) {
        clearTimeout(messageTimer);
      }
    };
  }, [messageTimer]);

  const handleLogin = async () => {
    setIsLoading(true);
    setShowMessage(true);

    // Очищаем предыдущий таймер, если он есть
    if (messageTimer) {
      clearTimeout(messageTimer);
    }

    // Устанавливаем новый таймер на 10 секунд
    const timer = setTimeout(() => {
      setShowMessage(false);
      setIsLoading(false);
    }, 10000);

    setMessageTimer(timer);

    const telegramBotUrl = `https://t.me/graphon_klgtu_bot?start=auth`;
    window.location.href = telegramBotUrl;
  };

  return (
    <div className={styles.loginButtonWrapper}>
      {user ? (
        <div className={styles.userInfo}>
          <img src={user.avaPath} alt={user.firstName || 'User avatar'} className={styles.userAvatar} />
          <div className={styles.userDetails}>
            <p className={styles.welcomeText}>Добро пожаловать,</p>
            <p className={styles.userName}>{user.firstName} {user.lastName}</p>
          </div>
        </div>
      ) : (
        <div className={styles.authContainer}>
          <button 
            onClick={handleLogin} 
            disabled={isLoading} 
            className={styles.telegramButton}
            aria-label="Войти через Telegram"
          >
            <MessageCircle className={styles.telegramIcon} />
            <span>{isLoading ? "Переход в Telegram..." : "Войти через Telegram"}</span>
          </button>

          {showMessage && (
            <div className={styles.authMessage}>
              <p>Нажмите кнопку <b>«Авторизоваться»</b> в Telegram-боте</p>
              <div className={styles.progressBar}>
                <div className={styles.progress}></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoginButton;
        
        
        
        