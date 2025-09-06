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

export default function ManagePage() {
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const anyUser: any = user as any;
    const managedIds: string[] = Array.isArray(anyUser?.managed_graph_id) ? anyUser.managed_graph_id : (Array.isArray(anyUser?.managedGraphIds) ? anyUser.managedGraphIds : []);
    const graphId = searchParams.get('id') || managedIds[0];

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
        enabled: Boolean(graphId),
        staleTime: 30_000,
    });

    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    if (!graphId) return <div style={{ padding: 16 }}>Не найден доступный граф для управления</div>;
    if (isLoading) return <SpinnerLoader/>;
    if (isError || !data) return (
        <div style={{ padding: 16 }}>
            <p>Ошибка загрузки данных графа</p>
            <button onClick={() => refetch()}>Повторить</button>
        </div>
    );

    const renderList = (events: EventItem[] | undefined) => {
        if (!events || events.length === 0) {
            return <div style={{ opacity: 0.8 }}>Нет мероприятий</div>;
        }
        return (
            <div style={{ display: 'grid', gap: 12 }}>
                {events.map((ev: EventItem) => (
                    <EventCard key={ev._id} event={ev as any} isAttended={ev.isAttended} />
                ))}
            </div>
        );
    };

    return (
        <div style={{ padding: 16 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Управление графом</h1>
            <div style={{
                border: '1px solid rgba(150,130,238,0.25)',
                borderRadius: 12,
                padding: 16,
                background: 'var(--block-color)'
            }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Название</div>
                <div style={{ marginBottom: 16 }}>{data.name}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Подписки</div>
                <div>{data.subsNum}</div>
            </div>

            {/* Переключатели списков */}
            <div style={{ display: 'flex', gap: 8, marginTop: 20, marginBottom: 12 }}>
                <button
                    onClick={() => setActiveTab('upcoming')}
                    style={{
                        padding: '8px 12px',
                        borderRadius: 10,
                        border: '1px solid rgba(150,130,238,0.3)',
                        background: activeTab === 'upcoming' ? 'rgb(var(--main-Color))' : 'transparent',
                        color: activeTab === 'upcoming' ? '#fff' : 'var(--main-text)',
                        cursor: 'pointer'
                    }}
                >
                    Текущие
                </button>
                <button
                    onClick={() => setActiveTab('past')}
                    style={{
                        padding: '8px 12px',
                        borderRadius: 10,
                        border: '1px solid rgba(150,130,238,0.3)',
                        background: activeTab === 'past' ? 'rgb(var(--main-Color))' : 'transparent',
                        color: activeTab === 'past' ? '#fff' : 'var(--main-text)',
                        cursor: 'pointer'
                    }}
                >
                    Прошедшие
                </button>
                <div style={{ marginLeft: 'auto' }}>
                    {activeTab === 'upcoming' ? (
                        <button onClick={() => refetchUpcoming()} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(150,130,238,0.3)', background: 'transparent', cursor: 'pointer' }}>Обновить</button>
                    ) : (
                        <button onClick={() => refetchPast()} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(150,130,238,0.3)', background: 'transparent', cursor: 'pointer' }}>Обновить</button>
                    )}
                </div>
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


