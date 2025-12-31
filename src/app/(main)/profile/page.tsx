'use client';

import { useAuth } from '@/providers/AuthProvider';
import styles from './Profile.module.scss'
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { EmptyState } from '@/components/global/EmptyState/EmptyState';
import { IUser } from '@/types/user.interface';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Pencil, Search, CalendarX, HeartOff } from 'lucide-react';
import { EventRegService } from '@/services/eventReg.service';
import EventCard from '@/components/shared/EventCard/EventCard';
import NoImage from '../../../../public/noImage.png'
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { GraphSubsService } from '@/services/graphSubs.service';
import { EventService } from '@/services/event.service';
import EditProfilePopUp from './EditProfilePopUp/EditProfilePopUp';
import SearchBar, { SearchTag } from '@/components/shared/SearchBar/SearchBar';
import GroupBlock from '@/components/shared/GroupBlock/GroupBlock';
import { useDebounce } from '@/hooks/useDebounce';
import { notifySuccess, notifyError } from '@/lib/notifications';
import Calendar from '@/components/shared/Calendar/Calendar';


export default function Profile() {
    const { user, loading, error } = useAuth();
    const queryClient = useQueryClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const small = useMediaQuery('(max-width: 650px)')
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [activeSection, setActiveSection] = useState<'events' | 'subs' | 'schedule'>('schedule');
    
    // Состояния для поиска и фильтрации
    const [subscriptionQuery, setSubscriptionQuery] = useState<string>('');
    const [eventQuery, setEventQuery] = useState<string>('');
    const [selectedSubscriptionTags, setSelectedSubscriptionTags] = useState<string[]>([]);
    const [selectedEventTags, setSelectedEventTags] = useState<string[]>([]);
    
    const debouncedSubscriptionQuery = useDebounce(subscriptionQuery, 300);
    const debouncedEventQuery = useDebounce(eventQuery, 300);
    
    

    // Загружаем подписки пользователя
    const { data: userSubscriptions, isLoading: loadingSubscriptions } = useQuery({
        queryKey: ['userSubscriptions'],
        queryFn: () => GraphSubsService.getUserSubscribedGraphs(),
        enabled: !!user && activeSection === 'subs'
    });

    // Загружаем все мероприятия пользователя
    const { data: allUserEvents, isLoading: loadingAllEvents } = useQuery({
        queryKey: ['allUserEvents'],
        queryFn: () => EventRegService.getAllUserEvents(),
        enabled: !!user && activeSection === 'events'
    });

    // Загружаем расписание по подпискам (только когда открыт раздел)
    const { data: subsScheduleResp, isLoading: loadingSchedule, isError: isScheduleError, error: scheduleError } = useQuery({
        queryKey: ['subsSchedule'],
        queryFn: () => GraphSubsService.getSubsSchedule(),
        enabled: !!user && activeSection === 'schedule'
    });

    const typedUser = user as IUser | null;

    // Обработчик удаления мероприятий
    const handleDelete = useCallback(async (eventId: string) => {
        try {
            // Оптимистичное обновление UI
            queryClient.setQueryData(['eventsList'], (old: any) => {
                if (!old?.data) return old;
                return {
                    ...old,
                    data: old.data.filter((event: any) => event.eventId?._id !== eventId)
                };
            });

            // Отправка запроса на сервер
            await EventService.deleteEvent(eventId);
            
            // Уведомление об успехе
            notifySuccess('Мероприятие успешно удалено');
        } catch (error) {
            console.error('Ошибка при удалении мероприятия:', error);
            
            // Уведомление об ошибке
            notifyError('Не удалось удалить мероприятие. Попробуйте еще раз.');
            
            // Перезагрузка данных при ошибке
            queryClient.invalidateQueries({ queryKey: ['eventsList'] });
        }
    }, [queryClient]);

    // Фильтрация подписок
    const filteredSubscriptions = useMemo(() => {
        if (!userSubscriptions?.data) return [];
        
        let result = [...userSubscriptions.data];
        
        const query = debouncedSubscriptionQuery.toLowerCase().trim();
        if (query) {
            result = result.filter((sub: any) => {
                const fields = [sub?.name, sub?.about].filter(Boolean);
                return fields.some((v) => String(v).toLowerCase().includes(query));
            });
        }
        
        if (selectedSubscriptionTags.length > 0) {
            result = result.filter((sub: any) => {
                const parentId = sub?.parentGraphId?._id;
                return parentId && selectedSubscriptionTags.includes(parentId);
            });
        }
        
        return result;
    }, [userSubscriptions?.data, debouncedSubscriptionQuery, selectedSubscriptionTags]);

    // Фильтрация мероприятий
    const filteredEvents = useMemo(() => {
        if (!allUserEvents?.data) return [];
        
        let result = [...allUserEvents.data];
        
        const query = debouncedEventQuery.toLowerCase().trim();
        if (query) {
            result = result.filter((event: any) => {
                const eventData = event.eventId || event;
                const fields = [eventData?.name, eventData?.description, eventData?.place, eventData?.graphId?.name].filter(Boolean);
                return fields.some((v) => String(v).toLowerCase().includes(query));
            });
        }
        
        if (selectedEventTags.length > 0) {
            result = result.filter((event: any) => {
                const eventData = event.eventId || event;
                const graphId = eventData?.graphId?._id;
                const parentId = eventData?.graphId?.parentGraphId?._id;
                return (graphId && selectedEventTags.includes(graphId)) || 
                       (parentId && selectedEventTags.includes(parentId));
            });
        }
        
        return result;
    }, [allUserEvents?.data, debouncedEventQuery, selectedEventTags]);

    // Доступные теги для подписок
    const availableSubscriptionTags: SearchTag[] = useMemo(() => {
        if (!userSubscriptions?.data) return [];
        
        const map = new Map<string, SearchTag>();
        userSubscriptions.data.forEach((sub: any) => {
            const parent = sub?.parentGraphId;
            if (parent?._id && parent?.name) {
                map.set(parent._id, { _id: parent._id, name: parent.name });
            }
        });
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [userSubscriptions?.data]);

    // Доступные теги для мероприятий
    const availableEventTags: SearchTag[] = useMemo(() => {
        if (!allUserEvents?.data) return [];
        
        const map = new Map<string, SearchTag>();
        allUserEvents.data.forEach((event: any) => {
            const eventData = event.eventId || event;
            if (eventData?.graphId?._id && eventData?.graphId?.name) {
                map.set(eventData.graphId._id, { _id: eventData.graphId._id, name: eventData.graphId.name });
            }
            const parent = eventData?.graphId?.parentGraphId;
            if (parent?._id && parent?.name) {
                map.set(parent._id, { _id: parent._id, name: parent.name });
            }
        });
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [allUserEvents?.data]);

    // Формируем отображаемое имя
    const getDisplayName = (user: IUser) => {
        const hasFirstName = user.firstName && user.firstName.trim() !== '';
        const hasLastName = user.lastName && user.lastName.trim() !== '';
        
        if (hasFirstName && hasLastName) {
            return `${user.firstName} ${user.lastName}`;
        } else if (hasFirstName) {
            return user.firstName;
        } else if (hasLastName) {
            return user.lastName;
        } else if (user.username && user.username.trim() !== '') {
            return `@${user.username}`;
        } else {
            return 'Пользователь';
        }
    };

    // Выбранный ВУЗ: показываем только если сервер уже отдал объект с name
    const selectedGraphName = (() => {
        const sg: any = typedUser?.selectedGraphId as any;
        if (!sg) return null;
        if (typeof sg === 'object' && sg?.name) return sg.name as string;
        return null;
    })();

    // Обработчики для статистик
    const handleSubscriptionsClick = () => {
        // Переход на страницу "Мой путь"
        router.push('/my_space');
    };

    const handleEventsClick = () => {
        if (activeSection === 'events') return;
        
        setActiveSection('events');
        // Сбрасываем поиск при переключении
        setEventQuery('');
        setSelectedEventTags([]);
    };

    const handleScheduleClick = () => {
        if (activeSection === 'schedule') return;
        setActiveSection('schedule');
    };

    // Редирект на страницу входа если пользователь не авторизован
    useEffect(() => {
        if (!loading && !user) {
            router.push('/signIn');
        }
    }, [loading, user, router]);

    // Умеем открывать раздел по query-параметру: /profile?tab=schedule
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'schedule') setActiveSection('schedule');
        else if (tab === 'subs') setActiveSection('subs');
        else if (tab === 'events') setActiveSection('events');
    }, [searchParams]);

    // Если при открытом расписании получили 401 — отправляем на вход
    useEffect(() => {
        if (!isScheduleError) return;
        const anyErr: any = scheduleError as any;
        const status = anyErr?.response?.status;
        if (status === 401) {
            notifyError('Ошибка авторизации');
            router.push('/signIn');
        }
    }, [isScheduleError, scheduleError, router]);

    // Условные возвраты после всех хуков
    if(loading) {
        return <SpinnerLoader/>
    }

    if(error) {
        return <div>{error}</div>
    }

    return (
        <div className={styles.profileWrapper}>
            {typedUser ? (
                <>
                    <div className={styles.profileCard}>
                        {/* Avatar */}
                        <div className={styles.avatarSection}>
                            <Image 
                                src={typedUser.avaPath && typedUser.avaPath.startsWith('http') ? typedUser.avaPath : NoImage} 
                                className={styles.avatar} 
                                alt="Аватар" 
                                width={100}
                                height={100}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = NoImage.src;
                                }}
                            />
                        </div>
                        
                        {/* Main info */}
                        <div className={styles.mainInfo}>
                            <h1 className={styles.userName}>{getDisplayName(typedUser)}</h1>
                            {typedUser.username && (
                                <div className={styles.userSubText}>@{typedUser.username}</div>
                            )}
                        </div>
                        
                        {/* Кнопка редактирования */}
                        <button 
                            className={styles.editButton}
                            onClick={() => setIsEditOpen(true)}
                            aria-label="Редактировать профиль"
                        >
                            <Pencil size={18} />
                        </button>
                    </div>

                    {/* Навигационные карточки */}
                    <div className={styles.navigationCards}>
                        <button
                            type="button"
                            className={`${styles.navCard} ${activeSection === 'subs' ? styles.navCardActive : ''}`}
                            onClick={handleSubscriptionsClick}
                            aria-pressed={activeSection === 'subs'}
                        >
                            <div className={styles.navCardContent}>
                                <span className={styles.navCardTitle}>Мой путь</span>
                                <span className={styles.navCardSubtitle}>Ваши подписки</span>
                            </div>
                        </button>
                        
                        <button
                            type="button"
                            className={`${styles.navCard} ${activeSection === 'events' ? styles.navCardActive : ''}`}
                            onClick={handleEventsClick}
                            aria-pressed={activeSection === 'events'}
                        >
                            <div className={styles.navCardContent}>
                                <span className={styles.navCardTitle}>События</span>
                                <span className={styles.navCardSubtitle}>Ваши мероприятия</span>
                            </div>
                        </button>

                        <button
                            type="button"
                            className={`${styles.navCard} ${activeSection === 'schedule' ? styles.navCardActive : ''}`}
                            onClick={handleScheduleClick}
                            aria-pressed={activeSection === 'schedule'}
                        >
                            <div className={styles.navCardContent}>
                                <span className={styles.navCardTitle}>Расписание</span>
                                <span className={styles.navCardSubtitle}>Календарь событий</span>
                            </div>
                        </button>
                    </div>
                    
                    <EditProfilePopUp isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
                </>
            ) : null}
        
            
            {/* Секции контента */}
            {typedUser && activeSection === 'subs' && (
                <div>
                    <h2 className={styles.sectionTitle}>Ваши подписки</h2>
                    
                    {/* Поиск и фильтры */}
                    <div className={styles.searchSection}>
                        <SearchBar
                            onSearch={setSubscriptionQuery}
                            onTagFilter={setSelectedSubscriptionTags}
                            placeholder="Поиск подписок..."
                            availableTags={availableSubscriptionTags}
                            showTagFilter={true}
                            initialQuery={subscriptionQuery}
                            initialSelectedTags={selectedSubscriptionTags}
                        />
                        
                        {/* Информация о результатах */}
                        {(subscriptionQuery.trim() !== '' || selectedSubscriptionTags.length > 0) && (
                            <div className={styles.searchResults}>
                                Найдено: {filteredSubscriptions.length} из {userSubscriptions?.data?.length || 0} подписок
                            </div>
                        )}
                    </div>

                    {/* Состояния загрузки и контента */}
                    {loadingSubscriptions ? (
                        <div className={styles.loader}>
                            <SpinnerLoader />
                        </div>
                    ) : filteredSubscriptions.length > 0 ? (
                        <div className={styles.subscriptionsGrid}>
                            {filteredSubscriptions.map((subscription: any) => (
                                <div key={subscription._id} className={styles.subscriptionItem}>
                                    <GroupBlock
                                        id={subscription._id}
                                        name={subscription.name}
                                        isSubToGraph={subscription.isSubscribed}
                                        imgPath={subscription.imgPath}
                                        about={subscription.about}
                                        handleScheduleButtonClick={() => {}}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : userSubscriptions?.data && userSubscriptions.data.length > 0 ? (
                        <div className={styles.emptyStateWrapper}>
                            <EmptyState
                                message="Ничего не найдено"
                                subMessage="Попробуйте изменить параметры поиска"
                                icon={Search}
                            />
                        </div>
                    ) : (
                        <div className={styles.emptyStateWrapper}>
                            <EmptyState
                                message="У вас пока нет подписок"
                                subMessage="Подпишитесь на интересные группы, чтобы следить за их активностью"
                                icon={HeartOff}
                            />
                        </div>
                    )}
                </div>
            )}

            {typedUser && activeSection === 'events' && (
                <div>
                    <h2 className={styles.sectionTitle}>Все ваши мероприятия</h2>
                    
                    {/* Поиск и фильтры */}
                    <div className={styles.searchSection}>
                        <SearchBar
                            onSearch={setEventQuery}
                            onTagFilter={setSelectedEventTags}
                            placeholder="Поиск мероприятий..."
                            availableTags={availableEventTags}
                            showTagFilter={true}
                            initialQuery={eventQuery}
                            initialSelectedTags={selectedEventTags}
                        />
                        
                        {/* Информация о результатах */}
                        {(eventQuery.trim() !== '' || selectedEventTags.length > 0) && (
                            <div className={styles.searchResults}>
                                Найдено: {filteredEvents.length} из {allUserEvents?.data?.length || 0} мероприятий
                            </div>
                        )}
                    </div>

                    {/* Состояния загрузки и контента */}
                    {loadingAllEvents ? (
                        <div className={styles.loader}>
                            <SpinnerLoader />
                        </div>
                    ) : filteredEvents.length > 0 ? (
                        <div className={styles.eventsList} data-swipe-enabled="true">
                            {filteredEvents.map((event: any, index: number) => (
                                <div 
                                    key={event._id} 
                                    className={styles.eventCard}
                                    style={{ 
                                        '--delay': `${Math.min(index * 0.05, 0.5)}s`
                                    } as React.CSSProperties}
                                >
                                    <EventCard 
                                        event={event.eventId || event} 
                                        isAttended={event.isAttended}
                                        onDelete={handleDelete}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : allUserEvents?.data && allUserEvents.data.length > 0 ? (
                        <div className={styles.emptyStateWrapper}>
                            <EmptyState
                                message="Ничего не найдено"
                                subMessage="Попробуйте изменить параметры поиска"
                                icon={Search}
                            />
                        </div>
                    ) : (
                        <div className={styles.emptyStateWrapper}>
                            <EmptyState
                                message="У вас пока нет мероприятий"
                                subMessage="Зарегистрируйтесь на интересные события, чтобы не пропустить их"
                                icon={CalendarX}
                            />
                        </div>
                    )}
                </div>
            )}

            {typedUser && activeSection === 'schedule' && (
                <div className={styles.scheduleSection}>
                    <h2 className={styles.sectionTitle}>Расписание</h2>
                    {loadingSchedule ? (
                        <div className={styles.loader}>
                            <SpinnerLoader />
                        </div>
                    ) : subsScheduleResp?.data ? (
                        <div className={styles.scheduleContainer}>
                            <Calendar
                                schedule={subsScheduleResp.data.schedule}
                                events={subsScheduleResp.data.events}
                            />
                        </div>
                    ) : (
                        <div className={styles.emptyStateWrapper}>
                            <EmptyState
                                message="Тут пока пусто"
                                subMessage="Подпишитесь на группы, чтобы видеть их расписание и мероприятия"
                                icon={CalendarX}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

