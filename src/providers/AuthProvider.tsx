'use client';
import { createContext, useState, useEffect, useContext } from 'react';
import { IUser } from '@/types/user.interface';

interface User extends IUser {
    email: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    setUser: (user: User | null) => void;
    login: (userData: { sub: string; email: string }) => void;
    logout: () => void;
    loading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    user: null,
    setUser: () => {},
    login: () => {},
    logout: () => {},
    loading: true,
    error: null,
});

const apiUrl = process.env.NEXT_PUBLIC_API_URL; 

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null); // Добавляем состояние для ошибок

    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);
            try {
                if (typeof window !== 'undefined') {
                    const params = new URLSearchParams(window.location.search);
                    const accessToken = params.get('accessToken');

                    console.log('accessToken', accessToken)

                    if (accessToken) {
                        localStorage.setItem('accessToken', accessToken);
                        sessionStorage.setItem('accessToken', accessToken);
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }

                    // Проверяем токен в localStorage и sessionStorage
                    const localStorageToken = localStorage.getItem('accessToken');
                    const sessionStorageToken = sessionStorage.getItem('accessToken');
                    const storedToken = localStorageToken || sessionStorageToken;

                    if (storedToken) {
                        try {
                            const decodedToken = JSON.parse(atob(storedToken.split('.')[1]));
                            if (decodedToken && decodedToken.sub) {
                                await fetchUserData(decodedToken.sub, storedToken);
                            } else {
                                // Очищаем токен из обоих хранилищ
                                localStorage.removeItem('accessToken');
                                sessionStorage.removeItem('accessToken');
                            }
                        } catch (decodeError) {
                            console.error("Ошибка декодирования токена:", decodeError);
                            localStorage.removeItem('accessToken');
                            sessionStorage.removeItem('accessToken');
                        }
                    }
                }
            } catch (error: any) {
                setError(error.message);
                console.error("Ошибка при проверке авторизации:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchUserData = async (userId: string, accessToken: string) => {
            try {
                const res = await fetch(`${apiUrl}/user/getById/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Ошибка при получении данных пользователя');
                }
                const data = await res.json();
                setUser(data); // Устанавливаем полные данные пользователя
                setIsLoggedIn(true); // Устанавливаем isLoggedIn только после успешного получения данных
            } catch (error: any) {
                console.error('Ошибка получения данных пользователя:', error);
                setError(error.message);
                localStorage.removeItem('accessToken'); // Очищаем токен при ошибке
                setIsLoggedIn(false);
                setUser(null);
            }
        };

        checkAuth();
    }, []);

    const login = (userData: { sub: string; email: string }) => {
        setIsLoggedIn(true);
        setUser({
            _id: userData.sub,
            email: userData.email,
            role: 'user' as any, // Default role
            selectedGraphId: null,
            firstName: '',
            lastName: '',
            username: '',
            avaPath: '',
            telegramId: '',
            graphSubsNum: 0,
            postsNum: 0,
            attentedEventsNum: 0
        });
    };

    const logout = async () => {
        try {
            const res = await fetch(`${apiUrl}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Ошибка при выходе из системы');
            }

            localStorage.removeItem('accessToken');
            setUser(null); // Очистка состояния пользователя
            setIsLoggedIn(false); // Обновление состояния логина
        } catch (err: any) {
            console.error('Ошибка при выходе:', err);
            alert(err.message);
        }
    };

    const value = { isLoggedIn, user, setUser, login, logout, loading, error }; // Передаем loading в контекст

    return (
        <AuthContext value={value}>
            {!loading && children} {/* Отображаем индикатор загрузки */}
        </AuthContext>
    );
};

export const useAuth = () => useContext(AuthContext);