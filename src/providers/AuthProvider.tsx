'use client';
import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { IUser } from '@/types/user.interface';
import { useUserData } from '@/hooks/useUserData';
import { UserService } from '@/services/user.service';

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
    const hasSyncedLocalDataRef = useRef(false);

    // Используем React Query для получения данных пользователя
    // useUserData автоматически проверяет авторизацию через API
    const { data: userData, isLoading: userLoading, error: userError, refetch: refetchUser } = useUserData();

    useEffect(() => {
        // Обрабатываем code из URL (если есть) - токен уже в cookie
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');

            if (code) {
                // Код пришел, токен уже в cookie
                // Очищаем URL от кода
                window.history.replaceState({}, document.title, window.location.pathname);
                // Обновляем данные пользователя после авторизации
                refetchUser();
            }
        }
    }, [refetchUser]);

    // Обновляем пользователя и состояние авторизации когда данные загружены
    useEffect(() => {
        if (userData) {
            setUser(userData);
            setIsLoggedIn(true);
            setError(null);
        }
    }, [userData]);

    // Обновляем состояние ошибки
    useEffect(() => {
        if (userError) {
            // Если ошибка 401 или подобная - пользователь не авторизован
            setError(userError.message);
            setIsLoggedIn(false);
            setUser(null);
        }
    }, [userError]);

    // Обновляем состояние загрузки
    useEffect(() => {
        setLoading(userLoading);
    }, [userLoading]);

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
        if (isLoggedIn) {
            refetchUser();
        }
    };

    // Синхронизируем выбор из localStorage после авторизации
    useEffect(() => {
        if (!user || !isLoggedIn) {
            hasSyncedLocalDataRef.current = false;
            return;
        }

        if (hasSyncedLocalDataRef.current) return;
        if (typeof window === 'undefined') return;

        const localIsStudentRaw = localStorage.getItem('isStudent');
        const localSelectedGraphId = localStorage.getItem('selectedGraphId');

        const promises: Promise<void>[] = [];
        const nextUser = { ...user };
        let userChanged = false;
        const userIsStudent = (user as any).isStudent;
        const normalizedLocalIsStudent =
            localIsStudentRaw === null ? null : localIsStudentRaw === 'true';
        const normalizedLocalGraphId = localSelectedGraphId ?? null;

        if (normalizedLocalIsStudent !== null) {
            const shouldUpdateStudentFlag =
                userIsStudent === undefined ||
                userIsStudent === null ||
                userIsStudent !== normalizedLocalIsStudent;

            if (normalizedLocalIsStudent === true) {
                const shouldUpdateUniversity =
                    normalizedLocalGraphId &&
                    (nextUser as any).universityGraphId !== normalizedLocalGraphId;

                // Обновляем isStudent через отдельный endpoint
                if (shouldUpdateStudentFlag) {
                    promises.push(
                        UserService.updateIsStudent(true)
                            .then(() => {
                                (nextUser as any).isStudent = true;
                                userChanged = true;
                            })
                            .catch((error) => {
                                console.error(
                                    'Failed to sync student status from localStorage:',
                                    error
                                );
                            })
                    );
                }

                // Обновляем universityGraphId через отдельный endpoint
                if (shouldUpdateUniversity && normalizedLocalGraphId) {
                    promises.push(
                        UserService.updateUniversityGraph(normalizedLocalGraphId)
                            .then(() => {
                                (nextUser as any).universityGraphId = normalizedLocalGraphId;
                                userChanged = true;
                            })
                            .catch((error) => {
                                console.error(
                                    'Failed to sync university from localStorage:',
                                    error
                                );
                            })
                    );
                }
            } else if (shouldUpdateStudentFlag) {
                promises.push(
                    UserService.updateIsStudent(false)
                        .then(() => {
                            (nextUser as any).isStudent = false;
                            (nextUser as any).universityGraphId = undefined;
                            userChanged = true;
                        })
                        .catch((error) => {
                            console.error('Failed to sync non-student status:', error);
                        })
                );
            }
        }

        const userSelectedGraphId =
            typeof user.selectedGraphId === 'string'
                ? user.selectedGraphId
                : (user.selectedGraphId as any)?._id ?? null;

        if (
            normalizedLocalGraphId &&
            normalizedLocalGraphId !== userSelectedGraphId
        ) {
            promises.push(
                UserService.updateSelectedGraph(normalizedLocalGraphId)
                    .then(() => {
                        (nextUser as any).selectedGraphId = normalizedLocalGraphId;
                        userChanged = true;
                    })
                    .catch((error) => {
                        console.error('Failed to sync selectedGraphId from localStorage:', error);
                    })
            );
        }

        if (promises.length === 0) {
            hasSyncedLocalDataRef.current = true;
            return;
        }

        Promise.all(promises)
            .then(() => {
                if (userChanged) {
                    setUser(nextUser);
                }
            })
            .finally(() => {
                hasSyncedLocalDataRef.current = true;
            });
    }, [user, isLoggedIn, setUser]);

    const value = { isLoggedIn, user, setUser, login, logout, loading: isLoading, error, refreshUser }; // Передаем loading в контекст

    return (
        <AuthContext value={value}>
            {!isLoading && children} {/* Отображаем индикатор загрузки */}
        </AuthContext>
    );
};

export const useAuth = () => useContext(AuthContext);