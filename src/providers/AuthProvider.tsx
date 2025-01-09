'use client';
import { createContext, useState, useEffect, useContext } from 'react';

interface AuthContextType {
    isLoggedIn: boolean;
    user: Document | null; // Тип user теперь UserDocument | null
    login: (userData: { sub: string; email: string }) => void;
    logout: () => void;
    loading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    user: null,
    login: () => {},
    logout: () => {},
    loading: true,
    error: null,
});

const apiUrl = process.env.NEXT_PUBLIC_API_URL; 

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [user, setUser] = useState<{ sub: string; email: string } | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null); // Добавляем состояние для ошибок

    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);
            try {
                if (typeof window !== 'undefined') {
                    const params = new URLSearchParams(window.location.search);
                    const accessToken = params.get('accessToken');
                    if (accessToken) {
                        localStorage.setItem('accessToken', accessToken);
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }
                    const storedToken = localStorage.getItem('accessToken');
                    if (storedToken) {
                        try {
                            const decodedToken = JSON.parse(atob(storedToken.split('.')[1]));
                            // const decodedToken = JSON.parse(storedToken);
                            if (decodedToken && decodedToken.sub) { // Проверяем наличие sub
                                await fetchUserData(decodedToken.sub, storedToken); // Вызываем функцию получения данных
                            } else {
                                localStorage.removeItem('accessToken');
                            }
                        } catch (decodeError) {
                            console.error("Ошибка декодирования токена:", decodeError);
                            localStorage.removeItem('accessToken');
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
        setUser(userData);
    };

    const logout = async () => {
        try {
            const res = await fetch(`${apiUrl}/auth/logout`, { 
                method: 'POST', // Убедитесь, что метод POST
                credentials: 'include' // Важно для отправки кук с запросом
            });

            console.log('res', res)

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || 'Ошибка при выходе из системы')
            }
            localStorage.removeItem('accessToken');
            setUser(null);
            setIsLoggedIn(false);
        } catch (err: any) {
            console.error('Ошибка при выходе:', err);
            alert(err.message) // Выводим ошибку пользователю
        }
    };

    const value = { isLoggedIn, user, login, logout, loading, error }; // Передаем loading в контекст

    console.log('value', value)

    return (
        // @ts-expect-error 123
        <AuthContext value={value}>
            {!loading && children} {/* Отображаем индикатор загрузки */}
        </AuthContext>
    );
};

export const useAuth = () => useContext(AuthContext);