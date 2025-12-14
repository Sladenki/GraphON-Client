'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Shield, Zap, CheckCircle, Code } from 'lucide-react'
import styles from './signIn.module.scss'
import { Logo } from '@/components/global/Logo'
import { useAuth } from '@/providers/AuthProvider'

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isDevLoading, setIsDevLoading] = useState(false)
  const { devLogin } = useAuth()
  
  // Проверяем dev статус из переменной окружения
  // Кнопка показывается ТОЛЬКО если NEXT_PUBLIC_CLIENT_STATUS === 'dev'
  const clientStatus = process.env.NEXT_PUBLIC_CLIENT_STATUS
  const isDev = clientStatus === 'dev'
  
  // Отладочный вывод (можно убрать после проверки)
  if (typeof window !== 'undefined') {
    console.log('🔍 Dev login check:', {
      NEXT_PUBLIC_CLIENT_STATUS: clientStatus,
      isDev: isDev,
      willShowButton: isDev
    })
  }

  const ENV_CONFIG = {
    TELEGRAM_BOT_URL: process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || 'https://t.me/Graph_ON_bot',
  } as const; 

  const handleTelegramLogin = async () => {
    setIsLoading(true)
    try {
      const telegramBotUrl = `${ENV_CONFIG.TELEGRAM_BOT_URL}?start=auth`
      window.location.href = telegramBotUrl
    } catch (error) {
      console.error('Telegram login error:', error)
      setIsLoading(false)
    }
  }

  const handleDevLogin = async () => {
    setIsDevLoading(true)
    try {
      await devLogin()
      // После успешного входа перенаправляем на главную
      window.location.href = '/events'
    } catch (error) {
      console.error('Dev login error:', error)
    } finally {
      setIsDevLoading(false)
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
              <span>Смена планеты...</span>
            </>
          ) : (
            <>
              <span className={styles.buttonText}>Войти через Telegram</span>
            </>
          )}
        </button>

        {/* Кнопка локального входа для разработки */}
        {isDev && (
          <button
            onClick={handleDevLogin}
            className={`${styles.devButton} ${isDevLoading ? styles.loading : ''}`}
            disabled={isDevLoading}
          >
            {isDevLoading ? (
              <>
                <div className={styles.spinner}></div>
                <span>Вход...</span>
              </>
            ) : (
              <>
                <Code size={18} />
                <span className={styles.buttonText}>Войти локально (Dev)</span>
              </>
            )}
          </button>
        )}

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