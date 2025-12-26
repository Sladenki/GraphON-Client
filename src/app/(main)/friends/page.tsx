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
import { Users, UserPlus, Send } from 'lucide-react';

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

    return (
      <div key={u._id} className={`${styles.row} ${rowVariantClass}`}>
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
              <div className={styles.fullName}>{fullNameFromUser(u)}</div>
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
          </div>
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
      <div className={styles.statsGrid} aria-label="Friends overview">
        <div className={`${styles.statsCard} ${styles.statsMint}`}>
          <div className={styles.statsIcon} aria-hidden="true">
            <Users size={18} />
          </div>
          <div className={styles.statsContent}>
            <div className={styles.statsNumber}>{friendsCount}</div>
            <div className={styles.statsLabel}>Friends</div>
          </div>
        </div>

        <div className={`${styles.statsCard} ${styles.statsPeach}`}>
          <div className={styles.statsIcon} aria-hidden="true">
            <UserPlus size={18} />
          </div>
          <div className={styles.statsContent}>
            <div className={styles.statsNumber}>{pendingIncomingCount}</div>
            <div className={styles.statsLabel}>Requests</div>
          </div>
        </div>

        <div className={`${styles.statsCard} ${styles.statsLavender}`}>
          <div className={styles.statsIcon} aria-hidden="true">
            <Send size={18} />
          </div>
          <div className={styles.statsContent}>
            <div className={styles.statsNumber}>{pendingOutgoingCount}</div>
            <div className={styles.statsLabel}>Sent</div>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <div className={styles.tabsRail}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'people' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('people')}
            type="button"
          >
            <span>Люди</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'incoming' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('incoming')}
            type="button"
            aria-label={`Входящие заявки: ${pendingIncomingCount}`}
          >
            <span>Входящие</span>
            {pendingIncomingCount > 0 ? <span className={styles.tabBadge}>{pendingIncomingCount}</span> : null}
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'outgoing' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('outgoing')}
            type="button"
            aria-label={`Исходящие заявки: ${pendingOutgoingCount}`}
          >
            <span>Исходящие</span>
            {pendingOutgoingCount > 0 ? <span className={styles.tabBadge}>{pendingOutgoingCount}</span> : null}
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'friends' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('friends')}
            type="button"
          >
            <span>Друзья</span>
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {activeTab === 'people' && (
          <div className={styles.panel}>
            <div className={styles.sectionLabel}>Discover</div>
            <SearchBar
              placeholder="Поиск людей по имени или @username"
              onSearch={setPeopleQuery}
              onTagFilter={() => {}}
              showTagFilter={false}
            />

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
            <div className={styles.sectionLabel}>Friends</div>
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
            <div className={styles.sectionLabel}>Incoming</div>
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
            <div className={styles.sectionLabel}>Outgoing</div>
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

      </div>
    </div>
  );
}


