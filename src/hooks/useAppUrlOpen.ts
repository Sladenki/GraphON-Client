'use client';

import { App } from '@capacitor/app';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export const CapacitorRedirectHandler = () => {
    const router = useRouter();
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const handleAppUrlOpen = async (data: { url: string }) => {
            const url = data.url;
            console.log("URL открыт в приложении:", url);

            if (url.startsWith('com.mycompany.myapp://profile')) {
                try {
                    const urlParams = new URLSearchParams(url.split('?')[1]);
                    const accessToken = urlParams.get('accessToken');

                    if (accessToken) {
                        console.log("Access Token:", accessToken);

                        // Сохраняем токен в localStorage (или другом хранилище)
                        localStorage.setItem('accessToken', accessToken);

                        // Очищаем параметры URL (важно для предотвращения повторной обработки)
                        // Используем setSearchParams для обновления URL без перезагрузки страницы
                        const newParams = new URLSearchParams();
                        // @ts-expect-error
                        setSearchParams(newParams);

                        // Перенаправляем на страницу профиля
                        router.push('/profile');
                    } else {
                        console.error("Access token is missing in the redirect URL.");
                        // Обработка ошибки: например, перенаправление на страницу ошибки
                        router.push('/error?message=missing_access_token');
                    }
                } catch (error) {
                    console.error("Error processing redirect URL:", error);
                    // Обработка ошибки: например, перенаправление на страницу ошибки
                    router.push('/error?message=invalid_redirect_url');
                }
            }
        };

        App.addListener('appUrlOpen', handleAppUrlOpen);

        // Обработка случая, когда приложение уже открыто и получает Deep Link
        const checkInitialUrl = async () => {
            const appUrl = await App.getLaunchUrl();
            if (appUrl && appUrl.url) {
                handleAppUrlOpen(appUrl);
            }
        };

        checkInitialUrl();

        return () => {
            App.removeAllListeners();
            console.log("Listener removed");
        };
    }, [router, setSearchParams]); // Добавляем setSearchParams в зависимости

    return null;
};


// 'use client'; 

// import { App } from '@capacitor/app';
// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// export const CapacitorRedirectHandler = () => {
//     const router = useRouter();

//     useEffect(() => {
//         const handleAppUrlOpen = async (data: { url: string }) => {
//             const url = data.url;
//             console.log("URL открыт в приложении:", url);

//             if (url.startsWith('com.mycompany.myapp://profile')) { // Проверка схемы!
//                 try {
//                     const urlParams = new URLSearchParams(url.split('?')[1]);
//                     const accessToken = urlParams.get('accessToken');

//                     if (accessToken) {
//                         // localStorage.setItem('accessToken', accessToken);

//                         // Используем router.replace для предотвращения добавления записи в историю браузера
//                         // router.replace('/profile'); 

//                         const redirectUrl = `/profile?accessToken=${accessToken}`;
//                         router.push(redirectUrl);
//                     } else {
//                         console.error("Access token is missing in the redirect URL.");
//                     }
//                 } catch (error) {
//                     console.error("Error processing redirect URL:", error);
//                 }
//             }
//         };

//         App.addListener('appUrlOpen', handleAppUrlOpen);

//         return () => {
//             App.removeAllListeners();
//             console.log("Listener removed");
//         };
//     }, [router]); // router в зависимостях

//     return null;
// };