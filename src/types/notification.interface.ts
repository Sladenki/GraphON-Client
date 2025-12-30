export interface INotificationFromUser {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  avaPath: string;
}

export interface INotification {
  _id: string;
  userId: string;
  type: NotificationType;
  payload: Record<string, any>; // Например, { fromUserId: "..." } для FRIEND_REQUEST
  isRead: boolean;
  createdAt: string;
  fromUser?: INotificationFromUser; // Информация о пользователе, от которого пришло уведомление
}

export type NotificationType = 
  | 'FRIEND_REQUEST'
  | 'FRIEND_ACCEPTED'
  | 'EVENT_INVITATION'
  | 'EVENT_REMINDER'
  | 'COMMENT'
  | 'LIKE'
  | 'SYSTEM';

export interface NotificationListParams {
  limit?: number;
  skip?: number;
  unreadOnly?: boolean;
}

export interface NotificationListResponse {
  notifications: INotification[];
  total: number;
  unreadCount: number;
  limit: number;
  skip: number;
}

