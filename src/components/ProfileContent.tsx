// app/components/ProfileContent.tsx (клиентский компонент)
"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const ProfileContent = () => {
    const searchParams = useSearchParams();
    const [token, setToken] = useState(null);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('token', token);
            // @ts-expect-error 123
            setToken(token);
        }
    }, [searchParams]); // Добавьте searchParams в массив зависимостей

    return (
        <div>
            {token ? <p>Вы успешно авторизовались!</p> : <p>Авторизуйтесь</p>}
        </div>
    );
};

export default ProfileContent;