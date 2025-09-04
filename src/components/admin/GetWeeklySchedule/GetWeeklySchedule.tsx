"use client";
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EventService } from '@/services/event.service';
import { notifyError } from '@/lib/notifications';
import { useAuth } from '@/providers/AuthProvider';
import { useSelectedGraphId as useStoreSelectedGraphId } from '@/stores/useUIStore';

export const GetWeeklySchedule = () => {
    const { user } = useAuth();
    const storeSelectedGraphId = useStoreSelectedGraphId();

    const normalizeId = (raw: any): string => {
        return raw && typeof raw === 'object'
            ? (raw._id ?? raw.$oid ?? '')
            : (raw ?? '');
    };
    const userSelectedGraphId = normalizeId(user?.selectedGraphId as any);
    const selectedGraphId: string = userSelectedGraphId || (storeSelectedGraphId || '');

    const { data: weeklyData, isFetching, isFetched, isError, error } = useQuery({
        queryKey: ['weekly-schedule', selectedGraphId],
        queryFn: async () => {
            if (!selectedGraphId) return [];
            const res = await EventService.getWeeklyScheduleByGlobalGraphId(selectedGraphId);
            const body = (res as any)?.data;
            // Универсальный разбор: [] | { data: [] } | { result: [] }
            if (Array.isArray(body)) return body;
            if (Array.isArray(body?.data)) return body.data;
            if (Array.isArray(body?.result)) return body.result;
            return [];
        },
        enabled: !!selectedGraphId,
        refetchOnMount: 'always',
        refetchOnWindowFocus: false
    });

    useEffect(() => {
        if (isError) {
            const message = (error as any)?.message || 'Попробуйте позже';
            notifyError('Ошибка получения расписания', message);
        }
    }, [isError, error]);

    const isDisabled = !selectedGraphId;

    const sortedData = useMemo(() => {
        // Сортируем графы по названию, а события — по дате и времени
        const source = Array.isArray(weeklyData) ? weeklyData : [];
        const clone = source.map((group: any) => ({
            ...group,
            events: [...(group.events || [])].sort((a: any, b: any) => {
                const da = new Date(a.eventDate).getTime();
                const db = new Date(b.eventDate).getTime();
                if (da !== db) return da - db;
                return (a.timeFrom || '').localeCompare(b.timeFrom || '');
            })
        }));
        clone.sort((a: any, b: any) => (a.graph?.name || '').localeCompare(b.graph?.name || ''));
        return clone;
    }, [weeklyData]);

    const formatDate = (iso: string) => {
        try {
            const d = new Date(iso);
            return d.toLocaleDateString('ru-RU', { weekday: 'long', day: '2-digit', month: 'long' });
        } catch {
            return iso;
        }
    };

    return (
        <div>
            {!selectedGraphId && (
                <div style={{
                    padding: '12px 14px',
                    backgroundColor: '#fff7ed',
                    color: '#7c2d12',
                    border: '1px solid #fed7aa',
                    borderRadius: 6,
                    marginBottom: 12
                }}>
                    Выберите универсальный граф в профиле, чтобы получить расписание.
                </div>
            )}

            {isFetching && (
                <div style={{ padding: 12, color: '#6b7280' }}>Загрузка…</div>
            )}

            {sortedData.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 12,
                    marginTop: 4
                }}>
                    {sortedData.map((group: any) => (
                        <div key={group.graph?._id} style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            overflow: 'hidden',
                            background: 'white'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '10px 12px',
                                background: '#f9fafb',
                                borderBottom: '1px solid #f1f5f9'
                            }}>
                                <div style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 8,
                                    background: '#e5e7eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#374151',
                                    fontWeight: 600,
                                    flex: '0 0 auto'
                                }}>
                                    {(group.graph?.name || 'G').charAt(0).toUpperCase()}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontWeight: 600, color: '#111827' }}>{group.graph?.name}</div>
                                    {group.graph?.imgPath && (
                                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                                            {group.graph?.imgPath}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {group.events?.length ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, padding: 12 }}>
                                    {group.events.map((ev: any) => (
                                        <div key={ev._id} style={{
                                            display: 'grid',
                                            gridTemplateColumns: '120px 1fr',
                                            gap: 12,
                                            alignItems: 'start',
                                            border: '1px solid #f1f5f9',
                                            borderRadius: 8,
                                            padding: 10,
                                            background: '#ffffff'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 6,
                                                color: '#374151',
                                                fontSize: 13
                                            }}>
                                                <div style={{ fontWeight: 600 }}>{formatDate(ev.eventDate)}</div>
                                                <div style={{ color: '#6b7280' }}>{ev.timeFrom}–{ev.timeTo}</div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                <div style={{ fontWeight: 600, color: '#111827' }}>{ev.name}</div>
                                                {ev.description && (
                                                    <div style={{ color: '#374151', whiteSpace: 'pre-line' }}>{ev.description}</div>
                                                )}
                                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13, color: '#6b7280' }}>
                                                    {ev.place && <span>Место: {ev.place}</span>}
                                                    {typeof ev.regedUsers === 'number' && <span>Участников: {ev.regedUsers}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: 12, color: '#6b7280' }}>Нет событий</div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {selectedGraphId && isFetched && !isFetching && Array.isArray(weeklyData) && weeklyData.length === 0 && (
                <div style={{ padding: 12, color: '#6b7280' }}>Нет данных за неделю</div>
            )}
        </div>
    );
};


