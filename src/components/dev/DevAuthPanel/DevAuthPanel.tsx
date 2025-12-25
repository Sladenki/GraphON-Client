'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import styles from './DevAuthPanel.module.scss'
import { User, Shield, GraduationCap, Crown, LogIn, Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { UserService } from '@/services/user.service'
import type { SocialUserListItem } from '@/types/social.interface'

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
  const { devLogin, devLoginAs, isLoggedIn, user } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 250)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SocialUserListItem[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [loginAsError, setLoginAsError] = useState<string | null>(null)

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

  useEffect(() => {
    const q = (debouncedQuery || '').trim()
    if (!q) {
      setSearchResults([])
      setSearchError(null)
      setIsSearching(false)
      return
    }

    let cancelled = false
    setIsSearching(true)
    setSearchError(null)

    UserService.searchUsers({ q, limit: 20 })
      .then((res) => {
        if (cancelled) return
        setSearchResults(res.items || [])
      })
      .catch((e: any) => {
        if (cancelled) return
        setSearchError(e?.response?.data?.message || e?.message || 'Ошибка поиска')
        setSearchResults([])
      })
      .finally(() => {
        if (cancelled) return
        setIsSearching(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  const handleLoginAsUser = async (u: SocialUserListItem) => {
    setIsLoading(true)
    setLoginAsError(null)
    try {
      await devLoginAs(u._id)
      window.location.href = '/events'
    } catch (e) {
      console.error(e)
      setLoginAsError(e instanceof Error ? e.message : 'Не удалось войти как пользователь')
    } finally {
      setIsLoading(false)
    }
  }

  const visibleResults = useMemo(() => searchResults.slice(0, 8), [searchResults])

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

      <div className={styles.divider} />

      <div className={styles.header}>
        <h3 className={styles.title}>
          <Search size={20} />
          Войти как пользователь из базы
        </h3>
        <p className={styles.subtitle}>
          Поиск по имени / фамилии / username и вход под выбранным пользователем (только dev)
        </p>
      </div>

      <div className={styles.searchBox}>
        <input
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Например: ivan или ivan petrov"
          disabled={isLoading}
        />
      </div>

      {loginAsError ? <div className={styles.searchError}>{loginAsError}</div> : null}
      {searchError ? <div className={styles.searchError}>{searchError}</div> : null}
      {isSearching ? <div className={styles.searchHint}>Поиск…</div> : null}

      {visibleResults.length > 0 ? (
        <div className={styles.results}>
          {visibleResults.map((u) => (
            <button
              key={u._id}
              className={styles.resultRow}
              onClick={() => handleLoginAsUser(u)}
              disabled={isLoading}
              type="button"
              title={`Войти как ${u.firstName} ${u.lastName} (@${u.username})`}
            >
              <div className={styles.resultMain}>
                <div className={styles.resultName}>
                  {u.firstName} {u.lastName}
                </div>
                <div className={styles.resultUser}>@{u.username}</div>
              </div>
              <div className={styles.resultAction}>Войти</div>
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.warning}>
        ⚠️ Эта панель доступна только в режиме разработки
      </div>
    </div>
  )
}
