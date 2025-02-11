'use client'

import React, { useState } from 'react';

import styles from './LoginButton.module.scss'
import { Send } from 'lucide-react';

const LoginButton = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false); // Состояние для текста

  // Функция для начала процесса авторизации через Telegram
  const handleLogin = async () => {
      setIsLoading(true);

      // Указываем ссылку для перехода в Telegram-бота с кнопкой авторизации
      const telegramBotUrl = `https://t.me/graphon_klgtu_bot?start=auth`;  // Здесь будет ссылка на вашего бота с параметром

      // Перенаправление на Telegram-бота
      window.location.href = telegramBotUrl;

      setShowMessage(true);
  };

  return (
      <div className={styles.loginButtonWrapper}>
          {user ? (
              <div className={styles.userInfo}>
                  {/* @ts-expect-error */}
                  <img src={user.avaPath} alt={user.firstName} className={styles.userAvatar} />
                  {/* @ts-expect-error */}
                  <p className={styles.welcomeText}>Добро пожаловать, {user.firstName} {user.lastName}</p>
              </div>
          ) : (
            <>
                <button onClick={handleLogin} disabled={isLoading} className={styles.googleButton}>
                    <Send />
                    {isLoading ? "Загрузка..." : "Войти через Telegram"}
                </button>

                {showMessage && (
                    <p className={styles.authMessage}>
                        Нажмите кнопку <b>«Войти»</b> в Telegram-боте 
                    </p>
                )}
            </>
          )}
      </div>
  );
};

export default LoginButton;
        
        
        
        