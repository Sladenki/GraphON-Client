'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from './NotificationsPage.module.scss';
import { useAuth } from '@/providers/AuthProvider';
import { EmptyState } from '@/components/global/EmptyState/EmptyState';
import { NotificationService } from '@/services/notification.service';
import type { INotification } from '@/types/notification.interface';
import { notifyError, notifySuccess } from '@/lib/notifications';

const LIMIT = 50;

export default function NotificationsPage() {
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();
  const [skip, setSkip] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [accumulatedNotifications, setAccumulatedNotifications] = useState<INotification[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationsQuery = useQuery({
    queryKey: ['notifications', { skip, limit: LIMIT, unreadOnly }],
    queryFn: () => NotificationService.getNotifications({ limit: LIMIT, skip, unreadOnly }),
    enabled: isLoggedIn,
    staleTime: 15_000,
  });

  // Накопление уведомлений при загрузке новых страниц
  useEffect(() => {
    if (notificationsQuery.data) {
      if (skip === 0) {
        // Первая загрузка или сброс - заменяем все
        setAccumulatedNotifications(notificationsQuery.data.notifications);
      } else {
        // Дополнительная загрузка - добавляем к существующим
        setAccumulatedNotifications((prev) => [...prev, ...notificationsQuery.data.notifications]);
      }
      setTotalCount(notificationsQuery.data.total);
      setUnreadCount(notificationsQuery.data.unreadCount);
    }
  }, [notificationsQuery.data, skip]);

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => NotificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      notifySuccess('Уведомление отмечено как прочитанное');
    },
    onError: (e: any) => {
      notifyError('Не удалось отметить уведомление', e?.response?.data?.message || e?.message);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => NotificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      notifySuccess('Все уведомления отмечены как прочитанные');
    },
    onError: (e: any) => {
      notifyError('Не удалось отметить все уведомления', e?.response?.data?.message || e?.message);
    },
  });

  if (!isLoggedIn) {
    return (
      <div className={styles.page}>
        <EmptyState
          message="Уведомления доступны после входа"
          subMessage="Войдите в аккаунт, чтобы видеть заявки и активность друзей."
        />
      </div>
    );
  }

  const handleLoadMore = () => {
    setSkip((prev) => prev + LIMIT);
  };

  const handleToggleUnreadOnly = () => {
    setUnreadOnly((prev) => !prev);
    setSkip(0); // Сбрасываем пагинацию при изменении фильтра
    setAccumulatedNotifications([]); // Очищаем накопленные данные
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'только что';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин. назад`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч. назад`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} дн. назад`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  };

  const getNotificationTitle = (notification: INotification): string => {
    const userName = notification.fromUser 
      ? `${notification.fromUser.firstName} ${notification.fromUser.lastName}`.trim() || `@${notification.fromUser.username}`
      : 'Пользователь';
    
    switch (notification.type) {
      case 'FRIEND_REQUEST':
        return 'Заявка в друзья';
      case 'FRIEND_ACCEPTED':
        return 'Заявка принята';
      case 'EVENT_INVITATION':
        return 'Приглашение на событие';
      case 'EVENT_REMINDER':
        return 'Напоминание о событии';
      case 'COMMENT':
        return 'Новый комментарий';
      case 'LIKE':
        return 'Нравится';
      case 'SYSTEM':
        return 'Системное уведомление';
      default:
        return 'Уведомление';
    }
  };

  const getNotificationMessage = (notification: INotification): string => {
    const userName = notification.fromUser 
      ? `${notification.fromUser.firstName} ${notification.fromUser.lastName}`.trim() || `@${notification.fromUser.username}`
      : 'Пользователь';
    
    switch (notification.type) {
      case 'FRIEND_REQUEST':
        return `${userName} хочет добавить вас в друзья`;
      case 'FRIEND_ACCEPTED':
        return `${userName} принял(а) вашу заявку в друзья`;
      case 'EVENT_INVITATION':
        return `${userName} приглашает вас на событие`;
      case 'EVENT_REMINDER':
        return 'Напоминание о предстоящем событии';
      case 'COMMENT':
        return `${userName} прокомментировал(а) ваш пост`;
      case 'LIKE':
        return `${userName} понравился ваш пост`;
      case 'SYSTEM':
        return 'Системное уведомление';
      default:
        return 'У вас новое уведомление';
    }
  };

  const resolveAvaUrl = (avaPath?: string): string => {
    if (!avaPath) return '';
    const s = String(avaPath).trim();
    if (!s) return '';
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    const base = process.env.NEXT_PUBLIC_S3_URL || process.env.NEXT_PUBLIC_API_URL || '';
    if (!base) return s;
    const normalizedBase = base.replace(/\/+$/, '');
    const normalizedPath = s.replace(/^\/+/, '');
    return `${normalizedBase}/${normalizedPath}`;
  };

  const initialsFromUser = (user: { firstName?: string; lastName?: string; username?: string }): string => {
    const first = (user.firstName || '').trim();
    const last = (user.lastName || '').trim();
    const username = (user.username || '').trim();
    const a = first ? first[0] : username ? username[0] : '?';
    const b = last ? last[0] : '';
    return `${a}${b}`.toUpperCase();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Уведомления</h1>
        {unreadCount > 0 && (
          <p className={styles.subtitle}>
            У вас {unreadCount} непрочитанных {unreadCount === 1 ? 'уведомление' : unreadCount < 5 ? 'уведомления' : 'уведомлений'}
          </p>
        )}
      </div>

      <div className={styles.panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className={styles.sectionTitle}>Уведомления</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleToggleUnreadOnly}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: `1px solid ${unreadOnly ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.2)'}`,
                background: unreadOnly ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                color: 'var(--ink)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Только непрочитанные
            </button>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(var(--primary-rgb), 0.2)',
                  background: 'transparent',
                  color: 'var(--ink)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Прочитать все
              </button>
            )}
          </div>
        </div>

        {notificationsQuery.isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-muted)' }}>
            Загрузка уведомлений...
          </div>
        ) : notificationsQuery.isError ? (
          <div style={{ marginTop: 12 }}>
            <EmptyState 
              message="Ошибка загрузки" 
              subMessage={notificationsQuery.error?.message || 'Не удалось загрузить уведомления'} 
            />
          </div>
        ) : accumulatedNotifications.length === 0 ? (
          <div style={{ marginTop: 12 }}>
            <EmptyState 
              message={unreadOnly ? "Нет непрочитанных уведомлений" : "Пока тихо"} 
              subMessage={unreadOnly ? "Все уведомления прочитаны" : "Когда появятся уведомления — они будут здесь."} 
            />
          </div>
        ) : (
          <>
            <div className={styles.list}>
              {accumulatedNotifications.map((notification: INotification) => {
                const avaUrl = notification.fromUser ? resolveAvaUrl(notification.fromUser.avaPath) : '';
                
                return (
                  <div 
                    key={notification._id} 
                    className={styles.row}
                    style={{ 
                      opacity: notification.isRead ? 0.7 : 1,
                      borderLeft: notification.isRead ? 'none' : '3px solid var(--primary)',
                    }}
                  >
                    {notification.fromUser && (
                      <div className={styles.avatar} aria-hidden="true" style={{ flexShrink: 0 }}>
                        {avaUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            className={styles.avatarImg}
                            src={avaUrl}
                            alt=""
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '';
                            }}
                          />
                        ) : (
                          <span>{initialsFromUser(notification.fromUser)}</span>
                        )}
                      </div>
                    )}
                    <div className={styles.userMain} style={{ flex: 1 }}>
                      <div className={styles.fullName}>{getNotificationTitle(notification)}</div>
                      <div className={styles.username} style={{ marginTop: 4 }}>
                        {getNotificationMessage(notification)}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: 'var(--ink-muted)', 
                        marginTop: 8 
                      }}>
                        {formatDate(notification.createdAt)}
                      </div>
                    </div>
                    <div className={styles.actions}>
                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={() => markAsReadMutation.mutate(notification._id)}
                          disabled={markAsReadMutation.isPending}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '16px',
                            border: '1px solid rgba(var(--primary-rgb), 0.2)',
                            background: 'transparent',
                            color: 'var(--ink)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Прочитано
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {accumulatedNotifications.length < totalCount && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={notificationsQuery.isFetching}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '20px',
                    border: '1px solid rgba(var(--primary-rgb), 0.2)',
                    background: 'transparent',
                    color: 'var(--ink)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {notificationsQuery.isFetching ? 'Загрузка...' : 'Загрузить ещё'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


