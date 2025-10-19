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
  const [isAnimating, setIsAnimating] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef<number>(0)
  const startYRef = useRef<number>(0)
  const currentXRef = useRef<number>(0)
  const currentYRef = useRef<number>(0)
  const isDraggingRef = useRef<boolean>(false)
  const isContentSwipeRef = useRef<boolean>(false)

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

  // Обработчики касаний для drawer (когда drawer открыт)
  const handleDrawerTouchStart = (e: React.TouchEvent) => {
    if (isOpen && e.touches[0].clientX < 50) {
      startXRef.current = e.touches[0].clientX
      startYRef.current = e.touches[0].clientY
      currentXRef.current = e.touches[0].clientX
      currentYRef.current = e.touches[0].clientY
      isDraggingRef.current = true
      isContentSwipeRef.current = false
    }
  }

  const handleDrawerTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || !isOpen) return

    currentXRef.current = e.touches[0].clientX
    currentYRef.current = e.touches[0].clientY
    const deltaX = currentXRef.current - startXRef.current

    if (deltaX > 0 && deltaX < 300) {
      if (drawerRef.current) {
        drawerRef.current.style.transform = `translateX(${Math.min(deltaX - 300, 0)}px)`
      }
    }
  }

  const handleDrawerTouchEnd = () => {
    if (!isDraggingRef.current || !isOpen) return

    const deltaX = currentXRef.current - startXRef.current
    isDraggingRef.current = false

    if (drawerRef.current) {
      drawerRef.current.style.transform = ''
    }

    if (deltaX > 100) {
      openDrawer()
    } else {
      closeDrawer()
    }
  }

  // Обработчики свайпа по основному контенту (для открытия с нуля)
  const handleContentTouchStart = (e: React.TouchEvent) => {
    if (isOpen) return
    
    startXRef.current = e.touches[0].clientX
    startYRef.current = e.touches[0].clientY
    currentXRef.current = e.touches[0].clientX
    currentYRef.current = e.touches[0].clientY
    isContentSwipeRef.current = true
  }

  const handleContentTouchMove = (e: React.TouchEvent) => {
    if (isOpen || !isContentSwipeRef.current) return

    currentXRef.current = e.touches[0].clientX
    currentYRef.current = e.touches[0].clientY
    
    const deltaX = currentXRef.current - startXRef.current
    const deltaY = currentYRef.current - startYRef.current
    
    // Проверяем, что это горизонтальный свайп, а не вертикальный
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      // Это вертикальный свайп, отменяем
      isContentSwipeRef.current = false
      return
    }

    // Если свайп слева направо и достаточно длинный
    if (deltaX > 20 && !isDraggingRef.current) {
      isDraggingRef.current = true
      setIsDragging(true)
      
      // Визуальная обратная связь - показываем drawer частично
      if (drawerRef.current && deltaX > 0 && deltaX < 300) {
        drawerRef.current.style.transform = `translateX(${Math.min(deltaX - 300, 0)}px)`
      }
    } else if (isDraggingRef.current && drawerRef.current && deltaX > 0 && deltaX < 300) {
      // Продолжаем обновлять позицию во время драга
      drawerRef.current.style.transform = `translateX(${Math.min(deltaX - 300, 0)}px)`
    }
  }

  const handleContentTouchEnd = () => {
    if (isOpen) return

    const deltaX = currentXRef.current - startXRef.current
    const deltaY = currentYRef.current - startYRef.current
    
    setIsDragging(false)
    
    // Сбрасываем transform
    if (drawerRef.current) {
      drawerRef.current.style.transform = ''
    }

    // Проверяем, что это горизонтальный свайп
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      isDraggingRef.current = false
      isContentSwipeRef.current = false
      return
    }

    // Открываем drawer если свайп достаточно длинный (слева направо)
    if (isDraggingRef.current && deltaX > 80) {
      openDrawer()
    }
    
    isDraggingRef.current = false
    isContentSwipeRef.current = false
  }

  const openDrawer = () => {
    setIsAnimating(true)
    setIsOpen(true)
    setMobileNavOpen(true)
    
    // Блокируем скролл body
    document.body.style.overflow = 'hidden'
    
    setTimeout(() => {
      setIsAnimating(false)
    }, 300)
  }

  const closeDrawer = () => {
    setIsAnimating(true)
    setIsOpen(false)
    setMobileNavOpen(false)
    
    // Разблокируем скролл body
    document.body.style.overflow = ''
    
    setTimeout(() => {
      setIsAnimating(false)
    }, 300)
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
          className={`${styles.overlay} ${isAnimating ? styles.animating : ''}`}
          onClick={handleOverlayClick}
        />
      )}

      {/* Drawer */}
      <div 
        ref={drawerRef}
        className={`${styles.drawer} ${isOpen ? styles.open : ''} ${isAnimating ? styles.animating : ''} ${isDragging ? styles.dragging : ''}`}
        onTouchStart={handleDrawerTouchStart}
        onTouchMove={handleDrawerTouchMove}
        onTouchEnd={handleDrawerTouchEnd}
      >
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
        onTouchMove={handleContentTouchMove}
        onTouchEnd={handleContentTouchEnd}
      >
        {children}
      </div>
    </>
  )
}

export default MobileDrawer
