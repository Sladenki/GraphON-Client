'use client'

import React, { useMemo, useEffect, useRef, useCallback, useState } from 'react'
import { FileText, HelpCircle, Shield, UserPlus } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { UserRole } from '@/types/user.interface'
import Link from 'next/link'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import { useScrollLock } from '../PopUpWrapper/useScrollLock'
import { createPortal } from 'react-dom'
import { Logo } from '../Logo/Logo'
import styles from './MorePopup.module.scss'

interface MorePopupProps {
  isOpen: boolean
  onClose: () => void
}

const MorePopup: React.FC<MorePopupProps> = ({ isOpen, onClose }) => {
  const { user, isLoggedIn } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragTranslateY, setDragTranslateY] = useState(0)
  const [animateOpen, setAnimateOpen] = useState(false)
  const dragStartYRef = useRef<number | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

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

  // Определяем доступ к админке
  const hasAdminAccess = isLoggedIn && user && user.role !== UserRole.User

  // Карточки действий
  const actionCards = useMemo(() => {
    const cards = []

    // Друзья (только для авторизованных)
    if (isLoggedIn) {
      cards.push({
        id: 'friends',
        icon: <UserPlus size={24} strokeWidth={1.8} />,
        title: 'Друзья',
        path: '/friends',
        color: 'var(--main-Color)',
      })
    }

    // Админка (только если есть доступ)
    if (hasAdminAccess) {
      cards.push({
        id: 'admin',
        icon: <Shield size={24} strokeWidth={1.8} />,
        title: 'Админка',
        path: '/admin/',
        color: 'var(--main-Color)',
      })
    }

    return cards
  }, [hasAdminAccess])

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
          {/* Карточки действий */}
          {actionCards.length > 0 && (
            <div className={styles.cardsSection}>
              {actionCards.map((card) => (
                <Link
                  key={card.id}
                  href={card.path}
                  className={styles.actionCard}
                  onClick={onClose}
                >
                  <div className={styles.cardIcon} style={{ color: `rgb(${card.color})` }}>
                    {card.icon}
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{card.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}

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
