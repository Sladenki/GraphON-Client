'use client';

import { useAuth } from '@/providers/AuthProvider';
import styles from './Profile.module.scss'
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { EmptyState } from '@/components/global/EmptyState/EmptyState';
import { IUser, RoleTitles, UserRole } from '@/types/user.interface';
import LoginButton from '@/components/global/ProfileCorner/LoginButton/LoginButton';
import Image from 'next/image'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { GraduationCap, Pencil, Heart, CalendarCheck } from 'lucide-react';
import { EventRegService } from '@/services/eventReg.service';
import EventCard from '@/components/ui/EventCard/EventCard';
import LogOut from './LogOut/LogOut';
import NoImage from '../../../../public/noImage.png'
import ThemeToggle from '@/components/global/ThemeToggle/ThemeToggle';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { GraphService } from '@/services/graph.service';
import { UserService } from '@/services/user.service';
import { GraphSubsService } from '@/services/graphSubs.service';
import { IGraphList } from '@/types/graph.interface';
import { useSetSelectedGraphId } from '@/stores/useUIStore';
import EditProfilePopUp from './EditProfilePopUp/EditProfilePopUp';
import SearchBar, { SearchTag } from '@/components/ui/SearchBar/SearchBar';
import GraphBlock from '@/components/ui/GraphBlock/GraphBlock';
import { useDebounce } from '@/hooks/useDebounce';


