'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Shield, Zap, CheckCircle } from 'lucide-react'
import styles from './signIn.module.scss'
import { Logo } from '@/components/global/Logo'

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
        {/* Заголовок с логотипом */}
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <Logo width={180} height={28} clickable={false} />
          </div>
          <h1 className={styles.title}>Добро пожаловать!</h1>
          <p className={styles.subtitle}>
            Войдите через Telegram, чтобы продолжить
          </p>
        </div>

        {/* Кнопка входа через Telegram */}
        <button
          onClick={handleTelegramLogin}
          className={`${styles.telegramButton} ${isLoading ? styles.loading : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className={styles.spinner}></div>
              <span>Подключение...</span>
            </>
          ) : (
            <>
              <span className={styles.buttonText}>Войти через Telegram</span>
            </>
          )}
        </button>

        {/* Преимущества */}
        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <Shield size={18} />
            </div>
            <span>Безопасная авторизация</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <Zap size={18} />
            </div>
            <span>Вход за пару секунд</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <CheckCircle size={18} />
            </div>
            <span>Никаких паролей</span>
          </div>
        </div>

        {/* Футер */}
        <div className={styles.footer}>
          <Link href="/events" className={styles.backLink}>
            Вернуться на главную
          </Link>
        </div>
      </div>

      {/* Декоративные элементы */}
      <div className={styles.decorations}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
      </div>
    </div>
  )
}

export default SignIn