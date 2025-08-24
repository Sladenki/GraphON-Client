import React from 'react';
import styles from './UserStats.module.scss';
import { useQuery } from '@tanstack/react-query';
import { AdminService } from '@/services/admin.service';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';

interface UserStatsData {
    totalUsers: number;
    usersKgtu: number;
    usersKbk: number;
    usersNoGraph: number;
}

export const UserStats: React.FC = () => {
    const { isPending, isError, data, error } = useQuery({
        queryKey: ['admin/user-stats'],
        queryFn: () => AdminService.getApplicationStats(),
    });

    if (isPending) return <SpinnerLoader />;
    if (isError) return <p>Ошибка: {error.message}</p>;
    if (!data) return <p>Нет данных</p>;

    const stats: UserStatsData = data;

    return (
        <div className={styles.statsContainer}>
            <div className={styles.statCard}>
                <h4>Всего пользователей</h4>
                <div className={styles.statValue}>{stats.totalUsers}</div>
            </div>
            <div className={styles.statCard}>
                <h4>Пользователи КГТУ</h4>
                <div className={styles.statValue}>{stats.usersKgtu}</div>
            </div>
            <div className={styles.statCard}>
                <h4>Пользователи КБК</h4>
                <div className={styles.statValue}>{stats.usersKbk}</div>
            </div>
            <div className={styles.statCard}>
                <h4>Пользователи без выбранного графа</h4>
                <div className={styles.statValue}>{stats.usersNoGraph}</div>
            </div>
        </div>
    );
}; 