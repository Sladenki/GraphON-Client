/**
 * Сервис для работы с аналитикой посещаемости
 * 
 * Предоставляет методы для получения:
 * - Общей статистики
 * - DAU (Daily Active Users)
 * - WAU (Weekly Active Users)
 * - MAU (Monthly Active Users)
 * - Новых пользователей
 */

import { axiosAuth } from "@/api/interceptors";

/**
 * Общая статистика посещаемости
 */
export interface OverallAnalytics {
  totalUsers: number;
  dau: {
    today: number;
    yesterday: number;
    change: number; // Процент изменения
  };
  wau: number;
  mau: number;
  newUsersToday: number;
}

/**
 * DAU для конкретной даты
 */
export interface DauAnalytics {
  date: string;
  dau: number;
}

/**
 * WAU для периода
 */
export interface WauAnalytics {
  startDate: string;
  endDate: string;
  wau: number;
}

/**
 * MAU для месяца
 */
export interface MauAnalytics {
  month: number;
  year: number;
  mau: number;
}

/**
 * Новые пользователи за день
 */
export interface NewUsersAnalytics {
  date: string;
  newUsers: number;
}

export const AnalyticsService = {
  /**
   * Получить общую статистику
   * 
   * @returns Общая статистика посещаемости
   */
  async getOverallAnalytics(): Promise<OverallAnalytics> {
    const { data } = await axiosAuth.get<OverallAnalytics>('/analytics/overall');
    return data;
  },

  /**
   * Получить DAU для конкретной даты
   * 
   * @param date - Дата в формате YYYY-MM-DD
   * @returns Количество активных пользователей за день
   */
  async getDau(date: string): Promise<DauAnalytics> {
    const { data } = await axiosAuth.get<DauAnalytics>(`/analytics/dau`, {
      params: { date }
    });
    return data;
  },

  /**
   * Получить WAU для периода
   * 
   * @param date - Конечная дата периода (YYYY-MM-DD)
   * @returns Уникальные пользователи за 7 дней
   */
  async getWau(date: string): Promise<WauAnalytics> {
    const { data } = await axiosAuth.get<WauAnalytics>(`/analytics/wau`, {
      params: { date }
    });
    return data;
  },

  /**
   * Получить MAU для месяца
   * 
   * @param month - Номер месяца (1-12)
   * @param year - Год (2024)
   * @returns Уникальные пользователи за месяц
   */
  async getMau(month: number, year: number): Promise<MauAnalytics> {
    const { data } = await axiosAuth.get<MauAnalytics>(`/analytics/mau`, {
      params: { month, year }
    });
    return data;
  },

  /**
   * Получить количество новых пользователей за день
   * 
   * @param date - Дата в формате YYYY-MM-DD
   * @returns Количество новых пользователей
   */
  async getNewUsers(date: string): Promise<NewUsersAnalytics> {
    const { data } = await axiosAuth.get<NewUsersAnalytics>(`/analytics/new-users`, {
      params: { date }
    });
    return data;
  },

  /**
   * Получить DAU за период (для графиков)
   * 
   * @param startDate - Начальная дата
   * @param endDate - Конечная дата
   * @returns Массив DAU по дням
   */
  async getDauRange(startDate: string, endDate: string): Promise<DauAnalytics[]> {
    const { data } = await axiosAuth.get<DauAnalytics[]>(`/analytics/dau/range`, {
      params: { startDate, endDate }
    });
    return data;
  },
};

