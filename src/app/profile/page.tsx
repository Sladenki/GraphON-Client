'use client';
import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/router';

export default function Profile() {
    const { isLoggedIn, user, logout, loading, error } = useAuth();
   

    // console.log('user', user)


    if(loading) {
      return <div>Loading...</div>
    }

    if(error) {
      return <div>{error}</div>
    }

    return (
        <div>
            Профиль
            {user && ( // Отображаем данные из user
                <div>
                    {/* @ts-ignore 123 */}
                    <p>ID пользователя: {user.sub}</p>
                    {/* @ts-ignore 123 */}
                    <p>Email: {user.email}</p>
                    {/* @ts-ignore 123 */}
                    <p>Имя: {user.name}</p>
                    {/* @ts-ignore 123 */}
                    <p>Аватар: <img src={user.avaPath} alt="Аватар" /></p>
                    {/* @ts-ignore 123 */}
                    <p>Количество постов: {user.postsNum}</p>
                    {/* @ts-ignore 123 */}
                    <p>Количество подписчиков: {user.followersNum}</p>
                    {/* @ts-ignore 123 */}
                    <p>Количество подписок: {user.subsNum}</p>
                    {/* Другие данные пользователя */}
                </div>
            )}
        </div>
    );
}

