'use client'

import React from 'react'
import Link from 'next/link'
import styles from './NotFound.module.scss'

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.errorCode}>
        404
      </div>
      <div className={styles.errorMessage}>
        🪐 Страница затерялась в планетарной системе.<br/>
        Возможно, это был Плутон.<br/>
        <span style={{ fontSize: '16px', opacity: 0.7, marginTop: '8px', display: 'block' }}>
          Попробуйте поискать её среди звёзд ✨
        </span>
      </div>
      <div className={styles.buttonsContainer}>
        <Link
          href="/"
          className={styles.backButton}
        >
          🏠 Вернуться на главную
        </Link>
        <Link
          href="/graphs"
          className={styles.sitemapButton}
        >
          🗺️ Карта сайта
        </Link>
      </div>
    </div>
  )
}
