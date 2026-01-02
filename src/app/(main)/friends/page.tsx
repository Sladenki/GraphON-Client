'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import styles from './FriendsPage.module.scss';
import SearchBar from '@/components/shared/SearchBar/SearchBar';
import { useAuth } from '@/providers/AuthProvider';
import { EmptyState } from '@/components/global/EmptyState/EmptyState';
import { UserService } from '@/services/user.service';
import { RelationshipsService } from '@/services/relationships.service';
import type { SocialUserListItem } from '@/types/social.interface';
import type { IUser } from '@/types/user.interface';
import { notifyError, notifySuccess } from '@/lib/notifications';
import { Users, UserPlus, Send, Search } from 'lucide-react';
import { getPastelTheme, type ThemeName } from '@/components/shared/EventCard/pastelTheme';
import { useTheme } from 'next-themes';

type TabKey = 'people' | 'incoming' | 'outgoing' | 'friends';

const LIMIT = 50;

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

// Функция для определения цвета фона карточки на основе интересов пользователя
function getCardBackgroundColor(
  topInterests?: Array<{ name: string; _id: string; displayName?: string }>,
  isDark: boolean = false
): string {
  const interests = topInterests || [];
  
  if (interests.length === 0) {
    // Нет интересов - приятный пастельный фиолетовый фон
    if (isDark) {
      return 'linear-gradient(135deg, rgba(150, 130, 238, 0.12) 0%, rgba(130, 90, 200, 0.08) 100%)';
    }
    return 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)'; // Мягкий пастельный фиолетовый градиент
  } else if (interests.length === 1) {
    // Один интерес - используем градиент этого интереса
    const themeName = interests[0].name as ThemeName;
    const theme = getPastelTheme(themeName);
    return isDark ? theme.headerBgDark : theme.headerBgLight;
  } else {
    // Несколько интересов - создаем градиент из цветов интересов
    const gradients = interests.slice(0, 3).map((interest) => {
      const themeName = interest.name as ThemeName;
      const theme = getPastelTheme(themeName);
      return isDark ? theme.headerBgDark : theme.headerBgLight;
    });
    
    // Для темной темы используем градиенты напрямую (они уже в формате rgba)
    if (isDark) {
      // Извлекаем rgba цвета из градиентов для темной темы
      const extractRgba = (gradient: string): string => {
        const rgbaMatch = gradient.match(/rgba?\([^)]+\)/g);
        if (rgbaMatch && rgbaMatch.length > 0) {
          return rgbaMatch[0];
        }
        return 'rgba(150, 130, 238, 0.12)'; // fallback
      };
      
      const colors = gradients.map(extractRgba);
      
      if (colors.length === 2) {
        return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
      } else if (colors.length >= 3) {
        return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`;
      }
      return colors[0] || 'linear-gradient(135deg, rgba(150, 130, 238, 0.12) 0%, rgba(130, 90, 200, 0.08) 100%)';
    }
    
    // Для светлой темы извлекаем hex цвета
    const extractColor = (gradient: string): string => {
      // Ищем hex цвета
      const hexMatch = gradient.match(/#[0-9a-fA-F]{6}/i);
      if (hexMatch) return hexMatch[0];
      
      // Ищем rgba цвета и конвертируем в hex (упрощенная версия)
      const rgbaMatch = gradient.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (rgbaMatch) {
        const r = parseInt(rgbaMatch[1]);
        const g = parseInt(rgbaMatch[2]);
        const b = parseInt(rgbaMatch[3]);
        return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
      }
      
      return '#f5f3ff'; // fallback
    };
    
    const colors = gradients.map(extractColor);
    
    // Создаем градиент из цветов
    if (colors.length === 2) {
      return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
    } else if (colors.length >= 3) {
      return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`;
    }
    return colors[0] ? `linear-gradient(135deg, ${colors[0]} 0%, ${colors[0]} 100%)` : 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)';
  }
}

