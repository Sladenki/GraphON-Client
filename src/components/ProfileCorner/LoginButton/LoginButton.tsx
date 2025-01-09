// import { Capacitor } from '@capacitor/core';
// import { DefaultSystemBrowserOptions, InAppBrowser } from '@capacitor/inappbrowser';
// import { useEffect, useState } from 'react';

// const LoginButton = () => {

//     const [isLoading, setIsLoading] = useState(false);
    
//     const [isCapacitor, setIsCapacitor] = useState(true);
    
//     const handleGoogleSignIn = () => {
//         setIsLoading(true);
//         const redirectUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?isCapacitor=${isCapacitor}`;
//         console.log('redirectUrl', redirectUrl);
//         console.log('!isCapacitor (в обратном значении):', !isCapacitor);
//         window.location.href = redirectUrl;
//     };
    
//     return (
//         <button onClick={handleGoogleSignIn} disabled={isLoading}>
//             {isLoading ? "Загрузка..." : "Sign in with Google"}
//         </button>
    
//     );
    
// };
    
        
// export default LoginButton;







// import { Capacitor } from '@capacitor/core';
// import { DefaultSystemBrowserOptions, InAppBrowser } from '@capacitor/inappbrowser';
// import { useEffect, useState } from 'react';

// const LoginButton = () => {
//     const [isLoading, setIsLoading] = useState(false);
//     const [isCapacitor, setIsCapacitor] = useState(false);

//     const handleGoogleSignIn = async () => {
//         // setIsLoading(true);
//         const redirectUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?isCapacitor=${isCapacitor}`;
 
//         try {
//             if (Capacitor.getPlatform() !== 'web') { // Check if not on web
//                 await InAppBrowser.openInSystemBrowser({
//                     url: redirectUrl,
//                     options: DefaultSystemBrowserOptions,
//                 });
//             } else {
//                 window.location.href = redirectUrl;
//             }
//         } catch (error) {
//             console.error('Error opening InAppBrowser or window:', error);
//         } finally {
//             setIsLoading(false);
//         }

//     };

//     return (
//         <button onClick={handleGoogleSignIn} disabled={isLoading}>
//             {isLoading ? "Загрузка..." : "Sign in with Google"}
//         </button>
//     );
// };

// export default LoginButton;






// import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
// import { Capacitor } from '@capacitor/core';
// import { useState, useEffect } from 'react';

// const LoginButton = () => {
//     const [isLoading, setIsLoading] = useState(false);
//     const [accessToken, setAccessToken] = useState<string | null>(null);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         // Проверяем, есть ли токен в localStorage при монтировании компонента
//         const storedToken = localStorage.getItem('googleAccessToken');
//         if (storedToken) {
//             setAccessToken(storedToken);
//         }
//         if (Capacitor.getPlatform() !== 'web') {
//             // WEB
//             GoogleAuth.initialize({
//                 // clientId: Capacitor.getPlatform() === 'ios' ? 'YOUR_IOS_CLIENT_ID' : 'YOUR_ANDROID_CLIENT_ID', 
//                 clientId: Capacitor.getPlatform() === 'ios' ? '742159922482-pi77jdd5drh1ljurla6hu55k4sptf8tr.apps.googleusercontent.com' : '742159922482-pi77jdd5drh1ljurla6hu55k4sptf8tr.apps.googleusercontent.com', 
//                 scopes: ['profile', 'email'],
//                 grantOfflineAccess: true,
//             });
//         } else {
//              GoogleAuth.initialize({
//                 clientId: '742159922482-27llfsd7mg5tse43jpegd48q7d4ekab6.apps.googleusercontent.com', // ID клиента для web
//                 scopes: ['profile', 'email'],
//                 grantOfflineAccess: true,
//             });
//         }
//     }, []);

//     const handleGoogleSignIn = async () => {
//         setIsLoading(true);
//         setError(null);
//         try {
//             let accessToken: string | null = null;
//             if (Capacitor.getPlatform() === 'web') {
//                 const googleUser = await GoogleAuth.signIn();
//                 accessToken = googleUser.authentication.accessToken;
//             } else {
//                 const isCapacitor = Capacitor.getPlatform() !== 'web';
//                 const redirectUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?isCapacitor=${isCapacitor}`;

