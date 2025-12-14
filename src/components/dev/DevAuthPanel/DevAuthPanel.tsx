'use client'

import React, { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import styles from './DevAuthPanel.module.scss'
import { User, Shield, GraduationCap, Crown, LogIn } from 'lucide-react'

type DevUserRole = 'admin' | 'creator' | 'student' | 'user'

const ROLE_INFO: Record<DevUserRole, { label: string; icon: React.ReactNode; description: string }> = {
  admin: {
    label: 'Администратор',
    icon: <Shield size={20} />,
    description: 'Полный доступ ко всем функциям',
  },
  creator: {
    label: 'Создатель',
    icon: <Crown size={20} />,
    description: 'Может создавать графы и события',
  },
  student: {
    label: 'Студент',
    icon: <GraduationCap size={20} />,
    description: 'Обычный пользователь со статусом студента',
  },
  user: {
    label: 'Пользователь',
    icon: <User size={20} />,
    description: 'Обычный пользователь',
  },
}

export const DevAuthPanel: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<DevUserRole>('user')
  const { devLogin, isLoggedIn, user } = useAuth()

  const handleDevAuth = async (role: DevUserRole) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/dev-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to authenticate')
      }

      const data = await response.json()
      
      // Сохраняем токен и данные пользователя
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('userId', data.user._id)
      }

      // Используем существующую функцию devLogin для обновления состояния
      await devLogin()
      
      // Перенаправляем на главную
      window.location.href = '/events'
    } catch (error) {
      console.error('Dev auth error:', error)
      alert(error instanceof Error ? error.message : 'Ошибка авторизации')
    } finally {
      setIsLoading(false)
    }
  }

  // Не показываем панель, если уже авторизован
  if (isLoggedIn && user) {
    return (
      <div className={styles.panel}>
        <div className={styles.info}>
          <p>Вы авторизованы как: <strong>{user.firstName} {user.lastName}</strong></p>
          <p className={styles.role}>Роль: {user.role}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <LogIn size={20} />
          Локальная авторизация (Dev)
        </h3>
        <p className={styles.subtitle}>
          Выберите роль пользователя для тестирования
        </p>
      </div>

      <div className={styles.roles}>
        {(Object.keys(ROLE_INFO) as DevUserRole[]).map((role) => {
          const info = ROLE_INFO[role]
          const isSelected = selectedRole === role
          
          return (
            <button
              key={role}
              className={`${styles.roleButton} ${isSelected ? styles.selected : ''}`}
              onClick={() => setSelectedRole(role)}
              disabled={isLoading}
            >
              <div className={styles.roleIcon}>{info.icon}</div>
              <div className={styles.roleContent}>
                <div className={styles.roleLabel}>{info.label}</div>
                <div className={styles.roleDescription}>{info.description}</div>
              </div>
            </button>
          )
        })}
      </div>

      <button
        className={styles.loginButton}
        onClick={() => handleDevAuth(selectedRole)}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className={styles.spinner}></div>
            <span>Вход...</span>
          </>
        ) : (
          <>
            <LogIn size={18} />
            <span>Войти как {ROLE_INFO[selectedRole].label}</span>
          </>
        )}
      </button>

      <div className={styles.warning}>
        ⚠️ Эта панель доступна только в режиме разработки
      </div>
    </div>
  )
}
