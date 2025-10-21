'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Menu } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { UserRole } from '@/types/user.interface'
import { mobileDrawerItems } from '@/constants/sidebar'
import { Settings } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import Link from 'next/link'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import { Logo } from '../Logo'
import styles from './MobileDrawer.module.scss'

interface MobileDrawerProps {
  children: React.ReactNode
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef<number>(0)
  const startYRef = useRef<number>(0)

  const { user, isLoggedIn } = useAuth()
  const { isMobileNavOpen, setMobileNavOpen } = useUIStore()

  // Определяем доступ к управлению
  const hasManageAccess = (() => {
    if (!user) return false
    const anyUser: any = user as any
    const managedIds = anyUser?.managed_graph_id ?? anyUser?.managedGraphIds ?? []
    return Array.isArray(managedIds) && managedIds.length > 0
  })()

  // Создаем мобильное меню с учетом доступа к управлению
  const mobileMenuItems = (() => {
    const items = [...mobileDrawerItems]
    
    if (hasManageAccess) {
      const manageItem = {
        id: 98,
        icon: <Settings color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />,
        title: 'Управление',
        forAuthUsers: true,
        path: '/manage/'
      }
      items.splice(4, 0, manageItem) // Вставляем перед "Графы"
    }
    return items
  })()

  // Упрощенные обработчики свайпа (только для открытия с края экрана)
  const handleContentTouchStart = (e: React.TouchEvent) => {
    if (isOpen) return
    
    const touch = e.touches[0]
    // Только если свайп начался с левого края экрана (первые 30px)
    if (touch.clientX < 30) {
      startXRef.current = touch.clientX
      startYRef.current = touch.clientY
    }
  }

  const handleContentTouchEnd = (e: React.TouchEvent) => {
    if (isOpen) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - startXRef.current
    const deltaY = touch.clientY - startYRef.current
    
    // Проверяем, что это горизонтальный свайп слева направо
    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 50) {
      openDrawer()
    }
    
    // Сбрасываем значения
    startXRef.current = 0
    startYRef.current = 0
  }

  const openDrawer = () => {
    setIsOpen(true)
    setMobileNavOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeDrawer = () => {
    setIsOpen(false)
    setMobileNavOpen(false)
    document.body.style.overflow = ''
  }

  // Обработчик клика по overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      closeDrawer()
    }
  }

  // Обработчик клавиши Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeDrawer()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Синхронизация с store
  useEffect(() => {
    if (isMobileNavOpen && !isOpen) {
      openDrawer()
    } else if (!isMobileNavOpen && isOpen) {
      closeDrawer()
    }
  }, [isMobileNavOpen])

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          ref={overlayRef}
          className={styles.overlay}
          onClick={handleOverlayClick}
        />
      )}

      {/* Drawer */}
      <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
        {/* Заголовок */}
        <div className={styles.header}>
          <div className={styles.title}>
            <Logo 
              width={120}
              height={40}
              clickable={false}
              className={styles.logo}
            />
          </div>
          <button 
            className={styles.closeButton}
            onClick={closeDrawer}
            aria-label="Закрыть меню"
          >
            <X size={24} />
          </button>
        </div>

        {/* Меню */}
        <nav className={styles.menu}>
          {mobileMenuItems.map((item) => {
            const shouldRender = !item.forAuthUsers || (item.forAuthUsers && isLoggedIn)
            
            // Скрываем "Мероприятия" для авторизованных пользователей (они видят их в BottomMenu)
            if (item.path === '/events/' && isLoggedIn) {
              return null
            }
            
            if (!shouldRender) return null

            return (
              <Link 
                key={item.id} 
                href={item.path}
                className={styles.menuItem}
                onClick={closeDrawer}
              >
                <div className={styles.iconWrapper}>
                  {item.icon}
                </div>
                <span className={styles.menuTitle}>{item.title}</span>
              </Link>
            )
          })}
        </nav>

        {/* Футер */}
        <div className={styles.footer}>
          <div className={styles.themeToggleContainer}>
            <ThemeToggle size="sm" />
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div 
        className={styles.content}
        onTouchStart={handleContentTouchStart}
        onTouchEnd={handleContentTouchEnd}
      >
        {children}
      </div>
    </>
  )
}

export default MobileDrawer
