'use client';

import React from 'react';
import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  message: string;
  subMessage: string;
  emoji?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  subMessage,
  emoji = '📚',
  className = ''
}) => {
  return (
    <div className={`${styles.emptyState} ${className}`} data-emoji={emoji}>
      <div className={styles.mainText}>
        {message}
      </div>
      <div className={styles.subText}>
        {subMessage}
      </div>
    </div>
  );
}; 