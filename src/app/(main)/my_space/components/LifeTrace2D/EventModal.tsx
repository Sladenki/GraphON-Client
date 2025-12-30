'use client';

import React from 'react';
import { X } from 'lucide-react';
import { EventNode, CATEGORY_COLORS } from './types';
import styles from './EventModal.module.scss';

interface EventModalProps {
  event: EventNode;
  onClose: () => void;
}

export function EventModal({ event, onClose }: EventModalProps) {
  const categoryNames: Record<string, string> = {
    sport: 'Спорт',
    science: 'Наука/IT',
    creative: 'Творчество',
    general: 'Общее',
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
          <X size={20} />
        </button>

        <div className={styles.header}>
          <div
            className={styles.categoryBadge}
            style={{ backgroundColor: CATEGORY_COLORS[event.category] }}
          >
            {categoryNames[event.category]}
          </div>
          <h2 className={styles.title}>{event.name}</h2>
        </div>

        <div className={styles.content}>
          <div className={styles.date}>
            <strong>Дата:</strong> {formatDate(event.timestamp)}
          </div>

          {event.description && (
            <div className={styles.description}>
              <strong>Описание:</strong>
              <p>{event.description}</p>
            </div>
          )}

          <div className={styles.friends}>
            <strong>Друзья на событии:</strong>
            <div className={styles.friendsList}>
              <span className={styles.friendTag}>Друг 1</span>
              <span className={styles.friendTag}>Друг 2</span>
              <span className={styles.friendTag}>Друг 3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

