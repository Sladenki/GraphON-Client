import React from 'react'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import styles from './ErrorState.module.scss'

interface ErrorStateProps {
  message?: string
  subMessage?: string
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Ошибка загрузки данных',
  subMessage,
  onRetry,
}) => {
  return (
    <div className={styles.error}>
      <div className={styles.iconWrapper}>
        <AlertCircle className={styles.icon} />
      </div>
      
      <h3 className={styles.title}>{message}</h3>
      
      {subMessage && (
        <p className={styles.description}>{subMessage}</p>
      )}
      
      {onRetry && (
        <button 
          className={styles.retryButton} 
          onClick={onRetry}
        >
          <RefreshCcw className={styles.buttonIcon} />
          Повторить попытку
        </button>
      )}
    </div>
  )
}

