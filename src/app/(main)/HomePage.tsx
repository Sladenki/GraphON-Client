'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/providers/AuthProvider'
import styles from './HomePage.module.scss'

interface HomeBlockProps {
  title: string
  description: string
  href: string
  icon: string
  color: string
}

const HomeBlock: React.FC<HomeBlockProps> = ({ title, description, href, icon, color }) => (
  <Link href={href} className={styles.block} style={{ '--block-color': color } as React.CSSProperties}>
    <div className={styles.icon}>{icon}</div>
    <div className={styles.content}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </div>
    <div className={styles.arrow}>→</div>
  </Link>
)

export default function HomePage() {
  const { user } = useAuth()
  const isAuthenticated = !!user

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.mainTitle}>Добро пожаловать в GraphON</h1>
        <p className={styles.subtitle}>Исследуйте мир знаний вашего университета</p>
      </div>

      <div className={styles.blocksGrid}>
        {/* Основные блоки для всех пользователей */}
        <HomeBlock
          title="Группы"
          description="Посмотри какие группы есть в твоём вузе"
          href="/groups"
          icon="👥"
          color="var(--main-Color)"
        />

        <HomeBlock
          title="События"
          description="Узнай о предстоящих мероприятиях и событиях"
          href="/events"
          icon="📅"
          color="var(--main-Color)"
        />

        <HomeBlock
          title="Графы"
          description="Изучи структуру знаний в 3D визуализации"
          href="/graphs"
          icon="🌐"
          color="var(--main-Color)"
        />

        {/* Блоки только для авторизованных пользователей */}
        {isAuthenticated && (
          <>
            <HomeBlock
              title="Подписки"
              description="Твои подписанные группы и уведомления"
              href="/subs"
              icon="🔔"
              color="var(--main-Color)"
            />

            <HomeBlock
              title="Профиль"
              description="Управляй своим профилем и настройками"
              href="/profile"
              icon="👤"
              color="var(--main-Color)"
            />
          </>
        )}
      </div>

      {/* Дополнительная информация */}
      <div className={styles.footer}>
        <p className={styles.footerText}>
          {isAuthenticated 
            ? `Привет, ${user?.name || 'Пользователь'}! Готов исследовать?`
            : 'Войди в систему, чтобы получить полный доступ ко всем функциям'
          }
        </p>
      </div>
    </div>
  )
}
