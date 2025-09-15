import { useQuery } from '@tanstack/react-query';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const fetchUserData = async (userId: string, accessToken: string) => {
  const res = await fetch(`${apiUrl}/user/getById/${userId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Ошибка при получении данных пользователя');
  }
  
  return res.json();
};

export const useUserData = (userId: string | null, accessToken: string | null) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUserData(userId!, accessToken!),
    enabled: !!userId && !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  });
}; 