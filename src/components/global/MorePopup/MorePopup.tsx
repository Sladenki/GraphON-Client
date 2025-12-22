'use client'

import React, { useMemo } from 'react'
import { Heart, Settings, FileText, HelpCircle, Pencil, CalendarCheck2 } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useSelectedGraphId } from '@/stores/useUIStore'
import { UserRole } from '@/types/user.interface'
import Link from 'next/link'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import FooterPopUp from '../FooterPopUp/FooterPopUp'
import { useScrollLock } from '../PopUpWrapper/useScrollLock'
import styles from './MorePopup.module.scss'

interface MorePopupProps {
  isOpen: boolean
  onClose: () => void
}

const MorePopup: React.FC<MorePopupProps> = ({ isOpen, onClose }) => {
  const { user, isLoggedIn } = useAuth()
  const storeSelectedGraphId = useSelectedGraphId()

  // Блокируем скролл когда попап открыт
  useScrollLock(isOpen)

  // Определяем доступ к управлению
  const hasManageAccess = (() => {
    if (!user) return false
    const anyUser: any = user as any
    const managedIds = anyUser?.managed_graph_id ?? anyUser?.managedGraphIds ?? []
    return Array.isArray(managedIds) && managedIds.length > 0
  })()

  // Определяем доступ к админке
  const hasAdminAccess = user?.role !== UserRole.User

  // Пункты меню
  const menuItems = useMemo(() => {
    const items = []

    // Расписание (только для авторизованных)
    if (isLoggedIn) {
      items.push({
        id: 'schedule',
        icon: <CalendarCheck2 color="rgb(var(--main-Color))" size={20} strokeWidth={1.5} />,
        title: 'Расписание',
        path: '/schedule/',
        forAuthUsers: true,
      })
    }

    // Админка (только если есть доступ)
    if (hasAdminAccess) {
      items.push({
        id: 'admin',
        icon: <Pencil color="rgb(var(--main-Color))" size={20} strokeWidth={1.5} />,
        title: 'Админка',
        path: '/admin/',
        forAuthUsers: true,
      })
    }

    // Управление (только если есть доступ)
    if (hasManageAccess) {
      items.push({
        id: 'manage',
        icon: <Settings color="rgb(var(--main-Color))" size={20} strokeWidth={1.5} />,
        title: 'Управление',
        path: '/manage/',
        forAuthUsers: true,
      })
    }

    return items
  }, [isLoggedIn, hasManageAccess, hasAdminAccess])

  return (
    <FooterPopUp
      isOpen={isOpen}
      onClose={onClose}
      title="Еще"
      maxHeight="70vh"
    >
      <div className={styles.content}>
        {/* Меню */}
        <nav className={styles.menu}>
          {menuItems.map((item) => {
            const shouldRender = !item.forAuthUsers || (item.forAuthUsers && isLoggedIn)
            if (!shouldRender) return null

            return (
              <Link 
                key={item.id} 
                href={item.path}
                className={styles.menuItem}
                onClick={onClose}
              >
                <div className={styles.iconWrapper}>
                  {item.icon}
                </div>
                <span className={styles.menuTitle}>{item.title}</span>
              </Link>
            )
          })}
        </nav>

        {/* Разделитель */}
        <div className={styles.divider} />

        {/* Дополнительные опции */}
        <div className={styles.options}>
          <div className={styles.optionRow}>
            <ThemeToggle size="sm" />
          </div>

          {/* Вспомогательные действия - горизонтально */}
          <div className={styles.secondaryActions}>
            <Link href="/help" className={styles.secondaryLink} onClick={onClose}>
              <HelpCircle size={16} />
              <span>Помощь</span>
            </Link>

            <Link href="/docs" className={styles.secondaryLink} onClick={onClose}>
              <FileText size={16} />
              <span>Документы</span>
            </Link>
          </div>
        </div>
      </div>
    </FooterPopUp>
  )
}

export default MorePopup

