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

    console.log(data);

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
                <h4>Всего графов</h4>
                <div className={styles.statValue}>{stats.totalGraphs}</div>
            </div>
            
            <div className={styles.statCard}>
                <h4>Пользователи по ролям</h4>
                <div className={styles.roleStats}>
                    <div className={styles.roleItem}>
                        <span>Пользователи:</span>
                        <span>{stats.usersByRole.user}</span>
                    </div>
                    <div className={styles.roleItem}>
                        <span>Администраторы:</span>
                        <span>{stats.usersByRole.admin}</span>
                    </div>
                    <div className={styles.roleItem}>
                        <span>Создатели:</span>
                        <span>{stats.usersByRole.create}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}; 