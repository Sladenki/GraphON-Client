'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/analytics.service';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import styles from './AnalyticsStats.module.scss';

export const AnalyticsStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics/stats'],
    queryFn: () => AnalyticsService.getStats(),
    staleTime: 60000, // Кеш на 1 минуту
  });

  if (isLoading) {
    return (
      <div className={styles.loader}>
        <SpinnerLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        Ошибка при загрузке статистики
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statCard}>
        <div className={styles.statLabel}>Всего пользователей</div>
        <div className={styles.statValue}>{data.totalUsers.toLocaleString('ru-RU')}</div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statLabel}>Активных сегодня</div>
        <div className={styles.statValue}>{data.activeUsersToday.toLocaleString('ru-RU')}</div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statLabel}>Скачиваний</div>
        <div className={styles.statValue}>{data.downloads.toLocaleString('ru-RU')}</div>
      </div>
    </div>
  );
};

