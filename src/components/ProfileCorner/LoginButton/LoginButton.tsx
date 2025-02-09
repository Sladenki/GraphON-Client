'use client'

import React, { useState } from 'react';

import styles from './LoginButton.module.scss'
import { Send } from 'lucide-react';

const LoginButton = () => {
    const [isLoading, setIsLoading] = useState(false);
  
    const handleLogin = async () => {
      setIsLoading(true);
        
      // @ts-expect-error потом исправлю если получится
      if (window.Telegram?.WebApp) {
        // @ts-expect-error потом исправлю если получится
        window.Telegram.WebApp.openLink("https://graphon-client.onrender.com/signIn");
      } else {
        console.error("Ошибка: Telegram WebApp API недоступен.");
        setIsLoading(false);
      }
    };
  
    return (
      <button onClick={handleLogin} disabled={isLoading} className={styles.googleButton}>
        <Send />
        {isLoading ? "Загрузка..." : "Войти через Telegram"}
      </button>
    );
  };
  
  export default LoginButton;
        
        
        
        
