'use client';

import { useAuth } from '@/providers/AuthProvider';
import styles from './Profile.module.scss'
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { IUser, RoleTitles } from '@/types/user.interface';
import LoginButton from '@/components/global/ProfileCorner/LoginButton/LoginButton';
import Image from 'next/image'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { EventRegService } from '@/services/eventReg.service';
import EventCard from '@/components/ui/EventCard/EventCard';
import LogOut from './LogOut/LogOut';
import NoImage from '../../../../public/noImage.png'
import ThemeToggle from '@/components/global/ThemeToggle/ThemeToggle';
import { useMediaQuery } from '@/hooks/useMediaQuery';


export default function Profile() {
    const { user, loading, error } = useAuth();
    const queryClient = useQueryClient();
    const small = useMediaQuery('(max-width: 650px)')
    
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

                    {!small && <ThemeToggle size="md" />}   
                  
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
                 
                </>
            ) : <LoginButton/>}
        </div>
    );
}