export default function Profile() {
    const { user, setUser, loading, error } = useAuth();
    const queryClient = useQueryClient();
    const small = useMediaQuery('(max-width: 650px)')
    const setSelectedGraphId = useSetSelectedGraphId();
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [showSubscriptions, setShowSubscriptions] = useState<boolean>(false);
    const [showEvents, setShowEvents] = useState<boolean>(false);
    
    // Состояния для поиска и фильтрации
    const [subscriptionQuery, setSubscriptionQuery] = useState<string>('');
    const [eventQuery, setEventQuery] = useState<string>('');
    const [selectedSubscriptionTags, setSelectedSubscriptionTags] = useState<string[]>([]);
    const [selectedEventTags, setSelectedEventTags] = useState<string[]>([]);
    
    const debouncedSubscriptionQuery = useDebounce(subscriptionQuery, 300);
    const debouncedEventQuery = useDebounce(eventQuery, 300);
    
    const { data: allEvents, isLoading: loadingEvents } = useQuery({
        queryKey: ['eventsList'],
        queryFn: () => EventRegService.getEventsByUserId(),
        enabled: !!user
    });

    // Загружаем список ВУЗов (глобальных графов)
    const { data: globalGraphsResp, isLoading: isLoadingUniversities } = useQuery<IGraphList[]>({
        queryKey: ['graph/getGlobalGraphs'],
        queryFn: async () => {
            const res = await GraphService.getGlobalGraphs();
            return res.data as IGraphList[];
        }
    });

    // Загружаем подписки пользователя
    const { data: userSubscriptions, isLoading: loadingSubscriptions } = useQuery({
        queryKey: ['userSubscriptions'],
        queryFn: () => GraphSubsService.getUserSubscribedGraphs(),
        enabled: !!user && showSubscriptions
    });

    // Загружаем все мероприятия пользователя
    const { data: allUserEvents, isLoading: loadingAllEvents } = useQuery({
        queryKey: ['allUserEvents'],
        queryFn: () => EventRegService.getAllUserEvents(),
        enabled: !!user && showEvents
    });

    // Локальный выбор ВУЗа (применяется по кнопке)
    const [pendingUniversity, setPendingUniversity] = useState<string>('');
    const [isApplyingUniversity, setIsApplyingUniversity] = useState<boolean>(false);

    const typedUser = user as IUser | null;
    const subsEvents = allEvents?.data;

    // Обработчик удаления мероприятий
    const handleDelete = useCallback((eventId: string) => {
        queryClient.setQueryData(['eventsList'], (old: any) => {
            if (!old?.data) return old;
            return {
                ...old,
                data: old.data.filter((event: any) => event.eventId?._id !== eventId)
            };
        });
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

    // Выбранный ВУЗ: отображаем название если доступно
    const selectedGraphName = (() => {
        const sg: any = typedUser?.selectedGraphId as any;
        if (!sg) return null;
        if (typeof sg === 'object' && sg?.name) return sg.name as string;
        if (typeof sg === 'string' && globalGraphsResp) {
            const found = globalGraphsResp.find(g => g._id === sg);
            return found?.name ?? null;
        }
        return null;
    })();

    const handleUniversitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPendingUniversity(e.target.value);
    };

    const handleApplyUniversity = async () => {
        if (!pendingUniversity) return;
        try {
            setIsApplyingUniversity(true);
            await UserService.updateSelectedGraph(pendingUniversity);
            if (user) {
                setUser({ ...user, selectedGraphId: pendingUniversity });
            }
            setSelectedGraphId(pendingUniversity);
            queryClient.invalidateQueries({ queryKey: ['eventsList'] });
        } catch (err) {
            console.error('Ошибка выбора ВУЗа:', err);
        } finally {
            setIsApplyingUniversity(false);
        }
    };

    // Обработчики для статистик
    const handleSubscriptionsClick = () => {
        setShowSubscriptions(!showSubscriptions);
        setShowEvents(false);
        // Сбрасываем поиск при переключении
        if (!showSubscriptions) {
            setSubscriptionQuery('');
            setSelectedSubscriptionTags([]);
        }
    };

    const handleEventsClick = () => {
        setShowEvents(!showEvents);
        setShowSubscriptions(false);
        // Сбрасываем поиск при переключении
        if (!showEvents) {
            setEventQuery('');
            setSelectedEventTags([]);
        }
    };

    // Текущее значение select: выбранное пользователем или уже установленный ВУЗ (для роли create)
    const selectValue = pendingUniversity || (typeof typedUser?.selectedGraphId === 'string' ? typedUser.selectedGraphId : '');

    // Условные возвраты после всех хуков
    if(loading || loadingEvents) {
        return <SpinnerLoader/>
    }

    if(error) {
        return <div>{error}</div>
    }

    return (
        <div className={styles.profileWrapper}>
            {typedUser && (
                <button 
                    type="button"
                    className={styles.editFloatingButton}
                    aria-label="Редактировать профиль"
                    onClick={() => setIsEditOpen(true)}
                >
                    <Pencil />
                </button>
            )}
            {typedUser ? (
                <>
                    <div className={`${styles.header} ${!typedUser.selectedGraphId ? styles.headerCompact : ''}`}>
                        <Image 
                            src={typedUser.avaPath && typedUser.avaPath.startsWith('http') ? typedUser.avaPath : NoImage} 
                            className={styles.avatar} 
                            alt="Аватар" 
                            width={160}
                            height={160}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = NoImage.src;
                            }}
                            onLoad={() => console.log('Avatar loaded successfully')}
                        />    
                       
                        <div className={styles.nameGroup}>
                            <span className={styles.name}>
                                {getDisplayName(typedUser)}
                            </span>
                            {typedUser.role !== 'user' && (
                                <span className={styles.role}>
                                    {RoleTitles[typedUser.role]}
                                </span>
                            )}
                        </div>

                        {/* Отображение выбранного ВУЗа */}
                        {!!typedUser.selectedGraphId && selectedGraphName && (
                            <div className={styles.selectedUniversity}>
                                <span className={styles.selectedUniversityIcon}>
                                    <GraduationCap size={18} />
                                </span>
                                <div className={styles.selectedUniversityText}>
                                    <span className={styles.selectedUniversityLabel}>Выбранный ВУЗ</span>
                                    <span className={styles.selectedUniversityName}>{selectedGraphName}</span>
                                </div>
                            </div>
                        )}

                        {/* Статистика подписок и участия в событиях */}
                        <div className={styles.stats}>
                            <div 
                                className={`${styles.statItem} ${styles.clickable}`}
                                onClick={handleSubscriptionsClick}
                            >
                                <span className={styles.statIcon}><Heart size={16} /></span>
                                <div className={styles.statText}>
                                    <span className={styles.statValue}>{typedUser.graphSubsNum ?? 0}</span>
                                    <span className={styles.statLabel}>подписок</span>
                                </div>
                            </div>
                            <div 
                                className={`${styles.statItem} ${styles.clickable}`}
                                onClick={handleEventsClick}
                            >
                                <span className={styles.statIcon}><CalendarCheck size={16} /></span>
                                <div className={styles.statText}>
                                    <span className={styles.statValue}>{typedUser.attentedEventsNum ?? 0}</span>
                                    <span className={styles.statLabel}>мероприятий</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Блок выбора ВУЗа доступен всегда для роли create, иначе только при отсутствии selectedGraphId */}
                    {/* {(!typedUser.selectedGraphId || typedUser.role === UserRole.Create) && (
                        <div className={styles.universityCard}>
                            <h3 className={styles.universityTitle}>Выберите университет</h3>
                            <div className={styles.universityRow}>
                                <select
                                    id="universitySelect"
                                    onChange={handleUniversitySelect}
                                    disabled={isLoadingUniversities}
                                    className={styles.select}
                                    value={selectValue}
                                >
                                    <option value="" disabled>{isLoadingUniversities ? 'Загрузка…' : '— Выберите ВУЗ —'}</option>
                                    {(globalGraphsResp || []).map(g => (
                                        <option key={g._id} value={g._id}>{g.name}</option>
                                    ))}
                                </select>
                                <button 
                                    type="button"
                                    className={styles.applyBtn} 
                                    disabled={isLoadingUniversities || !pendingUniversity || isApplyingUniversity}
                                    onClick={handleApplyUniversity}
                                >
                                    {isApplyingUniversity ? 'Применение…' : 'Применить'}
                                </button>
                            </div>
                        </div>
                    )} */}

                    {/* Отображение подписок */}
                    {showSubscriptions && (
                        <div className={styles.dataSection}>
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
                                            <GraphBlock
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
                                        emoji="🔍"
                                    />
                                </div>
                            ) : (
                                <div className={styles.emptyStateWrapper}>
                                    <EmptyState
                                        message="У вас пока нет подписок"
                                        subMessage="Подпишитесь на интересные группы, чтобы следить за их активностью"
                                        emoji="💝"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Отображение мероприятий */}
                    {showEvents && (
                        <div className={styles.dataSection}>
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
                                <div className={styles.eventsList}>
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
                                        emoji="🔍"
                                    />
                                </div>
                            ) : (
                                <div className={styles.emptyStateWrapper}>
                                    <EmptyState
                                        message="У вас пока нет мероприятий"
                                        subMessage="Зарегистрируйтесь на интересные события, чтобы не пропустить их"
                                        emoji="📅"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                

                    <div className={styles.logoutContainer}>
                        <LogOut/>
                    </div>
                    
                    <EditProfilePopUp isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
                 
                </>
            ) : <LoginButton/>}
        </div>
    );
}

