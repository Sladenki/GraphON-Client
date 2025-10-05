'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Menu } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { UserRole } from '@/types/user.interface'
import { sidebarMobile } from '@/constants/sidebar'
import { Settings } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import Link from 'next/link'
import Image from 'next/image'
import LogoLightMode from '../../../../public/logo_lightMode.svg'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import styles from './MobileDrawer.module.scss'

interface MobileDrawerProps {
  children: React.ReactNode
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef<number>(0)
  const currentXRef = useRef<number>(0)
  const isDraggingRef = useRef<boolean>(false)

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
    // Исключаем ненужные элементы из мобильного меню
    const excludedPaths = ['/groups/', '/events/', '/schedule/', '/admin/']
    
    const items = sidebarMobile.filter(({ path }) => !excludedPaths.includes(path))
    
    if (hasManageAccess) {
      const manageItem = {
        id: 98,
        icon: <Settings color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />,
        title: 'Управление',
        forAuthUsers: true,
        path: '/manage/'
      }
      items.splice(2, 0, manageItem) // Вставляем перед "Создать"
    }
    return items
  })()

  // Обработчики касаний
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0].clientX < 50) { // Только если касание в левой части экрана
      startXRef.current = e.touches[0].clientX
      currentXRef.current = e.touches[0].clientX
      isDraggingRef.current = true
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return

    currentXRef.current = e.touches[0].clientX
    const deltaX = currentXRef.current - startXRef.current

    if (deltaX > 0 && deltaX < 300) {
      // Обновляем позицию drawer
      if (drawerRef.current) {
        drawerRef.current.style.transform = `translateX(${Math.min(deltaX - 300, 0)}px)`
      }
    }
  }

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return

    const deltaX = currentXRef.current - startXRef.current
    isDraggingRef.current = false

    if (deltaX > 100) {
      // Открываем drawer
      openDrawer()
    } else {
      // Закрываем drawer
      closeDrawer()
    }
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
        className={`${styles.drawer} ${isOpen ? styles.open : ''} ${isAnimating ? styles.animating : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Заголовок */}
        <div className={styles.header}>
          <div className={styles.title}>
            <Image 
              src={LogoLightMode} 
              alt="GraphON" 
              width={120}
              height={40}
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
          {isLoggedIn ? (
            <div className={styles.themeToggleContainer}>
              <ThemeToggle size="sm" />
            </div>
          ) : (
            <Link href="/signIn" className={styles.signInLink}>
              Войти в аккаунт
            </Link>
          )}
        </div>
      </div>

      {/* Основной контент */}
      <div className={styles.content}>
        {children}
      </div>
    </>
  )
}

export default MobileDrawer
