'use client'

import React, { useState } from 'react';

const LoginButton = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {

        const redirectUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?isCapacitor=false`;

        window.location.href = redirectUrl;
    };


    return (
        <div>
            {user ? (
                <div>
                    {/* @ts-expect-error 123 */}
                    <img src={user.imageUrl} alt={user.name} style={{ borderRadius: '50%', width: 50 }} />
                        {/* @ts-expect-error 123 */}
                    <p>Добро пожаловать, {user.name}</p>
                    {/* <button onClick={handleLogout}>Выйти</button> */}
                </div>
            ) : (
                <button onClick={handleLogin} disabled={isLoading}>
                    {isLoading ? 'Загрузка...' : 'Войти с гугла 2'}
                </button>
            )}
        </div>
    );
};

export default LoginButton;
        
        
        
        
