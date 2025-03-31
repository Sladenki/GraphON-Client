'use client';

import { useAuth } from '@/providers/AuthProvider';
import styles from './Profile.module.scss'
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { IUser } from '@/types/user.interface';
import LoginButton from '@/components/global/ProfileCorner/LoginButton/LoginButton';
import Image from 'next/image'
import LogOut from '@/app/profile/LogOut/LogOut';
import { useTheme } from 'next-themes';

export default function Profile() {
    const { user, loading, error } = useAuth();

    // -- Тема ---
    const { setTheme, theme } = useTheme();
    
    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

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

                    <div className={styles.themeSwitchWrapper}>
                        <span className={styles.themeLabel}>Тема:</span>
                        <label className={styles.themeSwitch}>
                        <input type="checkbox" onChange={toggleTheme} checked={theme === "light"} />
                        <span className={styles.slider}></span>
                        </label>
                    </div>
                  
                    {/* <span className={styles.text}>Количество постов: {typedUser.postsNum}</span> */}

                    <LogOut/>
                 
                </>
            ) : <LoginButton/>}
        </div>
    );
}

