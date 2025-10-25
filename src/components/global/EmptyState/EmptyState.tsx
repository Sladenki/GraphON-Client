'use client';

import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  message: string;
  subMessage: string;
  icon?: LucideIcon;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  subMessage,
  icon: Icon = Inbox,
  className = ''
}) => {
  return (
    <div className={`${styles.emptyState} ${className}`}>
      <div className={styles.iconWrapper}>
        <Icon className={styles.icon} />
      </div>
      <div className={styles.content}>
        <h3 className={styles.mainText}>
          {message}
        </h3>
        <p className={styles.subText}>
          {subMessage}
        </p>
      </div>
    </div>
  );
}; 