//                 const response = await fetch(redirectUrl);
//                 if (!response.ok) {
//                     const errorData = await response.json();
//                     throw new Error(errorData.message || `Ошибка авторизации: ${response.status} ${response.statusText}`);
//                 }
//                 const data = await response.json();
//                 accessToken = data.accessToken;
//                 if (!accessToken) {
//                     throw new Error("Access token not received from server");
//                 }
//             }

//             if (accessToken) {
//                 window.location.href = `/profile?accessToken=${accessToken}`;
//             }
//         } catch (error: any) {
//             console.error('Google Sign In Error', error);
//             setError(error.message || 'Ошибка входа через Google');
//             if (Capacitor.getPlatform() === 'web') {
//                 await GoogleAuth.signOut();
//             }
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // const handleGoogleSignIn = async () => {
//     //     setIsLoading(true);
//     //     try {
//     //         if (Capacitor.getPlatform() !== 'web') {
//     //             // WEB
//     //             const googleUser = await GoogleAuth.signIn();
//     //             console.log('Google User:', googleUser);
//     //             localStorage.setItem('googleAccessToken', googleUser.authentication.accessToken);
//     //             setAccessToken(googleUser.authentication.accessToken);
//     //             console.log(googleUser.authentication.accessToken)
//     //             window.location.href = `/profile?accessToken=${googleUser.authentication.accessToken}`; // Перенаправление на страницу профиля
//     //         } else {
//     //             const googleUser = await GoogleAuth.signIn();
//     //             console.log('Google User:', googleUser);
//     //             localStorage.setItem('googleAccessToken', googleUser.authentication.accessToken);
//     //             setAccessToken(googleUser.authentication.accessToken);
//     //             window.location.href = `/profile?accessToken=${googleUser.authentication.accessToken}`;
//     //         }
//     //     } catch (error) {
//     //         console.error('Google Sign In Error', error);
//     //          if (Capacitor.getPlatform() === 'web') {
//     //              await GoogleAuth.signOut();// need sign out if error on web
//     //          }
//     //     } finally {
//     //         setIsLoading(false);
//     //     }
//     // };

//     const handleSignOut = async () => {
//         try {
//             await GoogleAuth.signOut();
//             localStorage.removeItem('googleAccessToken');
//             setAccessToken(null);
//         } catch (error) {
//             console.error('Google Sign Out Error', error);
//         }
//     };

//     if (accessToken) {
//         return (
//             <div>
//                 <p>Вы вошли в систему!</p>
//                 <button onClick={handleSignOut}>Выйти</button>
//             </div>
//         );
//     }

//     return (
//         <div>
//             {error && <p style={{ color: 'red' }}>{error}</p>}
//             <button onClick={handleGoogleSignIn} disabled={isLoading}>
//                 {isLoading ? "Загрузка..." : "Sign in with Google"}
//             </button>
//         </div>
//     );
// };

// export default LoginButton;







// import { Capacitor } from '@capacitor/core';
// import { App } from '@capacitor/app';
// import { DefaultSystemBrowserOptions, InAppBrowser } from '@capacitor/inappbrowser';
// import { useEffect, useState } from 'react';
// import { Browser } from '@capacitor/browser';

// const LoginButton = () => {
//     const [isLoading, setIsLoading] = useState(false);

//     // useEffect(() => {

//     //     console.log(Capacitor.getPlatform() !== 'web', '123')

//     //     // if (Capacitor.getPlatform() !== 'web') {
//     //         App.addListener('appUrlOpen', data => {
//     //             const url = new URL(data.url);
//     //             const accessToken = url.searchParams.get('accessToken');
//     //             if (accessToken) {
//     //                 // Обработка accessToken, например, сохранение в localStorage
//     //                 localStorage.setItem('accessToken', accessToken);
//     //                 // Перенаправление на нужную страницу
//     //                 window.location.href = `/profile?accessToken=${accessToken}`;
//     //             }
//     //         });
//     //     // }
//     // }, []);

//     const handleGoogleSignIn = async () => {
//         setIsLoading(true);
//         const redirectUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;

