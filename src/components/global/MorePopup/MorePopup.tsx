'use client'

import React, { useMemo, useEffect, useRef, useCallback, useState } from 'react'
import { FileText, HelpCircle, Users, Bell, Plus } from 'lucide-react'
import Link from 'next/link'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import { useScrollLock } from '../PopUpWrapper/useScrollLock'
import { createPortal } from 'react-dom'
import { Logo } from '../Logo/Logo'
import styles from './MorePopup.module.scss'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'

interface MorePopupProps {
  isOpen: boolean
  onClose: () => void
}

const MorePopup: React.FC<MorePopupProps> = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragTranslateY, setDragTranslateY] = useState(0)
  const [animateOpen, setAnimateOpen] = useState(false)
  const dragStartYRef = useRef<number | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { user } = useAuth()
  const isNotificationsActive = pathname === '/notifications' || pathname.startsWith('/notifications')
  const isProfileActive = pathname === '/profile' || pathname.startsWith('/profile')
  const isAdminActive = pathname === '/admin' || pathname.startsWith('/admin')

  // Блокируем скролл когда попап открыт
  useScrollLock(isOpen)

  // Монтируем компонент для Portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimateOpen(true)
        })
      })
    } else {
      setAnimateOpen(false)
    }
  }, [isOpen])

  // Карточки действий
  const actionCards = useMemo(() => {
    return [
      {
        id: 'groups',
        icon: <Users size={20} strokeWidth={1.8} />,
        title: 'Группы',
        path: '/groups',
        color: 'var(--main-Color)',
      },
    ]
  }, [])

  // Обработка драга
  const handlePointerDown = useCallback((clientY: number) => {
    setIsDragging(true)
    dragStartYRef.current = clientY
  }, [])

  const handlePointerMove = useCallback(
    (clientY: number) => {
      if (!isDragging || dragStartYRef.current == null) return
      const delta = clientY - dragStartYRef.current
      setDragTranslateY(Math.max(0, delta))
    },
    [isDragging]
  )

  const finishDrag = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    const shouldClose = dragTranslateY > 80
    setDragTranslateY(0)
    if (shouldClose) onClose()
  }, [isDragging, dragTranslateY, onClose])

  useEffect(() => {
    function onMove(e: TouchEvent | MouseEvent) {
      if (!isDragging) return
      if (e instanceof TouchEvent) {
        handlePointerMove(e.touches[0]?.clientY ?? 0)
      } else {
        handlePointerMove((e as MouseEvent).clientY)
      }
    }
    function onUp() {
      finishDrag()
    }
    if (isDragging) {
      window.addEventListener('touchmove', onMove, { passive: false } as any)
      window.addEventListener('mousemove', onMove)
      window.addEventListener('touchend', onUp)
      window.addEventListener('mouseup', onUp)
    }
    return () => {
      window.removeEventListener('touchmove', onMove as any)
      window.removeEventListener('mousemove', onMove as any)
      window.removeEventListener('touchend', onUp)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDragging, handlePointerMove, finishDrag])

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen || !mounted) return null

  const sheetStyle = {
    ...(isDragging && {
      transform: `translateY(${dragTranslateY}px)`,
    }),
  } as React.CSSProperties

  const content = (
    <div
      className={`${styles.overlay} ${animateOpen ? styles.overlayVisible : ''}`}
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        className={`${styles.sheet} ${animateOpen ? styles.sheetOpen : ''}`}
        style={sheetStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle для драга */}
        <div
          className={styles.sheetHandleArea}
          onMouseDown={(e) => handlePointerDown(e.clientY)}
          onTouchStart={(e) => handlePointerDown(e.touches[0]?.clientY ?? 0)}
        >
          <div className={styles.sheetHandle} />
        </div>

        {/* Верхний блок с брендингом */}
        <div className={styles.branding}>
          <Logo width={120} height={18} clickable={false} className={styles.logo} />
        </div>

        {/* Основной контент */}
        <div className={styles.content}>
          {/* Блок профиля и уведомлений */}
          <div className={styles.profileRow}>
            {/* Блок профиля */}
            <Link
              href="/profile"
              className={`${styles.profileLink} ${isProfileActive ? styles.profileLinkActive : ''}`}
              onClick={onClose}
            >
              <div className={styles.profileAvatar}>
                {user?.avaPath ? (
                  <img
                    src={user.avaPath.startsWith('http') ? user.avaPath : `${process.env.NEXT_PUBLIC_S3_URL}/${user.avaPath}`}
                    alt={user?.firstName || user?.lastName || 'User'}
                    className={styles.avatarImage}
                  />
                ) : (
                  <div className={styles.avatarFallback}>
                    {(user?.firstName?.[0] || user?.lastName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                  </div>
                )}
              </div>
              <span className={styles.profileText}>
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.firstName || user?.lastName || user?.username || 'Профиль'}
              </span>
            </Link>

            {/* Блок уведомлений (круглый) */}
            <Link
              href="/notifications"
              className={`${styles.notificationsButton} ${isNotificationsActive ? styles.notificationsButtonActive : ''}`}
              onClick={onClose}
            >
              <Bell size={18} strokeWidth={1.8} />
            </Link>
          </div>

          {/* Блок добавления события и группы (на одной строке) */}
          <div className={styles.actionsRow}>
            {/* Добавить событие */}
            <Link
              href="/admin"
              className={`${styles.addEventLink} ${isAdminActive ? styles.addEventLinkActive : ''}`}
              onClick={onClose}
            >
              <div className={styles.addEventIcon}>
                <Plus size={20} strokeWidth={1.8} />
              </div>
              <span className={styles.addEventText}>Создать \ предложить событие</span>
            </Link>

            {/* Группы */}
            {actionCards.length > 0 && (
              <Link
                href={actionCards[0].path}
                className={styles.actionCard}
                onClick={onClose}
              >
                <div className={styles.cardIcon} style={{ color: `rgb(${actionCards[0].color})` }}>
                  {actionCards[0].icon}
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{actionCards[0].title}</h3>
                </div>
              </Link>
            )}
          </div>

          {/* Блок настроек темы */}
          <div className={styles.themeSection}>
            <div className={styles.themeRow}>
              <span className={styles.themeLabel}>Тема</span>
              <ThemeToggle size="sm" />
            </div>
          </div>

          {/* Нижний блок с утилитарными пунктами */}
          <div className={styles.utilitySection}>
            <Link href="/help" className={styles.utilityLink} onClick={onClose}>
              <HelpCircle size={18} />
              <span>Помощь</span>
            </Link>
            <Link href="/docs" className={styles.utilityLink} onClick={onClose}>
              <FileText size={18} />
              <span>Документы</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

export default MorePopup
