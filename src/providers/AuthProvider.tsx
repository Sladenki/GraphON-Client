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
        // Обрабатываем code из URL и обмениваем на токен
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');

            if (code) {
                console.log('Code found in URL, exchanging for token...');
                exchangeCodeForToken(code);
            } else {
                console.log('No code in URL, checking existing auth...');
            }
        }
    }, []);

    const exchangeCodeForToken = async (code: string) => {
        try {
            const response = await fetch(`${apiUrl}/auth/exchange-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
                credentials: 'include', // Важно! Для работы с cookies
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to exchange code');
            }

            const data = await response.json();
            console.log('Exchange code response:', data);
            
            // Извлекаем токен
            const accessToken = data?.accessToken || data?.token || data?.access_token;
            console.log('Extracted accessToken:', accessToken ? `Token exists (length: ${accessToken.length})` : 'Token is missing');
            
            // Извлекаем данные пользователя из ответа
            const userDataFromResponse = data?.user;
            console.log('User data in response:', userDataFromResponse ? 'Yes' : 'No');
            if (userDataFromResponse) {
                console.log('User data:', userDataFromResponse);
            }

            // Сохранить токен в localStorage для мобильных приложений
            if (accessToken && typeof window !== 'undefined') {
                try {
                    // Проверяем доступность localStorage
                    if (typeof Storage === 'undefined') {
                        console.error('localStorage is not available');
                        setError('localStorage недоступен');
                        return;
                    }
                    
                    // Пробуем сохранить тестовое значение
                    try {
                        localStorage.setItem('__test__', 'test');
                        localStorage.removeItem('__test__');
                    } catch (testError) {
                        console.error('localStorage is blocked or unavailable:', testError);
                        setError('localStorage заблокирован');
                        return;
                    }
                    
                    // Сохраняем токен
                    console.log('Attempting to save token to localStorage...');
                    localStorage.setItem('accessToken', accessToken);
                    console.log('localStorage.setItem called');
                    
                    // Сохраняем userId если он есть в ответе
                    if (userDataFromResponse?._id) {
                        localStorage.setItem('userId', userDataFromResponse._id);
                        console.log('UserId saved to localStorage:', userDataFromResponse._id);
                    }
                    
                    // Небольшая задержка перед проверкой
                    await new Promise(resolve => setTimeout(resolve, 10));
                    
                    // Проверяем, что токен действительно сохранился
                    const savedToken = localStorage.getItem('accessToken');
                    console.log('Verification - token in localStorage:', savedToken ? `Saved successfully (length: ${savedToken.length})` : 'NOT SAVED!');
                    
                    if (!savedToken || savedToken !== accessToken) {
                        console.error('Token was not saved correctly!');
                        console.error('Expected:', accessToken);
                        console.error('Got:', savedToken);
                        setError('Токен не был сохранен');
                    } else {
                        console.log('Token successfully saved and verified!');
                    }
                } catch (storageError: any) {
                    console.error('Error saving token to localStorage:', storageError);
                    console.error('Error name:', storageError?.name);
                    console.error('Error message:', storageError?.message);
                    setError(`Ошибка при сохранении токена: ${storageError?.message || 'Неизвестная ошибка'}`);
                }
            } else {
                console.warn('Cannot save token: accessToken is missing or window is undefined');
                console.warn('accessToken:', accessToken);
                console.warn('window:', typeof window);
            }

            // Убрать code из URL
            window.history.replaceState({}, document.title, window.location.pathname);

            // Если данные пользователя пришли вместе с токеном, используем их
            if (userDataFromResponse) {
                console.log('Using user data from exchange-code response');
                // Преобразуем данные пользователя в формат, ожидаемый приложением
                // Добавляем значения по умолчанию для полей, которые могут отсутствовать
                const user: User = {
                    _id: userDataFromResponse._id,
                    role: userDataFromResponse.role as any, // Преобразуем строку в UserRole
                    firstName: userDataFromResponse.firstName || '',
                    lastName: userDataFromResponse.lastName || '',
                    username: userDataFromResponse.username || '',
                    avaPath: userDataFromResponse.avaPath || '',
                    telegramId: userDataFromResponse.telegramId || '',
                    email: '', // Email может отсутствовать в данных от Telegram
                    selectedGraphId: null,
                    graphSubsNum: 0,
                    postsNum: 0,
                    attentedEventsNum: 0,
                };
                console.log('=== SETTING USER FROM EXCHANGE-CODE ===');
                console.log('User object:', user);
                console.log('Calling setUser(user)...');
                setUser(user);
                console.log('Calling setIsLoggedIn(true)...');
                setIsLoggedIn(true);
                console.log('Calling setError(null)...');
                setError(null);
                
                // Проверяем состояние сразу после установки
                console.log('State should be updated now');
                console.log('localStorage accessToken:', localStorage.getItem('accessToken') ? 'EXISTS' : 'MISSING');
                
                // Делаем запрос для получения полных данных пользователя по ID
                // Используем setTimeout чтобы дать время токену сохраниться в localStorage
                const userId = userDataFromResponse._id;
                setTimeout(async () => {
                    console.log('Fetching full user data by ID in background...');
                    const tokenCheck = localStorage.getItem('accessToken');
                    console.log('Token check before getById:', tokenCheck ? 'EXISTS' : 'MISSING');
                    
                    if (userId) {
                        try {
                            const fullUserData = await UserService.getById(userId);
                            console.log('Full user data received:', fullUserData);
                            
                            // Проверяем и устанавливаем дефолтные значения для новых пользователей
                            const needsUpdate: { selectedGraphId?: string; universityGraphId?: string } = {};
                            
                            // Если selectedGraphId отсутствует, устанавливаем дефолтный
                            const currentSelectedGraphId = fullUserData.selectedGraphId 
                                ? (typeof fullUserData.selectedGraphId === 'string' 
                                    ? fullUserData.selectedGraphId 
                                    : (fullUserData.selectedGraphId as any)?._id)
                                : null;
                            
                            if (!currentSelectedGraphId) {
                                // Проверяем localStorage для дефолтного значения
                                const localSelectedGraphId = typeof window !== 'undefined' 
                                    ? localStorage.getItem('selectedGraphId') 
                                    : null;
                                
                                if (localSelectedGraphId) {
                                    needsUpdate.selectedGraphId = localSelectedGraphId;
                                } else {
                                    // Устанавливаем дефолтный граф для не-студентов
                                    const { NON_STUDENT_DEFAULT_GRAPH_ID } = await import('@/constants/nonStudentDefaults');
                                    needsUpdate.selectedGraphId = NON_STUDENT_DEFAULT_GRAPH_ID;
                                }
                            }
                            
                            // Если universityGraphId отсутствует и пользователь студент
                            const currentUniversityGraphId = (fullUserData as any).universityGraphId;
                            if (!currentUniversityGraphId && (fullUserData as any).isStudent === true) {
                                // Проверяем localStorage
                                const localSelectedGraphId = typeof window !== 'undefined' 
                                    ? localStorage.getItem('selectedGraphId') 
                                    : null;
                                
                                if (localSelectedGraphId) {
                                    needsUpdate.universityGraphId = localSelectedGraphId;
                                }
                            }
                            
                            // Обновляем на сервере, если нужно
                            if (Object.keys(needsUpdate).length > 0) {
                                const updatePromises: Promise<void>[] = [];
                                
                                if (needsUpdate.selectedGraphId) {
                                    updatePromises.push(
                                        UserService.updateSelectedGraph(needsUpdate.selectedGraphId)
                                            .then(() => {
                                                console.log('Default selectedGraphId set:', needsUpdate.selectedGraphId);
                                            })
                                            .catch((err) => {
                                                console.error('Failed to set default selectedGraphId:', err);
                                            })
                                    );
                                }
                                
                                if (needsUpdate.universityGraphId) {
                                    updatePromises.push(
                                        UserService.updateUniversityGraph(needsUpdate.universityGraphId)
                                            .then(() => {
                                                console.log('Default universityGraphId set:', needsUpdate.universityGraphId);
                                            })
                                            .catch((err) => {
                                                console.error('Failed to set default universityGraphId:', err);
                                            })
                                    );
                                }
                                
                                await Promise.all(updatePromises);
                                
                                // Получаем обновленные данные
                                const updatedUserData = await UserService.getById(userId);
                                setUser((prevUser) => ({ ...prevUser, ...updatedUserData } as User));
                            } else {
                                // Обновляем пользователя полными данными (со статистикой и т.д.)
                                setUser((prevUser) => ({ ...prevUser, ...fullUserData } as User));
                            }
                        } catch (err) {
                            console.warn('Background getById fetch failed (non-critical):', err);
                            // Не устанавливаем ошибку, так как основные данные уже есть
                        }
                    }
                }, 200);
            } else {
                console.log('No user data in response from exchange-code');
                // Если нет данных пользователя в ответе, но есть токен, 
                // попробуем получить userId из токена или использовать другой метод
                // В этом случае пользователь должен быть авторизован через другой метод
            }
        } catch (error) {
            console.error('Error exchanging code:', error);
            setError(error instanceof Error ? error.message : 'Ошибка при обмене кода');
            // Убрать code из URL даже при ошибке
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    };

    // Обновляем пользователя и состояние авторизации когда данные загружены
    // НО только если пользователь еще не установлен из exchange-code
    useEffect(() => {
        if (userData) {
            // Сохраняем userId в localStorage если его еще нет
            if (userData._id && typeof window !== 'undefined') {
                const currentUserId = localStorage.getItem('userId');
                if (currentUserId !== userData._id) {
                    localStorage.setItem('userId', userData._id);
                }
            }
            
            // Если пользователь уже установлен из exchange-code, обновляем только данные
            // (например, статистика, selectedGraphId и т.д.)
            if (isLoggedIn && user) {
                console.log('Updating user data from useUserData hook (user already logged in)');
                // Объединяем существующие данные с новыми (приоритет новым данным)
                setUser({ ...user, ...userData });
            } else if (!isLoggedIn) {
                // Если пользователь не авторизован, устанавливаем данные из useUserData
                console.log('Setting user from useUserData hook (user not logged in)');
                setUser(userData);
                setIsLoggedIn(true);
                setError(null);
            }
        }
    }, [userData]);

    // Обновляем состояние ошибки
    useEffect(() => {
        if (userError) {
            console.log('User error from useUserData:', userError);
            // Если пользователь уже авторизован через exchange-code, не сбрасываем состояние
            // Ошибка может быть временной (например, токен еще не сохранился)
            if (!isLoggedIn) {
                console.log('User not logged in, setting error state');
                setError(userError.message);
                setIsLoggedIn(false);
                setUser(null);
            } else {
                console.log('User already logged in, ignoring error (may be temporary)');
                // Не сбрасываем состояние, если пользователь уже авторизован
            }
        }
    }, [userError, isLoggedIn]);

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
            // Получаем токен из localStorage для отправки в заголовке
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
            
            const res = await fetch(`${apiUrl}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Ошибка при выходе из системы');
            }

            // Очищаем токен и userId из localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userId');
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

    const refreshUser = async () => {
        if (isLoggedIn && user?._id) {
            try {
                const fullUserData = await UserService.getById(user._id);
                setUser((prevUser) => ({ ...prevUser, ...fullUserData } as User));
            } catch (err) {
                console.error('Failed to refresh user data:', err);
            }
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

    // Не скрываем children во время загрузки, если пользователь уже авторизован
    // Это позволяет UI обновиться сразу после установки пользователя из exchange-code
    const shouldShowChildren = !isLoading || isLoggedIn;
    
    return (
        <AuthContext value={value}>
            {shouldShowChildren ? children : null}
        </AuthContext>
    );
};

export const useAuth = () => useContext(AuthContext);