//         try {
//             // Открываем авторизацию в Web View
//             await InAppBrowser.openInWebView({
//                 url: redirectUrl,
//                 options: {
//                     toolbarColor: '#ffffff', // Цвет панели инструментов
//                     presentationStyle: 'fullscreen', // Стиль отображения
//                     hideDefaultShareMenuItems: true, // Скрыть кнопку общего доступа
//                 } as any,
//             });

//             // Слушатель для загрузки страницы
//             InAppBrowser.addListener('browserPageLoaded', async () => {
//                 const response = await fetch(redirectUrl);
//                 const { accessToken } = await response.json();
    
//                 if (accessToken) {
//                     // Сохраняем токен
//                     localStorage.setItem('accessToken', accessToken);
    
//                     // Закрываем WebView
//                     await InAppBrowser.close();
    
//                     // Перенаправляем на страницу профиля
//                     window.location.href = `/profile?accessToken=${accessToken}`;
//                 }
//             });
    

//             // Слушатель для закрытия браузера
//             InAppBrowser.addListener('browserClosed', () => {
//                 console.log('Браузер закрыт пользователем.');
//             });
            
//             } catch (error) {
//                 console.error('Ошибка при входе через Google:', error);
//                 setIsLoading(false);
//             }

    
//     };

//     return (
//         <button onClick={handleGoogleSignIn} disabled={isLoading}>
//             {isLoading ? "Загрузка..." : "Sign in with Google"}
//         </button>
//     );
// };

