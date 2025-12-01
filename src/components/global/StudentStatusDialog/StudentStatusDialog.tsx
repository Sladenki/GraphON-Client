'use client'

import React, { useEffect, useState } from 'react'
import PopUpWrapper from '../PopUpWrapper/PopUpWrapper'
import { UserService } from '@/services/user.service'
import { useAuth } from '@/providers/AuthProvider'
import { notifyError, notifySuccess } from '@/lib/notifications'
import { GraduationCap, Briefcase } from 'lucide-react'
import styles from './StudentStatusDialog.module.scss'
import { useSetSelectedGraphId } from '@/stores/useUIStore'
import { NON_STUDENT_DEFAULT_GRAPH_ID } from '@/constants/nonStudentDefaults'

interface StudentStatusDialogProps {
  isOpen: boolean
  onClose: () => void
  onStatusSelected?: (isStudent: boolean) => void
}

const StudentStatusDialog: React.FC<StudentStatusDialogProps> = ({ isOpen, onClose, onStatusSelected }) => {
  const { user, setUser } = useAuth()
  const setSelectedGraphId = useSetSelectedGraphId()
  const [selectedStatus, setSelectedStatus] = useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(null)
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handleSelect = (isStudent: boolean) => {
    setSelectedStatus(isStudent)
  }

  const handleSubmit = async () => {
    if (selectedStatus === null || isSubmitting) return

    setIsSubmitting(true)

    try {
      // Если пользователь авторизован - сохраняем на сервере
      if (user) {
        await UserService.updateProfile({ isStudent: selectedStatus })
        setUser({ ...user, isStudent: selectedStatus } as any)
        notifySuccess('Статус сохранен')
      } else {
        // Если неавторизован - сохраняем в localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('isStudent', String(selectedStatus))

          if (selectedStatus === false) {
            localStorage.setItem('selectedGraphId', NON_STUDENT_DEFAULT_GRAPH_ID)
            setSelectedGraphId(NON_STUDENT_DEFAULT_GRAPH_ID)
          } else {
            localStorage.removeItem('selectedGraphId')
            setSelectedGraphId(null)
          }
        }
      }

      // Вызываем callback для обновления состояния в layout
      if (onStatusSelected) {
        onStatusSelected(selectedStatus)
      }

      onClose()
    } catch (error) {
      console.error('Error updating student status:', error)
      notifyError('Не удалось сохранить статус', 'Попробуйте позже')
      setIsSubmitting(false)
    }
  }

  return (
    <PopUpWrapper 
      isOpen={isOpen} 
      onClose={() => {}} 
      width="500px"
      hideCloseButton={true}
      preventClose={true}
    >
      <div className={styles.container}>
        <h2 className={styles.title}>Вы студент?</h2>
        <p className={styles.subtitle}>
          Это поможет нам настроить платформу под ваши потребности
        </p>

        <div className={styles.options}>
          <button
            className={`${styles.optionCard} ${selectedStatus === true ? styles.selected : ''}`}
            onClick={() => handleSelect(true)}
            type="button"
            disabled={isSubmitting}
          >
            <div className={styles.optionIcon}>
              <GraduationCap size={32} />
            </div>
            <h3 className={styles.optionTitle}>Да, я студент</h3>
            <p className={styles.optionDescription}>
              Мне нужен доступ к учебным группам и расписанию
            </p>
            {selectedStatus === true && (
              <div className={styles.checkIcon}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M16.667 5L7.5 14.167 3.333 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </button>

          <button
            className={`${styles.optionCard} ${selectedStatus === false ? styles.selected : ''}`}
            onClick={() => handleSelect(false)}
            type="button"
            disabled={isSubmitting}
          >
            <div className={styles.optionIcon}>
              <Briefcase size={32} />
            </div>
            <h3 className={styles.optionTitle}>Нет, я не студент</h3>
            <p className={styles.optionDescription}>
              Мне интересны только мероприятия и события
            </p>
            {selectedStatus === false && (
              <div className={styles.checkIcon}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M16.667 5L7.5 14.167 3.333 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </button>
        </div>

        <button
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={selectedStatus === null || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className={styles.spinner} />
              <span>Сохранение...</span>
            </>
          ) : (
            'Продолжить'
          )}
        </button>
      </div>
    </PopUpWrapper>
  )
}

export default StudentStatusDialog

