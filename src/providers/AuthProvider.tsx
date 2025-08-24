'use client';
import { createContext, useState, useEffect, useContext } from 'react';
import { IUser } from '@/types/user.interface';
import { useUserData } from '@/hooks/useUserData';

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
    refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    user: null,
    setUser: () => {},
    login: () => {},
    logout: () => {},
    loading: true,
    error: null,
    refreshUser: () => {},
});

const apiUrl = process.env.NEXT_PUBLIC_API_URL; 

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    // Используем React Query для получения данных пользователя
    const { data: userData, isLoading: userLoading, error: userError, refetch: refetchUser } = useUserData(userId, accessToken);

    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);
            try {
                if (typeof window !== 'undefined') {
                    const params = new URLSearchParams(window.location.search);
                    const accessTokenParam = params.get('accessToken');

                    if (accessTokenParam) {
                        localStorage.setItem('accessToken', accessTokenParam);
                        sessionStorage.setItem('accessToken', accessTokenParam);
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
                                setUserId(decodedToken.sub);
                                setAccessToken(storedToken);
                                setIsLoggedIn(true);
                            } else {
                                // Очищаем токен из обоих хранилищ
                                localStorage.removeItem('accessToken');
                                sessionStorage.removeItem('accessToken');
                                setIsLoggedIn(false);
                            }
                        } catch (decodeError) {
                            console.error("Ошибка декодирования токена:", decodeError);
                            localStorage.removeItem('accessToken');
                            sessionStorage.removeItem('accessToken');
                            setIsLoggedIn(false);
                        }
                    } else {
                        setIsLoggedIn(false);
                    }
                }
            } catch (error: any) {
                setError(error.message);
                console.error("Ошибка при проверке авторизации:", error);
                setIsLoggedIn(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Обновляем пользователя когда данные загружены
    useEffect(() => {
        if (userData) {
            setUser(userData);
        }
    }, [userData]);

    // Обновляем состояние ошибки
    useEffect(() => {
        if (userError) {
            setError(userError.message);
            localStorage.removeItem('accessToken');
            sessionStorage.removeItem('accessToken');
            setIsLoggedIn(false);
            setUser(null);
        }
    }, [userError]);

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

    // Объединяем состояния загрузки
    const isLoading = loading || (isLoggedIn && userLoading);

    const refreshUser = () => {
        if (userId && accessToken) {
            refetchUser();
        }
    };

    const value = { isLoggedIn, user, setUser, login, logout, loading: isLoading, error, refreshUser }; // Передаем loading в контекст

    return (
        <AuthContext value={value}>
            {!isLoading && children} {/* Отображаем индикатор загрузки */}
        </AuthContext>
    );
};

export const useAuth = () => useContext(AuthContext);