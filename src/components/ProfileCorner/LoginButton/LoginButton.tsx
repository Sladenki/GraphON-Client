'use client'

import React, { useState } from 'react';

import styles from './LoginButton.module.scss'

const LoginButton = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {

        const redirectUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?isCapacitor=false`;

        window.location.href = redirectUrl;
    };


    return (
        <div className={styles.loginButtonWrapper}>
            {user ? (
                <div className={styles.userInfo}>
                    {/* @ts-expect-error 123 */}
                    <img src={user.imageUrl} alt={user.name} className={styles.userAvatar} />
                    {/* @ts-expect-error 123 */}
                    <p className={styles.welcomeText}>Добро пожаловать, {user.name}</p>
                </div>
            ) : (
                <button onClick={handleLogin} disabled={isLoading} className={styles.googleButton}>
                    <img src="/google.svg" alt="Google" className={styles.googleIcon} />
                    {isLoading ? "Загрузка..." : "Войти с Google"}
                </button>
            )}
        </div>
    );
};

export default LoginButton;
        
        
        
        
