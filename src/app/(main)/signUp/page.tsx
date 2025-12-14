'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, Briefcase, BookOpen, Check, ArrowRight } from 'lucide-react'
import styles from './signUp.module.scss'
import { Logo } from '@/components/global/Logo'
import { GraphService } from '@/services/graph.service'
import { useQuery } from '@tanstack/react-query'
import { IGraphList } from '@/types/graph.interface'
import { NON_STUDENT_DEFAULT_GRAPH_ID } from '@/constants/nonStudentDefaults'
import { notifyError, notifySuccess } from '@/lib/notifications'

export default function SignUp() {
  const router = useRouter()
  const [isStudent, setIsStudent] = useState<boolean | null>(null)
  const [selectedGraphId, setSelectedGraphId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Загружаем список глобальных графов (университетов)
  const { data: globalGraphsResp, isLoading: isLoadingGraphs } = useQuery<{ data: IGraphList[] }>({
    queryKey: ['graph/getGlobalGraphs'],
    queryFn: () => GraphService.getGlobalGraphs(),
    enabled: isStudent === true, // Загружаем только если выбран статус студента
  })

  const globalGraphs = globalGraphsResp?.data || []

  // Если не студент, автоматически выбираем дефолтный граф
  useEffect(() => {
    if (isStudent === false) {
      setSelectedGraphId(NON_STUDENT_DEFAULT_GRAPH_ID)
    } else if (isStudent === true) {
      setSelectedGraphId('')
    }
  }, [isStudent])

  const handleRegister = async () => {
    if (isStudent === null) {
      notifyError('Выберите статус', 'Укажите, являетесь ли вы студентом')
      return
    }

    if (isStudent === true && !selectedGraphId) {
      notifyError('Выберите университет', 'Необходимо выбрать университет для студентов')
      return
    }

    setIsSubmitting(true)

    try {
      // Сохраняем выбор в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('isStudent', String(isStudent))
        localStorage.setItem('selectedGraphId', selectedGraphId)
      }

      // Регистрируем пользователя через dev-auth API
      const response = await fetch('/api/dev-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'user',
          isStudent,
          selectedGraphId,
          universityGraphId: isStudent ? selectedGraphId : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to register')
      }

      const data = await response.json()

      // Сохраняем токен и данные
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('userId', data.user._id)
        localStorage.setItem('selectedGraphId', selectedGraphId)
        localStorage.setItem('isStudent', String(isStudent))
      }

      notifySuccess('Регистрация успешна', 'Добро пожаловать!')

      // Перенаправляем на главную и обновляем страницу для применения изменений
      setTimeout(() => {
        window.location.href = '/events'
      }, 500)
    } catch (error) {
      console.error('Registration error:', error)
      notifyError(
        'Ошибка регистрации',
        error instanceof Error ? error.message : 'Не удалось зарегистрироваться'
      )
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className={styles.signUpPage}>
      <div className={styles.container}>
        {/* Заголовок */}
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <Logo width={180} height={28} clickable={false} />
          </div>
          <h1 className={styles.title}>Регистрация</h1>
          <p className={styles.subtitle}>
            Выберите ваш статус и настройте профиль
          </p>
        </div>

        {/* Выбор статуса студента */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Вы студент?</h2>
          <div className={styles.statusOptions}>
            <button
              className={`${styles.statusCard} ${isStudent === true ? styles.selected : ''}`}
              onClick={() => setIsStudent(true)}
              type="button"
              disabled={isSubmitting}
            >
              <div className={styles.statusIcon}>
                <GraduationCap size={32} />
              </div>
              <h3 className={styles.statusTitle}>Да, я студент</h3>
              <p className={styles.statusDescription}>
                Мне нужен доступ к учебным группам и расписанию
              </p>
              {isStudent === true && (
                <div className={styles.checkIcon}>
                  <Check size={20} />
                </div>
              )}
            </button>

            <button
              className={`${styles.statusCard} ${isStudent === false ? styles.selected : ''}`}
              onClick={() => setIsStudent(false)}
              type="button"
              disabled={isSubmitting}
            >
              <div className={styles.statusIcon}>
                <Briefcase size={32} />
              </div>
              <h3 className={styles.statusTitle}>Нет, я не студент</h3>
              <p className={styles.statusDescription}>
                Мне интересны только мероприятия и события
              </p>
              {isStudent === false && (
                <div className={styles.checkIcon}>
                  <Check size={20} />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Выбор графа */}
        {isStudent !== null && (
          <div className={styles.section}>
            {isStudent ? (
              <>
                <h2 className={styles.sectionTitle}>Выберите ваш университет</h2>
                {isLoadingGraphs ? (
                  <div className={styles.loading}>Загрузка университетов...</div>
                ) : globalGraphs.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>Университеты не найдены</p>
                  </div>
                ) : (
                  <div className={styles.graphsList}>
                    {globalGraphs.map((graph) => (
                      <button
                        key={graph._id}
                        className={`${styles.graphCard} ${
                          selectedGraphId === graph._id ? styles.selected : ''
                        }`}
                        onClick={() => setSelectedGraphId(graph._id)}
                        type="button"
                        disabled={isSubmitting}
                      >
                        <div className={styles.graphIcon}>
                          <BookOpen size={24} />
                        </div>
                        <div className={styles.graphContent}>
                          <h3 className={styles.graphName}>{graph.name}</h3>
                          {graph.about && (
                            <p className={styles.graphDescription}>{graph.about}</p>
                          )}
                        </div>
                        {selectedGraphId === graph._id && (
                          <div className={styles.checkIcon}>
                            <Check size={20} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className={styles.sectionTitle}>Выбранный граф</h2>
                <div className={styles.selectedGraphInfo}>
                  <div className={styles.graphIcon}>
                    <BookOpen size={24} />
                  </div>
                  <div className={styles.graphContent}>
                    <h3 className={styles.graphName}>Общие события</h3>
                    <p className={styles.graphDescription}>
                      Доступ к общим мероприятиям и событиям
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Кнопка регистрации */}
        <button
          className={styles.registerButton}
          onClick={handleRegister}
          disabled={
            isSubmitting ||
            isStudent === null ||
            (isStudent === true && !selectedGraphId)
          }
        >
          {isSubmitting ? (
            <>
              <div className={styles.spinner}></div>
              <span>Регистрация...</span>
            </>
          ) : (
            <>
              <span>Зарегистрироваться</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Ссылка на вход */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Уже есть аккаунт?{' '}
            <Link href="/signIn" className={styles.link}>
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
