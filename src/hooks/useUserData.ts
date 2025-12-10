import { useQuery } from '@tanstack/react-query';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const fetchUserData = async () => {
  // Получаем токен из localStorage (для мобильных приложений)
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Добавляем токен в заголовок, если он есть
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const res = await fetch(`${apiUrl}/user/profile`, {
    credentials: 'include', // Для веб-приложений (cookie)
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Ошибка при получении данных пользователя');
  }
  
  return res.json();
};

export const useUserData = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: fetchUserData,
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
    retry: (failureCount, error: any) => {
      // Не повторяем запрос при 401 (неавторизован)
      if (error?.message?.includes('401') || error?.message?.includes('не авторизован')) {
        return false;
      }
      // Повторяем до 2 раз для других ошибок
      return failureCount < 2;
    },
  });
}; 