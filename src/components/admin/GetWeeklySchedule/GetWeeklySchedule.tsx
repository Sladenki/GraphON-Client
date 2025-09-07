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

            {/* Календарная недельная сетка */}
            {Array.isArray(weeklyData) && weeklyData.length > 0 && (() => {
                // Плоский список событий с графом
                const flat = weeklyData.flatMap((group: any) =>
                    (group.events || []).map((ev: any) => ({ ...ev, __graph: group.graph }))
                );

                // Если нет событий
                if (flat.length === 0) return null;

                // Вспомогательные функции
                const toLocalKey = (d: Date) => {
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${y}-${m}-${day}`;
                };
                const startOfWeekMonday = (d: Date) => {
                    const copy = new Date(d);
                    copy.setHours(0, 0, 0, 0);
                    const day = copy.getDay(); // 0..6, где 1 — понедельник
                    const diff = (day + 6) % 7; // смещение к понедельнику
                    copy.setDate(copy.getDate() - diff);
                    return copy;
                };
                const getHueFromId = (id: string) => {
                    let hash = 0;
                    for (let i = 0; i < (id || '').length; i++) {
                        hash = (hash << 5) - hash + id.charCodeAt(i);
                        hash |= 0;
                    }
                    const hue = Math.abs(hash) % 360;
                    return hue;
                };

                // Определяем неделю по минимальной дате события
                const minDate = flat.reduce((acc: Date | null, ev: any) => {
                    const d = new Date(ev.eventDate);
                    return !acc || d < acc ? d : acc;
                }, null) || new Date();
                const weekStart = startOfWeekMonday(minDate);
                const days = Array.from({ length: 7 }).map((_, i) => {
                    const d = new Date(weekStart);
                    d.setDate(weekStart.getDate() + i);
                    return d;
                });

                // Группируем события по дням
                const eventsByDay = new Map<string, any[]>();
                for (const ev of flat) {
                    const d = new Date(ev.eventDate);
                    const key = toLocalKey(d);
                    const arr = eventsByDay.get(key) || [];
                    arr.push(ev);
                    eventsByDay.set(key, arr);
                }

                // Сортируем события в каждом дне по времени
                for (const [k, arr] of eventsByDay.entries()) {
                    arr.sort((a: any, b: any) => (a.timeFrom || '').localeCompare(b.timeFrom || ''));
                    eventsByDay.set(k, arr);
                }

                const weekdayFormat = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' });
                const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' });

                // Подготовим ширины колонок: шире, если есть события, уже — если нет
                const columnDefs = days.map((d) => {
                    const key = toLocalKey(d);
                    const hasEvents = (eventsByDay.get(key) || []).length > 0;
                    return hasEvents ? 'minmax(220px, 1fr)' : 'minmax(140px, 1fr)';
                }).join(' ');

                return (
                    <div style={{
                        overflowX: 'auto',
                        paddingBottom: 8
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: columnDefs,
                            gap: 12,
                            minWidth: 7 * 140
                        } as any}>
                            {days.map((d) => {
                                const key = toLocalKey(d);
                                const dayEvents = eventsByDay.get(key) || [];
                                return (
                                    <div key={key} style={{
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 8,
                                        background: 'white',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        minHeight: 220
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'baseline',
                                            padding: '10px 12px',
                                            borderBottom: '1px solid #f1f5f9',
                                            background: '#f9fafb'
                                        }}>
                                            <div style={{ fontWeight: 700, textTransform: 'capitalize', color: '#111827' }}>
                                                {weekdayFormat.format(d)}
                                            </div>
                                            <div style={{ color: '#6b7280', fontSize: 12 }}>
            								{dateFormat.format(d)}
                                            </div>
                                        </div>
                                        <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {dayEvents.length === 0 ? (
                                                <div style={{ color: '#9ca3af', fontSize: 13 }}>Нет событий</div>
                                            ) : dayEvents.map((ev: any) => {
                                                const graph = ev.__graph || {};
                                                const hue = getHueFromId(graph._id || '');
                                                const borderColor = `hsl(${hue}, 70%, 45%)`;
                                                const bgColor = `hsl(${hue}, 85%, 96%)`;
                                                return (
                                                    <div key={ev._id} style={{
                                                        borderLeft: `4px solid ${borderColor}`,
                                                        background: bgColor,
                                                        borderRadius: 6,
                                                        padding: '8px 10px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 4
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                                                            <div style={{ fontWeight: 600, color: '#111827', overflowWrap: 'anywhere', wordBreak: 'break-word', flex: 1, minWidth: 0 }}>{ev.name}</div>
                                                            <div style={{ color: '#374151', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0, maxWidth: '45%' }}>{ev.timeFrom}–{ev.timeTo}</div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151', fontSize: 12 }}>
                                                            <div style={{
                                                                width: 18,
                                                                height: 18,
                                                                borderRadius: 4,
                                                                background: borderColor,
                                                                color: 'white',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: 11,
                                                                fontWeight: 700,
                                                                flex: '0 0 auto'
                                                            }}>
                                                                {(graph.name || 'G').charAt(0).toUpperCase()}
                                                            </div>
                                                            <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{graph.name}</span>
                                                        </div>
                                                        {ev.place && (
                                                            <div style={{ color: '#6b7280', fontSize: 12 }}>Место: {ev.place}</div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {selectedGraphId && isFetched && !isFetching && Array.isArray(weeklyData) && weeklyData.length === 0 && (
                <div style={{ padding: 12, color: '#6b7280' }}>Нет данных за неделю</div>
            )}
        </div>
    );
};


