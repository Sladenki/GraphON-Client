'use client';

import { useAuth } from '@/providers/AuthProvider';
import styles from './Profile.module.scss'
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { IUser, RoleTitles, UserRole } from '@/types/user.interface';
import LoginButton from '@/components/global/ProfileCorner/LoginButton/LoginButton';
import Image from 'next/image'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { GraduationCap, Pencil } from 'lucide-react';
import { EventRegService } from '@/services/eventReg.service';
import EventCard from '@/components/ui/EventCard/EventCard';
import LogOut from './LogOut/LogOut';
import NoImage from '../../../../public/noImage.png'
import ThemeToggle from '@/components/global/ThemeToggle/ThemeToggle';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MissingDataMessage from './MissingDataMessage/MissingDataMessage';
import { GraphService } from '@/services/graph.service';
import { UserService } from '@/services/user.service';
import { IGraphList } from '@/types/graph.interface';
import { useSetSelectedGraphId } from '@/stores/useUIStore';
import EditProfilePopUp from './EditProfilePopUp/EditProfilePopUp';


export default function Profile() {
    const { user, setUser, loading, error } = useAuth();
    const queryClient = useQueryClient();
    const small = useMediaQuery('(max-width: 650px)')
    const setSelectedGraphId = useSetSelectedGraphId();
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    
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

    // Локальный выбор ВУЗа (применяется по кнопке)
    const [pendingUniversity, setPendingUniversity] = useState<string>('');
    const [isApplyingUniversity, setIsApplyingUniversity] = useState<boolean>(false);

    const typedUser = user as IUser | null;
    // form state moved into EditProfilePopUp

    const handleDelete = (eventId: string) => {
        queryClient.setQueryData(['eventsList'], (old: any) => {
            if (!old?.data) return old;
            return {
                ...old,
                data: old.data.filter((event: any) => event.eventId?._id !== eventId)
            };
        });
    };

    if(loading || loadingEvents) {
      return <SpinnerLoader/>
    }

    if(error) {
      return <div>{error}</div>
    }

    const subsEvents = allEvents?.data;

    // Определяем недостающие данные
    const getMissingFields = (user: IUser) => {
        const missingFields: string[] = [];
        
        if (!user.firstName || user.firstName.trim() === '') {
            missingFields.push('firstName');
        }
        if (!user.lastName || user.lastName.trim() === '') {
            missingFields.push('lastName');
        }
        if (!user.username || user.username.trim() === '') {
            missingFields.push('username');
        }
        
        return missingFields;
    };

    const missingFields = typedUser ? getMissingFields(typedUser) : [];

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

    // Текущее значение select: выбранное пользователем или уже установленный ВУЗ (для роли create)
    const selectValue = pendingUniversity || (typeof typedUser?.selectedGraphId === 'string' ? typedUser.selectedGraphId : '');

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
                    </div>

                    {/* Блок выбора ВУЗа доступен всегда для роли create, иначе только при отсутствии selectedGraphId */}
                    {(!typedUser.selectedGraphId || typedUser.role === UserRole.Create) && (
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
                    )}

    

                    {missingFields.length > 0 && (
                        <MissingDataMessage missingFields={missingFields} />
                    )}

                    {!small && <ThemeToggle size="md" />}   
                
                        
                    {
                        subsEvents && subsEvents.length > 0 && (
                            <h2 className={styles.eventsHeader}>Мероприятия, на которые вы записаны</h2>   
                        )
                    } 
                   

                    {subsEvents && subsEvents.length > 0 && (
                        <div className={styles.eventsList}>
                            {subsEvents.map((event: any) => (
                                event.eventId && (
                                    <div className={styles.eventCardWrapper}>
                                        <EventCard 
                                            key={event._id}
                                            event={event.eventId} 
                                            isAttended={event.isAttended} 
                                            onDelete={handleDelete}
                                        />
                                    </div>
                                )
                            ))}
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

