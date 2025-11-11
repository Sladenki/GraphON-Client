"use client";

import { useQuery } from '@tanstack/react-query';
import { AnalyticsService } from '@/services/analytics.service';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Users, TrendingUp, TrendingDown, Calendar, UserPlus } from "lucide-react";
import styles from './VisitorAnalytics.module.scss';

export function VisitorAnalytics() {
  // Получение общей статистики
  const { data: analytics, isLoading, isError, error } = useQuery({
    queryKey: ['analytics', 'overall'],
    queryFn: () => AnalyticsService.getOverallAnalytics(),
    refetchInterval: 60000, // Обновляем каждую минуту
  });

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <Spinner size="lg" color="secondary" />
        <p className={styles.loaderText}>Загрузка аналитики...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>Ошибка загрузки: {error?.message || 'Неизвестная ошибка'}</p>
      </div>
    );
  }

  if (!analytics) return null;

  const dauChange = analytics.dau.change;
  const isDauIncreasing = dauChange > 0;

  return (
    <div className={styles.analyticsContainer}>
      {/* Общая статистика - карточки */}
      <div className={styles.statsGrid}>
        {/* Всего пользователей */}
        <Card className={styles.statCard}>
          <CardBody className={styles.cardBody}>
            <div className={styles.statIcon}>
              <Users size={24} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Всего пользователей</p>
              <p className={styles.statValue}>{analytics.totalUsers.toLocaleString('ru-RU')}</p>
            </div>
          </CardBody>
        </Card>

        {/* Активные пользователи сегодня */}
        <Card className={styles.statCard}>
          <CardBody className={styles.cardBody}>
            <div className={styles.statIcon} data-type="dau">
              <Calendar size={24} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Активных за день</p>
              <div className={styles.statValueRow}>
                <p className={styles.statValue}>{analytics.dau.today.toLocaleString('ru-RU')}</p>
                <Chip
                  size="sm"
                  variant="flat"
                  color={isDauIncreasing ? "success" : "danger"}
                  startContent={isDauIncreasing ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  className={styles.changeChip}
                >
                  {isDauIncreasing ? '+' : ''}{dauChange.toFixed(1)}%
                </Chip>
              </div>
              <p className={styles.statSubtext}>Вчера: {analytics.dau.yesterday}</p>
            </div>
          </CardBody>
        </Card>

        {/* Активные за неделю */}
        <Card className={styles.statCard}>
          <CardBody className={styles.cardBody}>
            <div className={styles.statIcon} data-type="wau">
              <Calendar size={24} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Активных за неделю</p>
              <p className={styles.statValue}>{analytics.wau.toLocaleString('ru-RU')}</p>
            </div>
          </CardBody>
        </Card>

        {/* Активные за месяц */}
        <Card className={styles.statCard}>
          <CardBody className={styles.cardBody}>
            <div className={styles.statIcon} data-type="mau">
              <Calendar size={24} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Активных за месяц</p>
              <p className={styles.statValue}>{analytics.mau.toLocaleString('ru-RU')}</p>
            </div>
          </CardBody>
        </Card>

        {/* Новые пользователи */}
        <Card className={styles.statCard}>
          <CardBody className={styles.cardBody}>
            <div className={styles.statIcon} data-type="new">
              <UserPlus size={24} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Новых сегодня</p>
              <p className={styles.statValue}>{analytics.newUsersToday.toLocaleString('ru-RU')}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Divider className={styles.divider} />

      {/* Подробная информация */}
      <div className={styles.detailsSection}>
        <h3 className={styles.sectionTitle}>Метрики активности</h3>
        
        <div className={styles.metricsGrid}>
          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Удержание:</span>
            <span className={styles.metricValue}>
              {((analytics.dau.today / analytics.totalUsers) * 100).toFixed(1)}%
            </span>
          </div>

          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Вовлеченность (неделя):</span>
            <span className={styles.metricValue}>
              {((analytics.wau / analytics.totalUsers) * 100).toFixed(1)}%
            </span>
          </div>

          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Вовлеченность (месяц):</span>
            <span className={styles.metricValue}>
              {((analytics.mau / analytics.totalUsers) * 100).toFixed(1)}%
            </span>
          </div>

          <div className={styles.metricItem}>
            <span className={styles.metricLabel}>Прирост пользователей:</span>
            <span className={styles.metricValue}>
              {((analytics.newUsersToday / analytics.totalUsers) * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

