'use client';
import { useAuth } from '@/providers/AuthProvider'; // Импортируем useAuth
import LoginButton from './LoginButton/LoginButton';
import ProfileUser from './ProfileUser/ProfileUser';
import { usePathname } from 'next/navigation';

const ProfileCorner = () => {
    const { user } = useAuth();
    const pathname = usePathname();

    // Скрываем компонент на странице профиля
    if (pathname === '/profile' || pathname === '/profile/') {
        return null;
    }

    return (
        <>
            {user &&  <ProfileUser user={user} />}
        </>
    );
};

export default ProfileCorner;