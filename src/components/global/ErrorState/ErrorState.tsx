import React from 'react'
import styles from './ErrorState.module.scss'

interface ErrorStateProps {
  /**
   * Основное сообщение об ошибке
   */
  message?: string
  /**
   * Дополнительное пояснение (необязательно)
   */
  subMessage?: string
  /**
   * Эмодзи или иконка для отображения
   */
  emoji?: string
  /**
   * Текст кнопки повтора
   */
  retryButtonText?: string
  /**
   * Callback при нажатии на кнопку повтора
   */
  onRetry?: () => void
  /**
   * Показывать ли кнопку повтора
   */
  showRetryButton?: boolean
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Ошибка загрузки данных',
  subMessage,
  emoji = '⚠️',
  retryButtonText = 'Повторить',
  onRetry,
  showRetryButton = true,
}) => {
  return (
    <div className={styles.error}>
      <div className={styles.errorIcon}>{emoji}</div>
      <div className={styles.errorText}>{message}</div>
      {subMessage && (
        <div className={styles.errorSubText}>{subMessage}</div>
      )}
      {showRetryButton && onRetry && (
        <button 
          className={styles.retryButton} 
          onClick={onRetry}
        >
          {retryButtonText}
        </button>
      )}
    </div>
  )
}

