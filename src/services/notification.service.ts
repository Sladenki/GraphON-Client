import { axiosAuth } from "@/api/interceptors";
import { INotification, NotificationListParams, NotificationListResponse } from "@/types/notification.interface";

export const NotificationService = {
  /**
   * Получение списка уведомлений текущего пользователя
   * @param params - Параметры запроса (limit, skip, unreadOnly)
   * @returns Список уведомлений с метаданными
   */
  async getNotifications(params?: NotificationListParams): Promise<NotificationListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.limit !== undefined) {
      searchParams.set('limit', String(params.limit));
    }
    
    if (params?.skip !== undefined) {
      searchParams.set('skip', String(params.skip));
    }
    
    if (params?.unreadOnly !== undefined) {
      searchParams.set('unreadOnly', String(params.unreadOnly));
    }
    
    const queryString = searchParams.toString();
    const { data } = await axiosAuth.get<NotificationListResponse>(
      `/notifications${queryString ? `?${queryString}` : ''}`
    );
    
    return data;
  },

  /**
   * Отметить уведомление как прочитанное
   * @param notificationId - ID уведомления
   */
  async markAsRead(notificationId: string): Promise<void> {
    await axiosAuth.patch(`/notifications/${notificationId}/read`);
  },

  /**
   * Отметить все уведомления как прочитанные
   */
  async markAllAsRead(): Promise<void> {
    await axiosAuth.patch('/notifications/read-all');
  },
};

