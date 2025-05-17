import React from 'react';
import styles from './ServerStats.module.scss';
import { useQuery } from '@tanstack/react-query';
import { AdminService } from '@/services/admin.service';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';

interface CPUUsage {
    model: string;
    speed: number;
    usage: string;
}

interface ServerStatsData {
    cpu: {
        model: string;
        cores: number;
        usage: CPUUsage[];
        averageUsage: string;
    };
    memory: {
        total: string;
        used: string;
        free: string;
        usagePercentage: string;
        processMemory: {
            heapUsed: string;
            heapTotal: string;
            heapUsagePercentage: string;
            rss: string;
            external: string;
        };
    };
    uptime: {
        seconds: number;
        formatted: string;
    };
    platform: {
        type: string;
        release: string;
        hostname: string;
    };
    systemLoad: {
        level: string;
        description: string;
        recommendations: string[];
    };
}

export const ServerStats: React.FC = () => {
    const { isPending, isError, data, error } = useQuery({
        queryKey: ['admin/server-stats'],
        queryFn: () => AdminService.getServerResourceStats(),
    });

    if (isPending) return <SpinnerLoader />;
    if (isError) return <p>Ошибка: {error.message}</p>;
    if (!data) return <p>Нет данных</p>;

    const stats: ServerStatsData = data;

    return (
        <div className={styles.statsContainer}>
            <div className={styles.statCard}>
                <h4>CPU</h4>
                <div className={styles.cpuInfo}>
                    <div className={styles.infoRow}>
                        <span>Модель:</span>
                        <span>{stats.cpu.model}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Ядер:</span>
                        <span>{stats.cpu.cores}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Средняя нагрузка:</span>
                        <span className={styles.usageValue}>{stats.cpu.averageUsage}</span>
                    </div>
                </div>
            </div>

            <div className={styles.statCard}>
                <h4>Память</h4>
                <div className={styles.memoryInfo}>
                    <div className={styles.infoRow}>
                        <span>Всего:</span>
                        <span>{stats.memory.total}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Использовано:</span>
                        <span>{stats.memory.used}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Свободно:</span>
                        <span>{stats.memory.free}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Использование:</span>
                        <span className={styles.usageValue}>{stats.memory.usagePercentage}</span>
                    </div>
                </div>
            </div>

            <div className={styles.statCard}>
                <h4>Процесс</h4>
                <div className={styles.processInfo}>
                    <div className={styles.infoRow}>
                        <span>Heap Used:</span>
                        <span>{stats.memory.processMemory.heapUsed}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Heap Total:</span>
                        <span>{stats.memory.processMemory.heapTotal}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Heap Usage:</span>
                        <span className={styles.usageValue}>{stats.memory.processMemory.heapUsagePercentage}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>RSS:</span>
                        <span>{stats.memory.processMemory.rss}</span>
                    </div>
                </div>
            </div>

            <div className={styles.statCard}>
                <h4>Система</h4>
                <div className={styles.systemInfo}>
                    <div className={styles.infoRow}>
                        <span>ОС:</span>
                        <span>{stats.platform.type} {stats.platform.release}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Хост:</span>
                        <span>{stats.platform.hostname}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Аптайм:</span>
                        <span>{stats.uptime.formatted}</span>
                    </div>
                </div>
            </div>

            <div className={`${styles.statCard} ${styles[stats.systemLoad.level]}`}>
                <h4>Нагрузка системы</h4>
                <div className={styles.loadInfo}>
                    <div className={styles.infoRow}>
                        <span>Уровень:</span>
                        <span>{stats.systemLoad.description}</span>
                    </div>
                    <div className={styles.recommendations}>
                        <h5>Рекомендации:</h5>
                        <ul>
                            {stats.systemLoad.recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}; 