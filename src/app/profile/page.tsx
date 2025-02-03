'use client';

import { useAuth } from '@/providers/AuthProvider';
import styles from './Profile.module.scss'
import { SpinnerLoader } from '@/components/ui/SpinnerLoader/SpinnerLoader';
import { IUser } from '@/types/user.interface';
import LoginButton from '@/components/ProfileCorner/LoginButton/LoginButton';;

export default function Profile() {
    const { user, loading, error } = useAuth();

    console.log('user', user)

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
                        <img src={typedUser.avaPath} className={styles.avatar} alt="Аватар" />
                        <span className={styles.name}>{typedUser.name}</span>
                    </div>
                  
                    <span className={styles.text}>Количество постов: {typedUser.postsNum}</span>
                </>
            ) : <LoginButton/>}
        </div>
    );
}

