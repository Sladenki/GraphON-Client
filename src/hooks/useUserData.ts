import { useQuery } from '@tanstack/react-query';
import { UserService } from '@/services/user.service';

const fetchUserData = async () => {
  // Получаем userId из localStorage
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  
  if (!userId) {
    throw new Error('User ID not found');
  }
  
  // Используем getById вместо /user/profile
  const data = await UserService.getById(userId);
  return data;
};

export const useUserData = () => {
  // Проверяем наличие токена и userId перед выполнением запроса
  const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false;
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  
  return useQuery({
    queryKey: ['user', 'getById', userId],
    queryFn: fetchUserData,
    enabled: hasToken && !!userId, // Запрос выполняется только если есть токен и userId
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
    refetchOnWindowFocus: false, // Не обновляем при фокусе окна
  });
}; 