export default function FriendsPage() {
  const { user, isLoggedIn } = useAuth();
  const typedUser = user as IUser | null;
  const myUserId = typedUser?._id;
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (typeof window !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark');

  const [activeTab, setActiveTab] = useState<TabKey>('people');
  const [peopleQuery, setPeopleQuery] = useState('');

  const trimmedPeopleQuery = peopleQuery.trim();
  const isSearchingPeople = trimmedPeopleQuery.length > 0;

  // ---- Users list (cursor pagination) — default mode (no query) ----
  const usersListQuery = useInfiniteQuery({
    queryKey: ['social', 'users'],
    queryFn: ({ pageParam }) => UserService.getUserList({ limit: LIMIT, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    enabled: isLoggedIn && !isSearchingPeople,
    staleTime: 60_000,
  });

  // ---- Users search (cursor pagination) — server-side search ----
  const usersSearchQuery = useInfiniteQuery({
    queryKey: ['social', 'usersSearch', trimmedPeopleQuery],
    queryFn: ({ pageParam }) =>
      UserService.searchUsers({ q: trimmedPeopleQuery, limit: 20, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    enabled: isLoggedIn && isSearchingPeople,
    staleTime: 30_000,
  });

  const peopleUsers: SocialUserListItem[] = useMemo(() => {
    const pages = (isSearchingPeople ? usersSearchQuery.data?.pages : usersListQuery.data?.pages) ?? [];
    return pages.flatMap((p) => p.items ?? []);
  }, [isSearchingPeople, usersListQuery.data, usersSearchQuery.data]);

  // ---- Relationship lists (ids only). For statuses we pull first page with bigger limit. ----
  const friendsIdsQuery = useInfiniteQuery({
    queryKey: ['social', 'friends'],
    queryFn: ({ pageParam }) => RelationshipsService.getFriends({ limit: 200, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    enabled: isLoggedIn,
    staleTime: 30_000,
  });

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

  const friendsIds = useMemo(() => new Set((friendsIdsQuery.data?.pages ?? []).flatMap((p) => p.items ?? [])), [friendsIdsQuery.data]);
  const followersIds = useMemo(() => new Set((followersIdsQuery.data?.pages ?? []).flatMap((p) => p.items ?? [])), [followersIdsQuery.data]);
  const followingIds = useMemo(() => new Set((followingIdsQuery.data?.pages ?? []).flatMap((p) => p.items ?? [])), [followingIdsQuery.data]);

  // ---- Fetch user details for ids-based tabs ----
  const visibleIds = useMemo(() => {
    if (activeTab === 'friends') {
      return (friendsIdsQuery.data?.pages ?? []).flatMap((p) => p.items ?? []);
    }
    if (activeTab === 'incoming') {
      return (followersIdsQuery.data?.pages ?? []).flatMap((p) => p.items ?? []);
    }
    if (activeTab === 'outgoing') {
      return (followingIdsQuery.data?.pages ?? []).flatMap((p) => p.items ?? []);
    }
    return [];
  }, [activeTab, friendsIdsQuery.data, followersIdsQuery.data, followingIdsQuery.data]);

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
    queryClient.invalidateQueries({ queryKey: ['social', 'friends'] });
    queryClient.invalidateQueries({ queryKey: ['social', 'followers'] });
    queryClient.invalidateQueries({ queryKey: ['social', 'following'] });
    queryClient.invalidateQueries({ queryKey: ['social', 'users'] });
    queryClient.invalidateQueries({ queryKey: ['social', 'usersSearch'] });
  }, [queryClient]);

  const requestMutation = useMutation({
    mutationFn: (targetUserId: string) => RelationshipsService.request(targetUserId),
    onSuccess: () => {
      // Сервер сам должен отправить WebSocket событие другому пользователю
      notifySuccess('Заявка отправлена');
      invalidateSocial();
    },
    onMutate: async (targetUserId: string) => {
      // Отменяем исходящие запросы, чтобы предотвратить конфликты
      await queryClient.cancelQueries({ queryKey: ['social', 'following'] });

      // Сохраняем предыдущее состояние для отката
      const previousFollowing = queryClient.getQueryData(['social', 'following']);

      // Оптимистично добавляем userId в исходящие заявки
      queryClient.setQueryData(['social', 'following'], (old: any) => {
        if (!old) return old;
        const pages = old.pages || [];
        if (pages.length === 0) {
          return {
            ...old,
            pages: [{ items: [targetUserId], nextCursor: undefined }],
          };
        }
        const firstPage = pages[0];
        const existingItems = firstPage.items || [];
        if (existingItems.includes(targetUserId)) return old;
        return {
          ...old,
          pages: [
            { ...firstPage, items: [targetUserId, ...existingItems] },
            ...pages.slice(1),
          ],
        };
      });

      return { previousFollowing };
    },
    onError: (e: any, targetUserId, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousFollowing) {
        queryClient.setQueryData(['social', 'following'], context.previousFollowing);
      }
      notifyError('Не удалось отправить заявку', e?.response?.data?.message || e?.message);
    },
  });

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

  const cancelRequestMutation = useMutation({
    mutationFn: (targetUserId: string) => RelationshipsService.cancel(targetUserId),
    onMutate: async (targetUserId: string) => {
      // Отменяем запрос для предотвращения конфликтов
      await queryClient.cancelQueries({ queryKey: ['social', 'following'] });

      // Сохраняем предыдущее состояние для отката
      const previousFollowing = queryClient.getQueryData(['social', 'following']);

      // Оптимистично удаляем userId из исходящих заявок
      queryClient.setQueryData(['social', 'following'], (old: any) => {
        if (!old) return old;
        const pages = old.pages || [];
        return {
          ...old,
          pages: pages.map((page: any) => ({
            ...page,
            items: (page.items || []).filter((id: string) => id !== targetUserId),
          })),
        };
      });

      return { previousFollowing };
    },
    onSuccess: () => {
      notifySuccess('Заявка отменена');
      invalidateSocial();
    },
    onError: (e: any, targetUserId, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousFollowing) {
        queryClient.setQueryData(['social', 'following'], context.previousFollowing);
      }
      notifyError('Не удалось отменить заявку', e?.response?.data?.message || e?.message);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (friendUserId: string) => RelationshipsService.removeFriend(friendUserId),
    onMutate: async (friendUserId: string) => {
      // Отменяем запрос для предотвращения конфликтов
      await queryClient.cancelQueries({ queryKey: ['social', 'friends'] });

      // Сохраняем предыдущее состояние для отката
      const previousFriends = queryClient.getQueryData(['social', 'friends']);

      // Оптимистично удаляем userId из друзей
      queryClient.setQueryData(['social', 'friends'], (old: any) => {
        if (!old) return old;
        const pages = old.pages || [];
        return {
          ...old,
          pages: pages.map((page: any) => ({
            ...page,
            items: (page.items || []).filter((id: string) => id !== friendUserId),
          })),
        };
      });

      return { previousFriends };
    },
    onSuccess: () => {
      // Сервер сам должен отправить WebSocket событие другому пользователю
      notifySuccess('Удалено из друзей');
      invalidateSocial();
    },
    onError: (e: any, friendUserId, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousFriends) {
        queryClient.setQueryData(['social', 'friends'], context.previousFriends);
      }
      notifyError('Не удалось удалить из друзей', e?.response?.data?.message || e?.message);
    },
  });

  const renderUserRow = (u: Partial<SocialUserListItem> & { _id: string; firstName?: string; lastName?: string; username?: string; avaPath?: string }, index?: number) => {
    const isMe = myUserId && u._id === myUserId;
    const avaUrl = resolveAvaUrl(u.avaPath || '');
    const isFriend = friendsIds.has(u._id);
    const hasIncoming = followersIds.has(u._id);
    const hasOutgoing = followingIds.has(u._id);

    // Определяем цвет фона на основе интересов
    const cardBackground = getCardBackgroundColor(u.topInterests, isDark);

    const rowVariantClass =
      activeTab === 'people'
        ? (isFriend ? styles.rowFriends : hasIncoming ? styles.rowIncoming : hasOutgoing ? styles.rowOutgoing : styles.rowPeople)
        : activeTab === 'friends'
          ? styles.rowFriends
          : activeTab === 'incoming'
            ? styles.rowIncoming
            : activeTab === 'outgoing'
              ? styles.rowOutgoing
              : styles.rowPeople;

    const status =
      activeTab === 'people'
        ? isMe
          ? { label: 'You', className: styles.statusNeutral }
          : isFriend
            ? { label: 'Friend', className: styles.statusFriend }
            : hasIncoming
              ? { label: 'Request', className: styles.statusIncoming }
              : hasOutgoing
                ? { label: 'Sent', className: styles.statusOutgoing }
                : null
        : activeTab === 'friends'
          ? { label: 'Friend', className: styles.statusFriend }
          : activeTab === 'incoming'
            ? { label: 'Request', className: styles.statusIncoming }
            : activeTab === 'outgoing'
              ? { label: 'Sent', className: styles.statusOutgoing }
              : null;

    const animationDelay = index !== undefined ? `${0.1 + index * 0.05}s` : '0s';
    
    return (
      <div 
        key={u._id} 
        className={`${styles.row} ${rowVariantClass}`}
        style={{
          background: cardBackground,
          '--delay': animationDelay,
        } as React.CSSProperties}
      >
        <div className={styles.rowLeft}>
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
              <span>{initialsFromUser(u)}</span>
            )}
          </div>

          <div className={styles.userMain}>
            <div className={styles.userTopLine}>
              <div className={styles.fullName}>
                {u.firstName && u.lastName 
                  ? `${u.firstName} ${u.lastName}` 
                  : fullNameFromUser(u)}
              </div>
              {u.username ? <div className={styles.username}>@{u.username}</div> : null}
              {status ? <span className={`${styles.statusPill} ${status.className}`}>{status.label}</span> : null}
            </div>

            {u.metaPills?.length ? (
              <div className={styles.meta}>
                {u.metaPills.map((p) => (
                  <span key={p} className={styles.pill}>
                    {p}
                  </span>
                ))}
              </div>
            ) : null}

            {u.topInterests?.length ? (
              <div className={styles.interests}>
                {u.topInterests.map((interest) => {
                  const themeName = interest.name as ThemeName;
                  const theme = getPastelTheme(themeName);
                  return (
                    <span key={interest._id} className={`${styles.interestPill} ${theme.chip}`}>
                      {interest.displayName || interest.name}
                    </span>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.actions}>
          {activeTab === 'people' && (
            <>
              {isMe ? (
                <span className={styles.disabledNote}>Это вы</span>
              ) : isFriend ? (
                <button type="button" className={`${styles.pillBtn} ${styles.dangerBtn}`} onClick={() => removeMutation.mutate(u._id)}>
                  Удалить
                </button>
              ) : hasIncoming ? (
                <>
                  <button type="button" className={`${styles.pillBtn} ${styles.primaryBtn}`} onClick={() => acceptMutation.mutate(u._id)}>
                    Принять
                  </button>
                  <button type="button" className={`${styles.pillBtn} ${styles.ghostBtn}`} onClick={() => declineMutation.mutate(u._id)}>
                    Отклонить
                  </button>
                </>
              ) : hasOutgoing ? (
                <button type="button" className={`${styles.pillBtn} ${styles.ghostBtn}`} onClick={() => cancelRequestMutation.mutate(u._id)}>
                  Отменить заявку
                </button>
              ) : (
                <button type="button" className={`${styles.pillBtn} ${styles.primaryBtn}`} onClick={() => requestMutation.mutate(u._id)}>
                  В друзья
                </button>
              )}
            </>
          )}

          {activeTab === 'friends' && (
            <button type="button" className={`${styles.pillBtn} ${styles.dangerBtn}`} onClick={() => removeMutation.mutate(u._id)}>
              Удалить
            </button>
          )}

          {activeTab === 'incoming' && (
            <>
              <button type="button" className={`${styles.pillBtn} ${styles.primaryBtn}`} onClick={() => acceptMutation.mutate(u._id)}>
                Принять
              </button>
              <button type="button" className={`${styles.pillBtn} ${styles.ghostBtn}`} onClick={() => declineMutation.mutate(u._id)}>
                Отклонить
              </button>
            </>
          )}

          {activeTab === 'outgoing' && (
            <button type="button" className={`${styles.pillBtn} ${styles.ghostBtn}`} onClick={() => cancelRequestMutation.mutate(u._id)}>
              Отменить заявку
            </button>
          )}

        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className={styles.page}>
        <EmptyState
          message="Друзья и уведомления доступны после входа"
          subMessage="Войдите в аккаунт, чтобы искать людей, отправлять заявки и принимать друзей."
        />
      </div>
    );
  }

  const pendingIncomingCount = followersIds.size;
  const pendingOutgoingCount = followingIds.size;
  const friendsCount = friendsIds.size;

  return (
    <div className={styles.page}>
      <div className={styles.heroCard}>
        <div className={styles.heroStats} aria-label="Friends overview">
          <div 
            className={`${styles.statsCard} ${styles.statsMint} ${activeTab === 'friends' ? styles.statsCardActive : ''}`}
            onClick={() => setActiveTab('friends')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTab('friends');
              }
            }}
            aria-label="Перейти к списку друзей"
            style={{ cursor: 'pointer', '--delay': '0.1s' } as React.CSSProperties}
          >
            <div className={styles.statsIconBackground} aria-hidden="true">
              <Users size={64} />
            </div>
            <div className={styles.statsNumber}>{friendsCount}</div>
            <div className={styles.statsLabel}>Друзья</div>
          </div>

          <div 
            className={`${styles.statsCard} ${styles.statsPeach} ${activeTab === 'incoming' ? styles.statsCardActive : ''}`}
            onClick={() => setActiveTab('incoming')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTab('incoming');
              }
            }}
            aria-label="Перейти к входящим заявкам"
            style={{ cursor: 'pointer', '--delay': '0.2s' } as React.CSSProperties}
          >
            <div className={styles.statsIconBackground} aria-hidden="true">
              <UserPlus size={64} />
            </div>
            <div className={styles.statsNumber}>{pendingIncomingCount}</div>
            <div className={styles.statsLabel}>Заявки</div>
          </div>

          <div 
            className={`${styles.statsCard} ${styles.statsLavender} ${activeTab === 'outgoing' ? styles.statsCardActive : ''}`}
            onClick={() => setActiveTab('outgoing')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTab('outgoing');
              }
            }}
            aria-label="Перейти к исходящим заявкам"
            style={{ cursor: 'pointer', '--delay': '0.3s' } as React.CSSProperties}
          >
            <div className={styles.statsIconBackground} aria-hidden="true">
              <Send size={64} />
            </div>
            <div className={styles.statsNumber}>{pendingOutgoingCount}</div>
            <div className={styles.statsLabel}>Отправлено</div>
          </div>
        </div>
        
        {/* Блок "Глобальный поиск" - появляется при выборе любого раздела кроме "Люди" */}
        {activeTab !== 'people' && (
          <div 
            className={styles.globalSearchBlock}
            onClick={() => setActiveTab('people')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTab('people');
              }
            }}
            aria-label="Перейти к глобальному поиску"
          >
            <Search size={20} className={styles.globalSearchIcon} />
            <span className={styles.globalSearchText}>Глобальный поиск</span>
          </div>
        )}
      </div>

      <div className={styles.controlCard}>
        <SearchBar
          placeholder="Поиск людей по имени или @username"
          onSearch={setPeopleQuery}
          onTagFilter={() => {}}
          showTagFilter={false}
        />
      </div>

      <div className={styles.content}>
        {activeTab === 'people' && (
          <div className={styles.panel}>
            <div className={styles.sectionLabel}>Discover</div>

            <div className={styles.list} style={{ marginTop: 12 }}>
              {!isSearchingPeople && peopleUsers.map((u, index) =>
                renderUserRow({
                  ...u,
                  metaPills: [
                    `Друзья: ${u.friendsCount ?? 0}`,
                    `Подписчики: ${u.followersCount ?? 0}`,
                    `Подписки: ${u.followingCount ?? 0}`,
                  ],
                }, index)
              )}

              {isSearchingPeople && peopleUsers.length === 0 ? (
                <EmptyState
                  message="Ничего не найдено"
                  subMessage="Попробуйте другой запрос (можно 1–2 слова: имя, фамилия или username)."
                />
              ) : null}

              {isSearchingPeople && peopleUsers.map((u, index) =>
                renderUserRow({
                  ...u,
                  metaPills: [
                    `Друзья: ${u.friendsCount ?? 0}`,
                    `Подписчики: ${u.followersCount ?? 0}`,
                    `Подписки: ${u.followingCount ?? 0}`,
                  ],
                }, index)
              )}
            </div>

            <div className={styles.loadMore}>
              <button
                className={styles.ghostButton}
                type="button"
                disabled={
                  isSearchingPeople
                    ? !usersSearchQuery.hasNextPage || usersSearchQuery.isFetchingNextPage
                    : !usersListQuery.hasNextPage || usersListQuery.isFetchingNextPage
                }
                onClick={() => {
                  if (isSearchingPeople) return usersSearchQuery.fetchNextPage();
                  return usersListQuery.fetchNextPage();
                }}
              >
                {isSearchingPeople
                  ? usersSearchQuery.isFetchingNextPage
                    ? 'Загрузка…'
                    : usersSearchQuery.hasNextPage
                      ? 'Показать ещё'
                      : 'Больше нет'
                  : usersListQuery.isFetchingNextPage
                    ? 'Загрузка…'
                    : usersListQuery.hasNextPage
                      ? 'Показать ещё'
                      : 'Больше нет'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className={styles.panel}>
            <div className={styles.sectionLabel}>Friends</div>
            <div className={styles.list}>
              {visibleIds.length === 0 ? (
                <EmptyState message="Пока нет друзей" subMessage="Найдите людей во вкладке &quot;Люди&quot; и отправьте заявку." />
              ) : (
                visibleIds.map((id, index) => {
                  const u = usersById.get(id) as IUser | undefined;
                  return renderUserRow({
                    _id: id,
                    firstName: u?.firstName,
                    lastName: u?.lastName,
                    username: u?.username,
                    avaPath: (u as any)?.avaPath,
                  }, index);
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'incoming' && (
          <div className={styles.panel}>
            <div className={styles.sectionLabel}>Incoming</div>
            <div className={styles.list}>
              {visibleIds.length === 0 ? (
                <EmptyState message="Нет входящих заявок" subMessage="Когда вам отправят заявку, она появится здесь." />
              ) : (
                visibleIds.map((id, index) => {
                  const u = usersById.get(id) as IUser | undefined;
                  return renderUserRow({
                    _id: id,
                    firstName: u?.firstName,
                    lastName: u?.lastName,
                    username: u?.username,
                    avaPath: (u as any)?.avaPath,
                  }, index);
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'outgoing' && (
          <div className={styles.panel}>
            <div className={styles.sectionLabel}>Outgoing</div>
            <div className={styles.list}>
              {visibleIds.length === 0 ? (
                <EmptyState message="Нет исходящих заявок" subMessage="Отправьте заявку человеку во вкладке &quot;Люди&quot;." />
              ) : (
                visibleIds.map((id, index) => {
                  const u = usersById.get(id) as IUser | undefined;
                  return renderUserRow({
                    _id: id,
                    firstName: u?.firstName,
                    lastName: u?.lastName,
                    username: u?.username,
                    avaPath: (u as any)?.avaPath,
                  }, index);
                })
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


