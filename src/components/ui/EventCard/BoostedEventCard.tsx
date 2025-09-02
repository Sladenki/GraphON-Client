"use client";

import React from 'react';
import EventCard from './EventCard';
import { EventItem } from '@/types/schedule.interface';
import { Crown } from 'lucide-react';
import styles from './BoostedEventCard.module.scss';

interface BoostedEventCardProps {
  event: EventItem;
  onDelete?: (eventId: string) => void;
}

const BoostedEventCard: React.FC<BoostedEventCardProps> = React.memo(({ event, onDelete }) => {
  if (!event) return null;

  return (
    <div className={styles.boostedWrapper}>
      <div className={styles.badge}>
        <Crown size={14} className={styles.badgeIcon} />
        <span className={styles.badgeText}>Продвигаемое</span>
      </div>
      <EventCard event={event} isAttended={event.isAttended} onDelete={onDelete} />
    </div>
  );
});

BoostedEventCard.displayName = 'BoostedEventCard';

export default BoostedEventCard;


