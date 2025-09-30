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
        Возможно, это был Плутон.
      </div>
      <Link
        href="/"
        className={styles.backButton}
      >
        Вернуться на главную
      </Link>
    </div>
  )
}
