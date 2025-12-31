'use client';

import React from 'react';
import { FriendNode } from '../LifeTrace2D/types';
import PopUpWrapper from '@/components/global/PopUpWrapper/PopUpWrapper';
import styles from './FriendProfileModal.module.scss';
import { X } from 'lucide-react';

interface FriendProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: FriendNode | null;
}

export function FriendProfileModal({ isOpen, onClose, friend }: FriendProfileModalProps) {
  if (!friend) return null;

  const displayName = `${friend.firstName} ${friend.lastName}`;
  const initials = (friend.firstName?.[0] || friend.lastName?.[0] || friend.username?.[0] || 'F').toUpperCase();
  const imageUrl = friend.avatarUrl?.startsWith('http')
    ? friend.avatarUrl
    : friend.avatarUrl
      ? `${process.env.NEXT_PUBLIC_S3_URL}/${friend.avatarUrl}`
      : null;

  return (
    <PopUpWrapper isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
          <X size={20} />
        </button>

        <div className={styles.avatarSection}>
          {imageUrl ? (
            <img src={imageUrl} alt={displayName} className={styles.avatar} />
          ) : (
            <div className={styles.avatarFallback}>{initials}</div>
          )}
        </div>

        <div className={styles.infoSection}>
          <h2 className={styles.name}>{displayName}</h2>
          {friend.username && (
            <div className={styles.username}>@{friend.username}</div>
          )}
        </div>
      </div>
    </PopUpWrapper>
  );
}

