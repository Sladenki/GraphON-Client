'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { UserService } from '@/services/user.service';
import { RelationshipsService } from '@/services/relationships.service';
import { notifySuccess, notifyError } from '@/lib/notifications';
import { useQueryClient } from '@tanstack/react-query';
import ActionButton from '@/components/ui/ActionButton/ActionButton';
import { UserPlus, X, Check, XCircle } from 'lucide-react';
import styles from './FriendRequestNotification.module.scss';

interface FriendRequestNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  fromUserId: string;
}

function resolveAvaUrl(avaPath?: string) {
  if (!avaPath) return '';
  const s = String(avaPath).trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  const base = process.env.NEXT_PUBLIC_S3_URL || process.env.NEXT_PUBLIC_API_URL || '';
  if (!base) return s;
  const normalizedBase = base.replace(/\/+$/, '');
  const normalizedPath = s.replace(/^\/+/, '');
  return `${normalizedBase}/${normalizedPath}`;
}

function initialsFromUser(u: { firstName?: string; lastName?: string; username?: string }) {
  const first = (u.firstName || '').trim();
  const last = (u.lastName || '').trim();
  const user = (u.username || '').trim();
  const a = first ? first[0] : user ? user[0] : '?';
  const b = last ? last[0] : '';
  return `${a}${b}`.toUpperCase();
}

function fullNameFromUser(u: { firstName?: string; lastName?: string; username?: string }) {
  const first = (u.firstName || '').trim();
  const last = (u.lastName || '').trim();
  const combined = `${first} ${last}`.trim();
  return combined || (u.username ? `@${u.username}` : 'Пользователь');
}

export const FriendRequestNotification: React.FC<FriendRequestNotificationProps> = ({
  isOpen,
  onClose,
  fromUserId,
}) => {
  const queryClient = useQueryClient();

  // Загружаем данные пользователя
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', 'getById', fromUserId],
    queryFn: () => UserService.getById(fromUserId),
    enabled: isOpen && !!fromUserId,
    staleTime: 5 * 60_000,
  });

  const invalidateSocial = () => {
    queryClient.invalidateQueries({ queryKey: ['social', 'friends'] });
    queryClient.invalidateQueries({ queryKey: ['social', 'followers'] });
    queryClient.invalidateQueries({ queryKey: ['social', 'following'] });
  };

  const acceptMutation = useMutation({
    mutationFn: () => RelationshipsService.accept(fromUserId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['social', 'followers'] });
      await queryClient.cancelQueries({ queryKey: ['social', 'friends'] });

      const previousFollowers = queryClient.getQueryData(['social', 'followers']);
      const previousFriends = queryClient.getQueryData(['social', 'friends']);

      // Оптимистично обновляем
      queryClient.setQueryData(['social', 'followers'], (old: any) => {
        if (!old) return old;
        const pages = old.pages || [];
        return {
          ...old,
          pages: pages.map((page: any) => ({
            ...page,
            items: (page.items || []).filter((id: string) => id !== fromUserId),
          })),
        };
      });

      queryClient.setQueryData(['social', 'friends'], (old: any) => {
        if (!old) return old;
        const pages = old.pages || [];
        if (pages.length === 0) {
          return {
            ...old,
            pages: [{ items: [fromUserId], nextCursor: undefined }],
          };
        }
        const firstPage = pages[0];
        const existingItems = firstPage.items || [];
        if (existingItems.includes(fromUserId)) return old;
        return {
          ...old,
          pages: [
            { ...firstPage, items: [fromUserId, ...existingItems] },
            ...pages.slice(1),
          ],
        };
      });

      return { previousFollowers, previousFriends };
    },
    onSuccess: () => {
      notifySuccess('Заявка принята');
      invalidateSocial();
      onClose();
    },
    onError: (e: any, _, context) => {
      if (context?.previousFollowers) {
        queryClient.setQueryData(['social', 'followers'], context.previousFollowers);
      }
      if (context?.previousFriends) {
        queryClient.setQueryData(['social', 'friends'], context.previousFriends);
      }
      notifyError('Не удалось принять заявку', e?.response?.data?.message || e?.message);
    },
  });

  const declineMutation = useMutation({
    mutationFn: () => RelationshipsService.decline(fromUserId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['social', 'followers'] });

      const previousFollowers = queryClient.getQueryData(['social', 'followers']);

      queryClient.setQueryData(['social', 'followers'], (old: any) => {
        if (!old) return old;
        const pages = old.pages || [];
        return {
          ...old,
          pages: pages.map((page: any) => ({
            ...page,
            items: (page.items || []).filter((id: string) => id !== fromUserId),
          })),
        };
      });

      return { previousFollowers };
    },
    onSuccess: () => {
      notifySuccess('Заявка отклонена');
      invalidateSocial();
      onClose();
    },
    onError: (e: any, _, context) => {
      if (context?.previousFollowers) {
        queryClient.setQueryData(['social', 'followers'], context.previousFollowers);
      }
      notifyError('Не удалось отклонить заявку', e?.response?.data?.message || e?.message);
    },
  });

  const handleAccept = () => {
    acceptMutation.mutate();
  };

  const handleDecline = () => {
    declineMutation.mutate();
  };

  if (!isOpen) return null;

  const avaUrl = resolveAvaUrl((user as any)?.avaPath);
  const fullName = user ? fullNameFromUser(user) : 'Пользователь';
  const username = user?.username ? `@${user.username}` : '';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
          <X size={20} />
        </button>

        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <UserPlus size={32} />
          </div>

          <h3 className={styles.title}>Новая заявка в друзья</h3>

          {isLoading ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : (
            <>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  {avaUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avaUrl}
                      alt={fullName}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '';
                      }}
                    />
                  ) : (
                    <span>{initialsFromUser(user || {})}</span>
                  )}
                </div>
                <div className={styles.userDetails}>
                  <div className={styles.userName}>{fullName}</div>
                  {username && <div className={styles.userUsername}>{username}</div>}
                </div>
              </div>

              <div className={styles.actions}>
                <ActionButton
                  label="Принять"
                  variant="primary"
                  icon={<Check size={18} />}
                  onClick={handleAccept}
                  disabled={acceptMutation.isPending || declineMutation.isPending}
                  className={styles.acceptButton}
                />
                <ActionButton
                  label="Отклонить"
                  variant="danger"
                  icon={<XCircle size={18} />}
                  onClick={handleDecline}
                  disabled={acceptMutation.isPending || declineMutation.isPending}
                  className={styles.declineButton}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

