'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { GraphService } from '@/services/graph.service';
import { EventService } from '@/services/event.service';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { GraphInfo } from '@/types/graph.interface';
import { EventItem } from '@/types/schedule.interface';
import { useState } from 'react';
import EventCard from '@/components/ui/EventCard/EventCard';
import { useAuth } from '@/providers/AuthProvider';
import styles from './Manage.module.scss';

export default function ManagePage() {
    const searchParams = useSearchParams();
    const { user, isLoggedIn } = useAuth();
    const anyUser: any = user as any;
    const managedIds: string[] = Array.isArray(anyUser?.managed_graph_id) ? anyUser.managed_graph_id : (Array.isArray(anyUser?.managedGraphIds) ? anyUser.managedGraphIds : []);
    const graphId = searchParams.get('id') || managedIds[0];

    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    const { data, isLoading, isError, refetch } = useQuery<GraphInfo>({
        queryKey: ['manageGraph', graphId],
        queryFn: ({ queryKey }) => GraphService.getGraphById(String(queryKey[1])),
        enabled: Boolean(graphId),
        staleTime: 60_000,
    });

    // Списки мероприятий по графу
    const { data: upcomingResp, isLoading: isLoadingUpcoming, isError: isErrorUpcoming, refetch: refetchUpcoming } = useQuery({
        queryKey: ['eventsByGraph', graphId],
        queryFn: () => EventService.getEventsByGraphId(String(graphId)),
        enabled: Boolean(graphId),
        staleTime: 30_000,
    });

    const { data: pastResp, isLoading: isLoadingPast, isError: isErrorPast, refetch: refetchPast } = useQuery({
        queryKey: ['pastEventsByGraph', graphId],
        queryFn: () => EventService.getPastEventsByGraphId(String(graphId)),
        enabled: Boolean(graphId && activeTab === 'past'),
        staleTime: 30_000,
    });

    if (!isLoggedIn) return null;
    if (!graphId) return <div className={styles.manageWrapper}>Не найден доступный граф для управления</div>;
    if (isLoading) return <SpinnerLoader/>;
    if (isError || !data) return (
        <div className={styles.manageWrapper}>
            <p>Ошибка загрузки данных графа</p>
            <button onClick={() => refetch()} className={styles.refreshButton}>Повторить</button>
        </div>
    );

    const renderList = (events: EventItem[] | undefined) => {
        if (!events || events.length === 0) {
            return <div className={styles.emptyState}>Нет мероприятий</div>;
        }
        return (
            <div className={styles.eventsListGrid}>
                {events.map((ev: EventItem) => (
                    <div key={ev._id} className={styles.cardItem}>
                        <EventCard event={ev as any} isAttended={ev.isAttended} disableRegistration={activeTab === 'past'} />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.manageWrapper}>
            <h1 className={styles.pageTitle}>Управление графом</h1>
            <div className={styles.headerCard}>
                <div className={styles.headerRow}>
                    <div>
                        <div className={styles.headerLabel}>Название</div>
                        <div className={styles.headerValue}>{data.name}</div>
                    </div>
                    <div>
                        <div className={styles.headerLabel}>Подписки</div>
                        <div className={styles.headerValue}>{data.subsNum}</div>
                    </div>
                </div>
            </div>

            {/* Переключатели списков */}
            <div className={styles.tabBar}>
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`${styles.tabButton} ${activeTab === 'upcoming' ? styles.tabButtonActive : ''}`}
                >
                    Текущие
                </button>
                <button
                    onClick={() => setActiveTab('past')}
                    className={`${styles.tabButton} ${activeTab === 'past' ? styles.tabButtonActive : ''}`}
                >
                    Прошедшие
                </button>
            </div>

            {/* Контент списка */}
            {activeTab === 'upcoming' ? (
                isLoadingUpcoming ? <SpinnerLoader/> : isErrorUpcoming ? (
                    <div>Ошибка загрузки. <button onClick={() => refetchUpcoming()}>Повторить</button></div>
                ) : (
                    renderList(upcomingResp?.data as EventItem[] | undefined)
                )
            ) : (
                isLoadingPast ? <SpinnerLoader/> : isErrorPast ? (
                    <div>Ошибка загрузки. <button onClick={() => refetchPast()}>Повторить</button></div>
                ) : (
                    renderList(pastResp?.data as EventItem[] | undefined)
                )
            )}
        </div>
    );
}


