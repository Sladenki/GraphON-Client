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
import ActionButton from '@/components/ui/ActionButton/ActionButton';
import { notifyError, notifySuccess } from '@/lib/notifications';

type TabKey = 'people' | 'incoming' | 'outgoing' | 'friends' | 'notifications';

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

export default function FriendsPage() {
  const { user, isLoggedIn } = useAuth();
  const typedUser = user as IUser | null;
  const myUserId = typedUser?._id;
  const queryClient = useQueryClient();

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
    if (activeTab === 'notifications') {
      const incoming = (followersIdsQuery.data?.pages ?? []).flatMap((p) => p.items ?? []);
      const outgoing = (followingIdsQuery.data?.pages ?? []).flatMap((p) => p.items ?? []);
      // de-dupe while preserving order
      const seen = new Set<string>();
      return [...incoming, ...outgoing].filter((id) => {
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
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
      notifySuccess('Заявка отправлена');
      invalidateSocial();
    },
    onError: (e: any) => {
      notifyError('Не удалось отправить заявку', e?.response?.data?.message || e?.message);
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (requesterUserId: string) => RelationshipsService.accept(requesterUserId),
    onSuccess: () => {
      notifySuccess('Заявка принята');
      invalidateSocial();
    },
    onError: (e: any) => {
      notifyError('Не удалось принять заявку', e?.response?.data?.message || e?.message);
    },
  });

  const declineMutation = useMutation({
    mutationFn: (requesterUserId: string) => RelationshipsService.decline(requesterUserId),
    onSuccess: () => {
      notifySuccess('Заявка отклонена');
      invalidateSocial();
    },
    onError: (e: any) => {
      notifyError('Не удалось отклонить заявку', e?.response?.data?.message || e?.message);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (friendUserId: string) => RelationshipsService.removeFriend(friendUserId),
    onSuccess: () => {
      notifySuccess('Удалено из друзей');
      invalidateSocial();
    },
    onError: (e: any) => {
      notifyError('Не удалось удалить из друзей', e?.response?.data?.message || e?.message);
    },
  });

  const renderUserRow = (u: {
    _id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    avaPath?: string;
    metaPills?: string[];
  }) => {
    const isMe = myUserId && u._id === myUserId;
    const avaUrl = resolveAvaUrl(u.avaPath);
    const isFriend = friendsIds.has(u._id);
    const hasIncoming = followersIds.has(u._id);
    const hasOutgoing = followingIds.has(u._id);

    return (
      <div key={u._id} className={styles.row}>
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
          <div className={styles.userName}>
            <div className={styles.fullName}>{fullNameFromUser(u)}</div>
            {u.username ? <div className={styles.username}>@{u.username}</div> : null}
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
        </div>

        <div className={styles.actions}>
          {activeTab === 'people' && (
            <>
              {isMe ? (
                <span className={styles.disabledNote}>Это вы</span>
              ) : isFriend ? (
                <ActionButton
                  label="Удалить"
                  variant="danger"
                  className={styles.smallBtn}
                  onClick={() => removeMutation.mutate(u._id)}
                />
              ) : hasIncoming ? (
                <>
                  <ActionButton
                    label="Принять"
                    variant="primary"
                    className={styles.smallBtn}
                    onClick={() => acceptMutation.mutate(u._id)}
                  />
                  <ActionButton
                    label="Отклонить"
                    variant="danger"
                    className={styles.smallBtn}
                    onClick={() => declineMutation.mutate(u._id)}
                  />
                </>
              ) : hasOutgoing ? (
                <span className={styles.disabledNote}>Заявка отправлена</span>
              ) : (
                <ActionButton
                  label="В друзья"
                  variant="primary"
                  className={styles.smallBtn}
                  onClick={() => requestMutation.mutate(u._id)}
                />
              )}
            </>
          )}

          {activeTab === 'friends' && (
            <ActionButton
              label="Удалить"
              variant="danger"
              className={styles.smallBtn}
              onClick={() => removeMutation.mutate(u._id)}
            />
          )}

          {activeTab === 'incoming' && (
            <>
              <ActionButton
                label="Принять"
                variant="primary"
                className={styles.smallBtn}
                onClick={() => acceptMutation.mutate(u._id)}
              />
              <ActionButton
                label="Отклонить"
                variant="danger"
                className={styles.smallBtn}
                onClick={() => declineMutation.mutate(u._id)}
              />
            </>
          )}

          {activeTab === 'outgoing' && <span className={styles.disabledNote}>Заявка отправлена</span>}

          {activeTab === 'notifications' && (
            <>
              {followersIds.has(u._id) ? (
                <>
                  <ActionButton
                    label="Принять"
                    variant="primary"
                    className={styles.smallBtn}
                    onClick={() => acceptMutation.mutate(u._id)}
                  />
                  <ActionButton
                    label="Отклонить"
                    variant="danger"
                    className={styles.smallBtn}
                    onClick={() => declineMutation.mutate(u._id)}
                  />
                </>
              ) : followingIds.has(u._id) ? (
                <span className={styles.disabledNote}>Исходящая заявка</span>
              ) : (
                <span className={styles.disabledNote}>Активность</span>
              )}
            </>
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

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Друзья</h1>
        </div>
        <p className={styles.subtitle}>
          Поиск людей, заявки в друзья и уведомления (пока — на основе заявок, REST для notifications на сервере ещё нет).
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'people' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('people')}
          type="button"
        >
          Люди
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'incoming' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('incoming')}
          type="button"
        >
          Входящие ({pendingIncomingCount})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'outgoing' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('outgoing')}
          type="button"
        >
          Исходящие ({pendingOutgoingCount})
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'friends' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('friends')}
          type="button"
        >
          Друзья
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'notifications' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('notifications')}
          type="button"
        >
          Уведомления
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'people' && (
          <div className={styles.panel}>
            <SearchBar
              placeholder="Поиск людей по имени или @username"
              onSearch={setPeopleQuery}
              onTagFilter={() => {}}
              showTagFilter={false}
            />

            <div className={styles.hint}>
              Подсказка: входящие/исходящие заявки и друзья подтягиваются автоматически — кнопки в списке “Люди” показывают актуальный статус.
            </div>

            <div className={styles.list} style={{ marginTop: 12 }}>
              {!isSearchingPeople && peopleUsers.map((u) =>
                renderUserRow({
                  _id: u._id,
                  firstName: u.firstName,
                  lastName: u.lastName,
                  username: u.username,
                  avaPath: u.avaPath,
                  metaPills: [
                    `Друзья: ${u.friendsCount ?? 0}`,
                    `Подписчики: ${u.followersCount ?? 0}`,
                    `Подписки: ${u.followingCount ?? 0}`,
                  ],
                })
              )}

              {isSearchingPeople && peopleUsers.length === 0 ? (
                <EmptyState
                  message="Ничего не найдено"
                  subMessage="Попробуйте другой запрос (можно 1–2 слова: имя, фамилия или username)."
                />
              ) : null}

              {isSearchingPeople && peopleUsers.map((u) =>
                renderUserRow({
                  _id: u._id,
                  firstName: u.firstName,
                  lastName: u.lastName,
                  username: u.username,
                  avaPath: u.avaPath,
                  metaPills: [
                    `Друзья: ${u.friendsCount ?? 0}`,
                    `Подписчики: ${u.followersCount ?? 0}`,
                    `Подписки: ${u.followingCount ?? 0}`,
                  ],
                })
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
            <h2 className={styles.panelTitle}>Ваши друзья</h2>
            <div className={styles.list}>
              {visibleIds.length === 0 ? (
                <EmptyState message="Пока нет друзей" subMessage="Найдите людей во вкладке “Люди” и отправьте заявку." />
              ) : (
                visibleIds.map((id) => {
                  const u = usersById.get(id) as IUser | undefined;
                  return renderUserRow({
                    _id: id,
                    firstName: u?.firstName,
                    lastName: u?.lastName,
                    username: u?.username,
                    avaPath: (u as any)?.avaPath,
                  });
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'incoming' && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Входящие заявки</h2>
            <div className={styles.list}>
              {visibleIds.length === 0 ? (
                <EmptyState message="Нет входящих заявок" subMessage="Когда вам отправят заявку, она появится здесь." />
              ) : (
                visibleIds.map((id) => {
                  const u = usersById.get(id) as IUser | undefined;
                  return renderUserRow({
                    _id: id,
                    firstName: u?.firstName,
                    lastName: u?.lastName,
                    username: u?.username,
                    avaPath: (u as any)?.avaPath,
                  });
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'outgoing' && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Исходящие заявки</h2>
            <div className={styles.list}>
              {visibleIds.length === 0 ? (
                <EmptyState message="Нет исходящих заявок" subMessage="Отправьте заявку человеку во вкладке “Люди”." />
              ) : (
                visibleIds.map((id) => {
                  const u = usersById.get(id) as IUser | undefined;
                  return renderUserRow({
                    _id: id,
                    firstName: u?.firstName,
                    lastName: u?.lastName,
                    username: u?.username,
                    avaPath: (u as any)?.avaPath,
                  });
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Уведомления</h2>
            <div className={styles.hint}>
              Сервер пока не отдаёт историю уведомлений через REST. Здесь показываем актуальные события на основе заявок:
              входящие запросы и (как справка) исходящие.
            </div>

            {pendingIncomingCount > 0 && (
              <div style={{ marginTop: 12 }}>
                <div className={styles.panelTitle}>Новые заявки в друзья</div>
                <div className={styles.list}>
                  {(followersIdsQuery.data?.pages ?? [])
                    .flatMap((p) => p.items ?? [])
                    .map((id) => {
                      const u = usersById.get(id) as IUser | undefined;
                      return renderUserRow({
                        _id: id,
                        firstName: u?.firstName,
                        lastName: u?.lastName,
                        username: u?.username,
                        avaPath: (u as any)?.avaPath,
                      });
                    })}
                </div>
              </div>
            )}

            {pendingOutgoingCount > 0 && (
              <div style={{ marginTop: 12 }}>
                <div className={styles.panelTitle}>Ваши исходящие заявки</div>
                <div className={styles.list}>
                  {(followingIdsQuery.data?.pages ?? [])
                    .flatMap((p) => p.items ?? [])
                    .map((id) => {
                      const u = usersById.get(id) as IUser | undefined;
                      return renderUserRow({
                        _id: id,
                        firstName: u?.firstName,
                        lastName: u?.lastName,
                        username: u?.username,
                        avaPath: (u as any)?.avaPath,
                      });
                    })}
                </div>
              </div>
            )}

            {pendingIncomingCount === 0 && pendingOutgoingCount === 0 ? (
              <div style={{ marginTop: 12 }}>
                <EmptyState message="Пока тихо" subMessage="Когда появятся заявки в друзья — они отобразятся здесь." />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}