// export default LoginButton;


        // try {
        //     const response = await fetch(redirectUrl);
        //     const result = await response.json();

        //     if (result.redirectURL) {
        //         await Browser.open({ url: result.redirectURL });
        //     }
        // } catch (error) {
        //     console.error("Ошибка при входе через Google:", error);
        // } finally {
        //     setIsLoading(false);
        // }

        // await Browser.open({ url: redirectUrl });

        // const appUrl = await App.getLaunchUrl();
        // if (appUrl && appUrl.url) {
        //     const url = new URL(appUrl.url);
        //     const accessToken = url.searchParams.get('accessToken');
        //     if (accessToken) {
        //         localStorage.setItem('accessToken', accessToken);
        //         window.location.href = `/profile?accessToken=${accessToken}`;
        //     }
        // }

        // try {
        //     if (Capacitor.getPlatform() !== 'web') {
        //         await Browser.open({ url: redirectUrl });

        //     } else {
        //         window.location.href = redirectUrl;
        //     }
        // } catch (error) {
        //     console.error('Error opening InAppBrowser or window:', error);
        // } finally {
        //     setIsLoading(false);
        // }



        // import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser';
        // import { Capacitor } from '@capacitor/core';
        // import React, { useState } from 'react';
        
        // const LoginButton = () => {
        //     const [isLoading, setIsLoading] = useState(false);
        
        //     const handleGoogleSignIn = async () => {
        //         setIsLoading(true);
        
        //         // URL для авторизации
        //         const redirectUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
        
        //         try {
        //             // Открываем WebView для авторизации
        //             const browser = InAppBrowser.create(redirectUrl, '_blank', {
        //                 toolbar: 'yes',
        //                 toolbarcolor: '#ffffff', // Цвет панели инструментов
        //                 presentationstyle: 'fullscreen', // Стиль отображения
        //                 hidenavigationbuttons: 'yes', // Скрыть кнопки навигации
        //                 hidespinner: 'no', // Показать спиннер загрузки
        //                 usewkwebview: 'yes', // Использование WKWebView
        //             });
        
        //             // Обрабатываем событие загрузки страницы
        //             browser.on('loadstart').subscribe(async (event) => {
        //                 const url = event.url;
        
        //                 // Проверяем, является ли URL редиректом с токеном
        //                 if (url.startsWith('com.mycompany.myapp://profile')) {
        //                     browser.close(); // Закрываем WebView
        
        //                     // Извлекаем токен из URL
        //                     const params = new URL(url).searchParams;
        //                     const accessToken = params.get('accessToken');
        
        //                     if (accessToken) {
        //                         // Сохраняем токен
        //                         localStorage.setItem('accessToken', accessToken);
        
        //                         // Перенаправляем пользователя на страницу профиля
        //                         window.location.href = `/profile?accessToken=${accessToken}`;
        //                     } else {
        //                         console.error('AccessToken не найден в редиректе.');
        //                         setIsLoading(false);
        //                     }
        //                 }
        //             });
        
        //             // Обрабатываем закрытие WebView
        //             browser.on('exit').subscribe(() => {
        //                 console.log('Пользователь закрыл WebView.');
        //                 setIsLoading(false);
        //             });
        //         } catch (error) {
        //             console.error('Ошибка при входе через Google:', error);
        //             setIsLoading(false);
        //         }
        //     };
        
        //     return (
        //         <button onClick={handleGoogleSignIn} disabled={isLoading}>
        //             {isLoading ? "Загрузка..." : "Sign in with Google"}
        //         </button>
        //     );
        // };
        
        // export default LoginButton;

        
        // -------------------------------------- 

        // import { App } from '@capacitor/app';
        // import { Browser } from '@capacitor/browser';
        // import React, { useEffect } from 'react';
        
        // const useGoogleAuth = () => {
        //     useEffect(() => {
        //         let listener: any; // Переменная для хранения слушателя
        
        //         const setupListener = async () => {
        //             listener = await App.addListener('appUrlOpen', (event: any) => {
        //                 const { url } = event;
        
        //                 // Проверяем, что URL соответствует схеме редиректа
        //                 if (url.startsWith('com.mycompany.myapp://auth/callback')) {
        //                     Browser.close();
        
        //                     // Извлекаем токен из URL
        //                     const params = new URL(url).searchParams;
        //                     const accessToken = params.get('accessToken');
        
        //                     if (accessToken) {
        //                         // Сохраняем токен
        //                         localStorage.setItem('accessToken', accessToken);
        
        //                         // Перенаправляем пользователя на страницу профиля
        //                         window.location.href = `/profile?accessToken=${accessToken}`;
        //                     } else {
        //                         console.error('AccessToken отсутствует в URL редиректа.');
        //                     }
        //                 }
        //             });
        //         };
        
        //         setupListener();
        
        //         return () => {
        //             // Убираем слушатель при размонтировании
        //             if (listener) {
        //                 listener.remove();
        //             }
        //         };
        //     }, []);
        // };
        
        // const LoginButton = () => {
        //     const handleLogin = async () => {
        //         const redirectUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
        //         // await Browser.open({ url: redirectUrl });
        //         window.location.href = redirectUrl;
        //     };
        
        //     // useGoogleAuth();
        
        //     return <button onClick={handleLogin}>Sign in with Google</button>;
        // };
        
        // export default LoginButton;





        // -----------------------------------------------

        import React, { useState } from 'react';
        import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
        
        const LoginButton = () => {
            const [user, setUser] = useState(null);
            const [isLoading, setIsLoading] = useState(false);
        
            const handleLogin = async () => {

                const redirectUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?isCapacitor=false`;

                window.location.href = redirectUrl;

                // try {
                //     setIsLoading(true);
        
                //     // Инициализация Google Auth
                //     const googleUser = await GoogleAuth.signIn();
        
                //     if (googleUser) {
                //         // @ts-expect-error 123
                //         const { idToken, email, name, imageUrl } = googleUser;
        
                //         // Сохраняем токен локально
                //         localStorage.setItem('idToken', idToken);
        
                //         // Обновляем состояние пользователя
                //         // @ts-expect-error 123
                //         setUser({ email, name, imageUrl });
        
                //         console.log('User Info:', googleUser);
                //     }
                // } catch (error) {
                //     console.error('Ошибка входа через Google:', error);
                // } finally {
                //     setIsLoading(false);
                // }
            };
        
            // const handleLogout = async () => {
            //     try {
            //         await GoogleAuth.signOut();
            //         setUser(null);
            //         localStorage.removeItem('idToken');
            //         console.log('Выход выполнен.');
            //     } catch (error) {
            //         console.error('Ошибка выхода из Google:', error);
            //     }
            // };
        
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
        
        
        
        
