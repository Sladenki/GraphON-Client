import React from 'react';
import styles from './UserStats.module.scss';
import { useQuery } from '@tanstack/react-query';
import { AdminService } from '@/services/admin.service';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';

interface UserStatsData {
    totalUsers: number;
    totalGraphs: number;
    usersByRole: {
        user: number;
        admin: number;
        create: number;
    };
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
        </div>
    );
}; 