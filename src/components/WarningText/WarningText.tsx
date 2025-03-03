import React, { FC } from 'react'
import styles from './WarninText.module.scss'

export const WarningText: FC<{ text: string}> = ({ text }) => {
  return (
    <div className={styles.WarningText}>
        ⚠️ {text}
    </div>
  )
}
