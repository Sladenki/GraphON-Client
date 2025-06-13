'use client';

import { useAuth } from '@/providers/AuthProvider';
import styles from './Profile.module.scss'
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { IUser, RoleTitles } from '@/types/user.interface';
import LoginButton from '@/components/global/ProfileCorner/LoginButton/LoginButton';
import Image from 'next/image'
import { useTheme } from 'next-themes';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { EventRegService } from '@/services/eventReg.service';
import EventCard from '@/components/ui/EventCard/EventCard';
import LogOut from './LogOut/LogOut';
import { Sun, Moon } from 'lucide-react';
import NoImage from '../../../../public/noImage.png'

export default function Profile() {
    const { user, loading, error } = useAuth();
    const { setTheme, theme } = useTheme();
    const queryClient = useQueryClient();
    
    const { data: allEvents, isLoading: loadingEvents } = useQuery({
        queryKey: ['eventsList'],
        queryFn: () => EventRegService.getEventsByUserId(),
        enabled: !!user
    });

    const handleDelete = (eventId: string) => {
        queryClient.setQueryData(['eventsList'], (old: any) => {
            if (!old?.data) return old;
            return {
                ...old,
                data: old.data.filter((event: any) => event.eventId?._id !== eventId)
            };
        });
    };

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    if(loading || loadingEvents) {
      return <SpinnerLoader/>
    }

    if(error) {
      return <div>{error}</div>
    }

    const typedUser = user as IUser | null;
    const subsEvents = allEvents?.data;

    return (
        <div className={styles.profileWrapper}>
            {typedUser ? (
                <>
                    <div className={styles.header}>
                            <Image 
                                src={typedUser.avaPath ? typedUser.avaPath : NoImage} 
                                className={styles.avatar} 
                                alt="Аватар" 
                                width={120}
                                height={120}
                            />    
                       
                        <span className={styles.name}>
                            {typedUser.firstName}
                            {typedUser.lastName ? ` ${typedUser.lastName}` : ""}
                        </span>

                        {typedUser.role !== 'user' && (
                            <span className={styles.role}>
                                {RoleTitles[typedUser.role]}
                            </span>
                        )}
                    </div>

                    <div className={styles.themeSwitchWrapper}>
                        <span className={styles.themeLabel}>
                            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                        </span>
                        <label className={styles.themeSwitch}>
                            <input 
                                type="checkbox" 
                                onChange={toggleTheme} 
                                checked={theme === "light"} 
                            />
                        <span className={styles.slider}></span>
                        </label>
                    </div>
                  
                    {/* <span className={styles.text}>Количество постов: {typedUser.postsNum}</span> */}
                        
                    {
                        subsEvents && subsEvents.length > 0 && (
                            <h2 className={styles.eventsHeader}>Мероприятия, на которые вы записаны</h2>   
                        )
                    } 
                   

                    {subsEvents && subsEvents.length > 0 && (
                        <div className={styles.eventsList}>
                            {subsEvents.map((event: any) => (
                                event.eventId && (
                                <EventCard 
                                        key={event._id}
                                    event={event.eventId} 
                                    isAttended={event.isAttended} 
                                    onDelete={handleDelete}
                                />
                                )
                            ))}
                        </div>
                    )}

                    <LogOut/>
                 
                </>
            ) : <LoginButton/>}
        </div>
    );
}

