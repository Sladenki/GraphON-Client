'use client';

import React, { useMemo, useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import styles from './NotificationsPage.module.scss';
import { useAuth } from '@/providers/AuthProvider';
import { EmptyState } from '@/components/global/EmptyState/EmptyState';
import { RelationshipsService } from '@/services/relationships.service';
import { UserService } from '@/services/user.service';
import type { IUser } from '@/types/user.interface';
import ActionButton from '@/components/ui/ActionButton/ActionButton';
import { notifyError, notifySuccess } from '@/lib/notifications';

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

export default function NotificationsPage() {
  const { user, isLoggedIn } = useAuth();
  const typedUser = user as IUser | null;
  const myUserId = typedUser?._id;
  const queryClient = useQueryClient();

  const followersIdsQuery = useInfiniteQuery({
    queryKey: ['social', 'followers'],
    queryFn: ({ pageParam }) => RelationshipsService.getFollowers({ limit: 200, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    enabled: isLoggedIn,
    staleTime: 15_000,
  });

  const followingIdsQuery = useInfiniteQuery({
    queryKey: ['social', 'following'],
    queryFn: ({ pageParam }) => RelationshipsService.getFollowing({ limit: 200, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    enabled: isLoggedIn,
    staleTime: 15_000,
  });

  const incomingIds = useMemo(() => (followersIdsQuery.data?.pages ?? []).flatMap((p) => p.items ?? []), [followersIdsQuery.data]);
  const outgoingIds = useMemo(() => (followingIdsQuery.data?.pages ?? []).flatMap((p) => p.items ?? []), [followingIdsQuery.data]);

  const visibleIds = useMemo(() => {
    const seen = new Set<string>();
    return [...incomingIds, ...outgoingIds].filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [incomingIds, outgoingIds]);

  const userDetailsQueries = useQueries({
    queries: visibleIds.map((id) => ({
      queryKey: ['user', 'getById', id],
      queryFn: () => UserService.getById(id),
      enabled: isLoggedIn && Boolean(id),
      staleTime: 5 * 60_000,
    })),
  });

  const usersById = useMemo(() => {
    const map = new Map<string, any>();
    visibleIds.forEach((id, idx) => {
      const data = userDetailsQueries[idx]?.data;
      if (data) map.set(id, data);
    });
    return map;
  }, [visibleIds, userDetailsQueries]);

  const invalidateSocial = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['social', 'followers'] });
    queryClient.invalidateQueries({ queryKey: ['social', 'following'] });
    queryClient.invalidateQueries({ queryKey: ['social', 'friends'] });
  }, [queryClient]);

  const acceptMutation = useMutation({
    mutationFn: (requesterUserId: string) => RelationshipsService.accept(requesterUserId),
    onMutate: async (requesterUserId: string) => {
      // Отменяем запросы для предотвращения конфликтов
      await queryClient.cancelQueries({ queryKey: ['social', 'followers'] });
      await queryClient.cancelQueries({ queryKey: ['social', 'friends'] });

      // Сохраняем предыдущие состояния для отката
      const previousFollowers = queryClient.getQueryData(['social', 'followers']);
      const previousFriends = queryClient.getQueryData(['social', 'friends']);

      // Удаляем userId из входящих заявок
      queryClient.setQueryData(['social', 'followers'], (old: any) => {
        if (!old) return old;
        const pages = old.pages || [];
        return {
          ...old,
          pages: pages.map((page: any) => ({
            ...page,
            items: (page.items || []).filter((id: string) => id !== requesterUserId),
          })),
        };
      });

      // Добавляем userId в друзья
      queryClient.setQueryData(['social', 'friends'], (old: any) => {
        if (!old) return old;
        const pages = old.pages || [];
        if (pages.length === 0) {
          return {
            ...old,
            pages: [{ items: [requesterUserId], nextCursor: undefined }],
          };
        }
        const firstPage = pages[0];
        const existingItems = firstPage.items || [];
        if (existingItems.includes(requesterUserId)) return old;
        return {
          ...old,
          pages: [
            { ...firstPage, items: [requesterUserId, ...existingItems] },
            ...pages.slice(1),
          ],
        };
      });

      return { previousFollowers, previousFriends };
    },
    onSuccess: () => {
      // Сервер сам должен отправить WebSocket событие другому пользователю
      notifySuccess('Заявка принята');
      invalidateSocial();
    },
    onError: (e: any, requesterUserId, context) => {
      // Откатываем изменения при ошибке
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
    mutationFn: (requesterUserId: string) => RelationshipsService.decline(requesterUserId),
    onMutate: async (requesterUserId: string) => {
      // Отменяем запрос для предотвращения конфликтов
      await queryClient.cancelQueries({ queryKey: ['social', 'followers'] });

      // Сохраняем предыдущее состояние для отката
      const previousFollowers = queryClient.getQueryData(['social', 'followers']);

      // Оптимистично удаляем userId из входящих заявок
      queryClient.setQueryData(['social', 'followers'], (old: any) => {
        if (!old) return old;
        const pages = old.pages || [];
        return {
          ...old,
          pages: pages.map((page: any) => ({
            ...page,
            items: (page.items || []).filter((id: string) => id !== requesterUserId),
          })),
        };
      });

      return { previousFollowers };
    },
    onSuccess: () => {
      // Сервер сам должен отправить WebSocket событие другому пользователю
      notifySuccess('Заявка отклонена');
      invalidateSocial();
    },
    onError: (e: any, requesterUserId, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousFollowers) {
        queryClient.setQueryData(['social', 'followers'], context.previousFollowers);
      }
      notifyError('Не удалось отклонить заявку', e?.response?.data?.message || e?.message);
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

  const renderRow = (id: string) => {
    const u = usersById.get(id) as IUser | undefined;
    const isIncoming = incomingIds.includes(id);
    const isOutgoing = outgoingIds.includes(id);
    const isMe = myUserId && id === myUserId;
    const avaUrl = resolveAvaUrl((u as any)?.avaPath);

    return (
      <div key={id} className={styles.row}>
        <div className={styles.avatar} aria-hidden="true">
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
            <span>{initialsFromUser(u || { username: 'user' })}</span>
          )}
        </div>

        <div className={styles.userMain}>
          <div className={styles.fullName}>{fullNameFromUser(u || { username: 'user' })}</div>
          {u?.username ? <div className={styles.username}>@{u.username}</div> : null}

          {isIncoming ? <div className={styles.pill}>Новая заявка в друзья</div> : null}
          {isOutgoing ? <div className={styles.pill}>Исходящая заявка</div> : null}
        </div>

        <div className={styles.actions}>
          {isMe ? <span className={styles.disabledNote}>Это вы</span> : null}

          {!isMe && isIncoming ? (
            <>
              <ActionButton
                label="Принять"
                variant="primary"
                className={styles.smallBtn}
                onClick={() => acceptMutation.mutate(id)}
              />
              <ActionButton
                label="Отклонить"
                variant="danger"
                className={styles.smallBtn}
                onClick={() => declineMutation.mutate(id)}
              />
            </>
          ) : null}

          {!isMe && !isIncoming && isOutgoing ? <span className={styles.disabledNote}>Ожидает ответа</span> : null}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Уведомления</h1>
        <p className={styles.subtitle}>
          Сейчас сервер не отдаёт историю уведомлений через REST, поэтому показываем актуальные заявки в друзья.
        </p>
      </div>

      <div className={styles.panel}>
        <div className={styles.sectionTitle}>Новые события</div>
        <div className={styles.hint}>
          Входящие заявки можно принять или отклонить. Исходящие — только статус (серверного “отменить заявку” пока нет).
        </div>

        {incomingIds.length === 0 && outgoingIds.length === 0 ? (
          <div style={{ marginTop: 12 }}>
            <EmptyState message="Пока тихо" subMessage="Когда появятся заявки — они будут здесь." />
          </div>
        ) : (
          <div className={styles.list}>
            {incomingIds.map(renderRow)}
            {outgoingIds.filter((id) => !incomingIds.includes(id)).map(renderRow)}
          </div>
        )}
      </div>
    </div>
  );
}


