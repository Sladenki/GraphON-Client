'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { GraphService } from '@/services/graph.service';
import { EventService } from '@/services/event.service';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { GraphInfo } from '@/types/graph.interface';
import { EventItem } from '@/types/schedule.interface';
import { useState, useMemo } from 'react';
import { useDeclensionWord } from '@/hooks/useDeclension';
import EventCard from '@/components/shared/EventCard/EventCard';
import { useAuth } from '@/providers/AuthProvider';
import Image from 'next/image';
import { GraduationCap, Users, ChevronDown } from 'lucide-react';
import NoImage from '../../../../public/noImage.png';
import SubscribersPopUp from '@/app/(main)/manage/SubscribersPopUp';
import styles from './Manage.module.scss';

export default function ManagePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isLoggedIn } = useAuth();
    const anyUser: any = user as any;
    const managedIds: string[] = Array.isArray(anyUser?.managed_graph_id) ? anyUser.managed_graph_id : (Array.isArray(anyUser?.managedGraphIds) ? anyUser.managedGraphIds : []);
    const graphId = searchParams.get('id') || managedIds[0];

    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [isSubscribersOpen, setIsSubscribersOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Загрузка информации о всех управляемых графах
    const { data: managedGraphs } = useQuery({
        queryKey: ['managedGraphs', managedIds],
        queryFn: async () => {
            if (managedIds.length === 0) return [];
            const promises = managedIds.map(id => GraphService.getGraphById(id));
            const results = await Promise.all(promises);
            return results;
        },
        enabled: managedIds.length > 0,
        staleTime: 5 * 60_000,
    });

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

    // Склонение для количества подписок (используем 0 как fallback)
    const subsWord = useDeclensionWord(data?.subsNum || 0, 'SUBSCRIPTION');

    // Обработчик переключения графа
    const handleGraphChange = (newGraphId: string) => {
        router.push(`/manage?id=${newGraphId}`);
        setIsDropdownOpen(false);
    };

    // Теперь условные return после всех хуков
    if (!isLoggedIn) return null;
    if (!graphId) return <div className={styles.manageWrapper}>Не найден доступный граф для управления</div>;
    if (isLoading) return <SpinnerLoader/>;
    if (isError || !data) return (
        <div className={styles.manageWrapper}>
            <p>Ошибка загрузки данных графа</p>
            <button onClick={() => refetch()} className={styles.refreshButton}>Повторить</button>
        </div>
    );

    // Показывать дропдаун только если больше одного графа
    const showDropdown = managedIds.length > 1;

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
            <div className={styles.headerCard}>
                <div className={styles.graphHeader}>
                    <div className={styles.graphAvatar}>
                        <Image 
                            src={data.imgPath ? `${process.env.NEXT_PUBLIC_S3_URL}/${data.imgPath}` : NoImage} 
                            alt={data.name} 
                            width={80}
                            height={80}
                            className={styles.avatar}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = NoImage.src;
                            }}
                        />
                    </div>
                    <div className={styles.graphInfo}>
                        {/* Дропдаун для переключения между графами */}
                        {showDropdown ? (
                            <div className={styles.graphSelector}>
                                <button 
                                    className={styles.graphSelectorButton}
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <h2 className={styles.graphName}>{data.name}</h2>
                                    <ChevronDown 
                                        size={20} 
                                        className={`${styles.chevron} ${isDropdownOpen ? styles.chevronOpen : ''}`}
                                    />
                                </button>
                                {isDropdownOpen && (
                                    <>
                                        <div 
                                            className={styles.dropdownOverlay}
                                            onClick={() => setIsDropdownOpen(false)}
                                        />
                                        <div className={styles.dropdown}>
                                            {managedGraphs?.map((graph) => (
                                                <button
                                                    key={graph._id}
                                                    className={`${styles.dropdownItem} ${graph._id === graphId ? styles.dropdownItemActive : ''}`}
                                                    onClick={() => handleGraphChange(graph._id)}
                                                >
                                                    <span className={styles.dropdownItemName}>{graph.name}</span>
                                                    {graph._id === graphId && (
                                                        <span className={styles.dropdownItemCheck}>✓</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <h2 className={styles.graphName}>{data.name}</h2>
                        )}
                        {data.parentGraphId && (
                            <div className={styles.parentGraph}>
                                <GraduationCap size={16} className={styles.parentIcon} />
                                <span>{data.parentGraphId.name}</span>
                            </div>
                        )}
                        <div className={styles.graphStats}>
                            <div 
                                className={styles.statItem}
                                onClick={() => setIsSubscribersOpen(true)}
                                role="button"
                                tabIndex={0}
                            >
                                <Users size={16} className={styles.statIcon} />
                                <span>{data.subsNum} {subsWord}</span>
                            </div>
                        </div>
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

            {/* PopUp со списком подписчиков */}
            <SubscribersPopUp
                isOpen={isSubscribersOpen}
                onClose={() => setIsSubscribersOpen(false)}
                graphId={graphId}
                graphName={data.name}
            />
        </div>
    );
}


