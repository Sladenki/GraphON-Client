'use client'

import React, { useState } from 'react'
import { MessageCircle, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'
import styles from './signIn.module.scss'

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleTelegramLogin = async () => {
    setIsLoading(true)
    
    try {
      // Здесь будет логика авторизации через Telegram
      console.log('Telegram login initiated')
      
      // Симуляция загрузки
      setTimeout(() => {
        setIsLoading(false)
        // После успешной авторизации можно перенаправить пользователя
        // window.location.href = '/'
      }, 2000)
    } catch (error) {
      console.error('Telegram login error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.signInPage}>
      <div className={styles.container}>
        {/* Заголовок */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <Sparkles size={32} />
            <h1>GraphON</h1>
          </div>
          <p className={styles.subtitle}>
            Добро пожаловать!<br/>
            Войдите через Telegram для быстрого и безопасного доступа
          </p>
        </div>

        {/* Преимущества входа через Telegram */}
        <div className={styles.features}>
          <div className={styles.feature}>
            <Shield size={20} />
            <span>Безопасно</span>
          </div>
          <div className={styles.feature}>
            <Zap size={20} />
            <span>Быстро</span>
          </div>
          <div className={styles.feature}>
            <MessageCircle size={20} />
            <span>Просто</span>
          </div>
        </div>

        {/* Кнопка входа через Telegram */}
        <button
          onClick={handleTelegramLogin}
          className={`${styles.telegramButton} ${isLoading ? styles.loading : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className={styles.spinner}></div>
          ) : (
            <>
              <MessageCircle size={24} />
              <div className={styles.buttonContent}>
                <span className={styles.buttonTitle}>Войти через Telegram</span>
                <span className={styles.buttonSubtitle}>Быстро и безопасно</span>
              </div>
              <ArrowRight size={20} />
            </>
          )}
        </button>

        {/* Дополнительные ссылки */}
        <div className={styles.footer}>
          <p>
            <a href="/" className={styles.link}>
              ← Вернуться на главную
            </a>
          </p>
        </div>
      </div>

      {/* Декоративные элементы */}
      <div className={styles.decorations}>
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
        <div className={styles.circle3}></div>
      </div>
    </div>
  )
}

export default SignIn