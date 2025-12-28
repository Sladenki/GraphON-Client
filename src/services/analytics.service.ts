/**
 * Сервис для работы с аналитикой
 * 
 * Предоставляет методы для получения статистики
 */

import { axiosAuth } from "@/api/interceptors";

export const AnalyticsService = {
  /**
   * Получить общую статистику
   * 
   * @returns Статистика: общее количество пользователей, активные пользователи сегодня, скачивания
   */
  async getStats(): Promise<{ totalUsers: number; activeUsersToday: number; downloads: number }> {
    const { data } = await axiosAuth.get<{ totalUsers: number; activeUsersToday: number; downloads: number }>('/analytics/stats');
    return data;
  },
};

