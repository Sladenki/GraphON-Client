'use client';

import React, { useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import { RelationshipsService } from '@/services/relationships.service';
import { EventService } from '@/services/event.service';
import { UserService } from '@/services/user.service';
import PopUpWrapper from '@/components/global/PopUpWrapper/PopUpWrapper';
import { notifySuccess, notifyError } from '@/lib/notifications';
import { X, UserPlus, Loader2 } from 'lucide-react';
import styles from './InviteFriendModal.module.scss';
import Image from 'next/image';
import NoImage from '../../../../../public/noImage.png';

interface InviteFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
}

interface FriendUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avaPath?: string;
}

export function InviteFriendModal({ isOpen, onClose, eventId, eventName }: InviteFriendModalProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  // Получаем список ID друзей
  const friendsIdsQuery = useInfiniteQuery({
    queryKey: ['social', 'friends'],
    queryFn: ({ pageParam }) => RelationshipsService.getFriends({ limit: 200, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    enabled: isOpen,
    staleTime: 30_000,
  });

  const friendsIds = useMemo(() => {
    return (friendsIdsQuery.data?.pages ?? []).flatMap((p) => p.items ?? []);
  }, [friendsIdsQuery.data]);

  // Получаем детали друзей
  const friendsDetailsQueries = useQueries({
    queries: friendsIds.map((id) => ({
      queryKey: ['user', 'getById', id],
      queryFn: () => UserService.getById(id),
      enabled: isOpen && Boolean(id),
      staleTime: 5 * 60_000,
    })),
  });

  const friendsList = useMemo<FriendUser[]>(() => {
    const friends: FriendUser[] = [];
    friendsIds.forEach((id, idx) => {
      const data = friendsDetailsQueries[idx]?.data;
      if (data) {
        friends.push({
          _id: id,
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          avaPath: data.avaPath,
        });
      }
    });
    return friends;
  }, [friendsIds, friendsDetailsQueries]);

  // Фильтрация друзей по поисковому запросу
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friendsList;
    const query = searchQuery.toLowerCase().trim();
    return friendsList.filter((friend) => {
      const firstName = friend.firstName?.toLowerCase() || '';
      const lastName = friend.lastName?.toLowerCase() || '';
      const username = friend.username?.toLowerCase() || '';
      return firstName.includes(query) || lastName.includes(query) || username.includes(query);
    });
  }, [friendsList, searchQuery]);

  // Мутация для приглашения друга
  const inviteMutation = useMutation({
    mutationFn: (targetUserId: string) => EventService.inviteFriend(eventId, targetUserId),
    onSuccess: () => {
      notifySuccess('Приглашение отправлено');
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
    onError: (error: any) => {
      notifyError('Не удалось отправить приглашение', error?.response?.data?.message || error?.message);
    },
  });

  const handleInvite = (targetUserId: string) => {
    inviteMutation.mutate(targetUserId);
  };

  const getDisplayName = (friend: FriendUser) => {
    if (friend.firstName && friend.lastName) {
      return `${friend.firstName} ${friend.lastName}`;
    } else if (friend.firstName) {
      return friend.firstName;
    } else if (friend.lastName) {
      return friend.lastName;
    } else if (friend.username) {
      return `@${friend.username}`;
    }
    return 'Пользователь';
  };

  const getInitials = (friend: FriendUser) => {
    if (friend.firstName?.[0]) return friend.firstName[0].toUpperCase();
    if (friend.lastName?.[0]) return friend.lastName[0].toUpperCase();
    if (friend.username?.[0]) return friend.username[0].toUpperCase();
    return 'U';
  };

  const isLoading = friendsIdsQuery.isLoading || friendsDetailsQueries.some(q => q.isLoading);

  return (
    <PopUpWrapper isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Пригласить друга</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
            <X size={20} />
          </button>
        </div>

        <div className={styles.eventInfo}>
          <span className={styles.eventName}>{eventName}</span>
        </div>

        {/* Поиск */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Поиск друзей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Список друзей */}
        <div className={styles.friendsList}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <Loader2 size={24} className={styles.spinner} />
              <span>Загрузка друзей...</span>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className={styles.emptyState}>
              {searchQuery.trim() ? (
                <>
                  <span>Друзья не найдены</span>
                  <span className={styles.emptySubtext}>Попробуйте изменить запрос</span>
                </>
              ) : (
                <>
                  <span>У вас пока нет друзей</span>
                  <span className={styles.emptySubtext}>Добавьте друзей, чтобы приглашать их на мероприятия</span>
                </>
              )}
            </div>
          ) : (
            filteredFriends.map((friend) => {
              const isInviting = inviteMutation.isPending && inviteMutation.variables === friend._id;
              const displayName = getDisplayName(friend);
              const initials = getInitials(friend);
              const imageUrl = friend.avaPath?.startsWith('http')
                ? friend.avaPath
                : friend.avaPath
                  ? `${process.env.NEXT_PUBLIC_S3_URL}/${friend.avaPath}`
                  : null;

              return (
                <div key={friend._id} className={styles.friendItem}>
                  <div className={styles.friendInfo}>
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={displayName}
                        width={48}
                        height={48}
                        className={styles.friendAvatar}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = NoImage.src;
                        }}
                      />
                    ) : (
                      <div className={styles.friendAvatarFallback}>
                        {initials}
                      </div>
                    )}
                    <div className={styles.friendDetails}>
                      <span className={styles.friendName}>{displayName}</span>
                      {friend.username && (
                        <span className={styles.friendUsername}>@{friend.username}</span>
                      )}
                    </div>
                  </div>
                  <button
                    className={styles.inviteButton}
                    onClick={() => handleInvite(friend._id)}
                    disabled={isInviting || inviteMutation.isPending}
                  >
                    {isInviting ? (
                      <>
                        <Loader2 size={16} className={styles.buttonSpinner} />
                        <span>Отправка...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        <span>Позвать на мероприятие</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </PopUpWrapper>
  );
}

