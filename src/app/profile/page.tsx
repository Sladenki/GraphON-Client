'use client';

import { useAuth } from '@/providers/AuthProvider';
import styles from './Profile.module.scss'
import { SpinnerLoader } from '@/components/ui/SpinnerLoader/SpinnerLoader';
import { IUser } from '@/types/user.interface';
import LoginButton from '@/components/ProfileCorner/LoginButton/LoginButton';
import Image from 'next/image'

export default function Profile() {
    const { user, loading, error } = useAuth();

    // console.log('user', user)

    if(loading) {
      return <SpinnerLoader/>
    }

    if(error) {
      return <div>{error}</div>
    }

    const typedUser = user as IUser | null;
  
    return (
        <div className={styles.profileWrapper}>
            {typedUser ? (
                <>
                    <div className={styles.header}>
                        {
                            <Image 
                                src={typedUser.avaPath} 
                                className={styles.avatar} 
                                alt="Аватар" 
                                width={120}
                                height={120}
                            />    
                        }
                       
                        <span className={styles.name}>
                            {typedUser.firstName}
                            {typedUser.lastName ? ` ${typedUser.lastName}` : ""}
                        </span>

                    </div>
                  
                    <span className={styles.text}>Количество постов: {typedUser.postsNum}</span>

                    {/* <span className={styles.text}>Количество подписок: {typedUser.graphSubsNum}</span> */}
                </>
            ) : <LoginButton/>}
        </div>
    );
}

