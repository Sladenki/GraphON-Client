'use client'

import React, { useMemo } from 'react'
import { MapPinned, X, FileText, HelpCircle } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { CITY_GRAPH_ID, CITY_ROUTE, GRAPHS_ROUTE, mobileDrawerItems } from '@/constants/sidebar'
import { Settings } from 'lucide-react'
import { useSelectedGraphId, useUIStore } from '@/stores/useUIStore'
import Link from 'next/link'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import { Logo } from '../Logo'
import { useMobileDrawerOptimization } from './useMobileDrawerOptimization'
import styles from './MobileDrawer.module.scss'

interface MobileDrawerProps {
  children: React.ReactNode
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ children }) => {
  const { user, isLoggedIn } = useAuth()
  const { isMobileNavOpen, setMobileNavOpen } = useUIStore()
  const storeSelectedGraphId = useSelectedGraphId()

  const normalizeGraphId = (raw: any): string | null => {
    if (!raw) return null
    if (typeof raw === 'string') return raw
    if (typeof raw === 'object') {
      return raw._id ?? raw.$oid ?? null
    }
    return null
  }

  const effectiveGraphId = storeSelectedGraphId || normalizeGraphId(user?.selectedGraphId)
  const isCityGraph = effectiveGraphId === CITY_GRAPH_ID;

  // Используем оптимизированный хук с состоянием из store
  const { handleOpenDrawer, handleCloseDrawer, handleBackdropClick } = 
    useMobileDrawerOptimization({ isOpen: isMobileNavOpen, setIsOpen: setMobileNavOpen })

  // Определяем доступ к управлению
  const hasManageAccess = (() => {
    if (!user) return false
    const anyUser: any = user as any
    const managedIds = anyUser?.managed_graph_id ?? anyUser?.managedGraphIds ?? []
    return Array.isArray(managedIds) && managedIds.length > 0
  })()

  const graphAwareItems = useMemo(() => {
    return mobileDrawerItems.map((item) => {
      if (item.path !== GRAPHS_ROUTE) return item
      return {
        ...item,
        title: isCityGraph ? 'Город' : 'Графы',
        path: isCityGraph ? CITY_ROUTE : GRAPHS_ROUTE,
        icon: isCityGraph
          ? <MapPinned color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />
          : item.icon,
      }
    })
  }, [isCityGraph])

  // Создаем мобильное меню с учетом доступа к управлению
  const mobileMenuItems = useMemo(() => {
    const items = [...graphAwareItems]
    
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
  }, [graphAwareItems, hasManageAccess])

  return (
    <>
      {/* Overlay */}
      {isMobileNavOpen && (
        <div 
          className={styles.overlay}
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div className={`${styles.drawer} ${isMobileNavOpen ? styles.open : ''}`}>
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
            onClick={handleCloseDrawer}
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
                onClick={handleCloseDrawer}
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
          <Link href="/help" className={styles.helpLink} onClick={handleCloseDrawer}>
            <HelpCircle size={15} />
            <span>Помощь</span>
          </Link>
          <Link href="/docs" className={styles.docsLink} onClick={handleCloseDrawer}>
            <FileText size={15} />
            <span>Документы</span>
          </Link>
        </div>
      </div>

      {/* Основной контент */}
      <div className={styles.content} data-swipe-enabled="true">
        {children}
      </div>
    </>
  )
}

export default MobileDrawer
