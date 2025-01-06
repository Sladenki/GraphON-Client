'use client';
import { useAuth } from '../../providers/AuthProvider'; // Импортируем useAuth

import { useRouter } from 'next/navigation';
import ProfileUser from './ProfileUser/ProfileUser';
import LoginButton from './LoginButton/LoginButton';

export const ProfileCorner = () => {
    const { isLoggedIn, user, logout, loading, error } = useAuth(); // Используем useContext для доступа к контексту
    
    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>ProfileCorner - {error}</div>; // Отображаем сообщение об ошибке в компоненте
    }

    return (
        <>
            {isLoggedIn ? (
                <div>
                    {/* @ts-ignore 123 */}
                    <ProfileUser user={user} />
                </div>
            ) : (
                <LoginButton />
            )}
        </>
    );
};