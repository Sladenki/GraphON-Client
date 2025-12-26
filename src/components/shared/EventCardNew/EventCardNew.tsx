'use client';

import React, { useMemo, useState } from 'react';
import { MapPin, CalendarDays, Plus, Check, MoreHorizontal } from 'lucide-react';
import styles from './EventCardNew.module.scss';
import { useEventRegistration } from '@/hooks/useEventRegistration';
import { useAuth } from '@/providers/AuthProvider';
import { EventItem } from '@/types/schedule.interface';
import { getPastelTheme, getThemeName } from '@/components/shared/EventCard/pastelTheme';

const BASE_S3_URL = process.env.NEXT_PUBLIC_S3_URL;

type EventCardNewProps = {
  event: EventItem | any;
};

const pastelByTopic = (topic: string) => {
  const t = topic.toLowerCase();
  if (t.includes('react') || t.includes('frontend') || t.includes('engineer')) return styles.sage;
  if (t.includes('design') || t.includes('ui') || t.includes('ux')) return styles.blush;
  if (t.includes('data') || t.includes('analysis')) return styles.peach;
  if (t.includes('mobile') || t.includes('ios') || t.includes('android')) return styles.mint;
  return styles.sand;
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'Без даты';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function EventCardNew({ event }: EventCardNewProps) {
  const { user } = useAuth();
  const { isRegistered, toggleRegistration, isLoading } = useEventRegistration(event._id, event.isAttended);
  const [justAdded, setJustAdded] = useState(false);

  const themeName = useMemo(() => getThemeName(event), [event]);
  const pastel = useMemo(() => getPastelTheme(themeName), [themeName]);

  const topicTone = useMemo(() => {
    const topic = event?.graphId?.name || event?.name || '';
    return pastelByTopic(topic);
  }, [event?.graphId?.name, event?.name]);

  const handleRegister = async () => {
    await toggleRegistration();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 800);
  };

  const regCount = event?.regedUsers ?? 0;
  const displayCount = isRegistered ? regCount + 1 : regCount;
  const userInitial =
    (user?.firstName && user.firstName[0]) ||
    (user?.lastName && user.lastName[0]) ||
    user?.username?.[0] ||
    'U';

  // Собираем аватары участников (до 3)
  const participantAvatars: string[] = useMemo(() => {
    const fromParticipants =
      event?.participants?.slice?.(0, 3)?.map?.((p: any) => p?.avaPath || '') ||
      event?.regUsers?.slice?.(0, 3)?.map?.((p: any) => p?.avaPath || '') ||
      [];

    if (fromParticipants.length > 0) return fromParticipants;

    const graphImg = event?.graphId?.imgPath ? `${BASE_S3_URL}/${event.graphId.imgPath}` : '';
    if (graphImg) return [graphImg];

    const parentImg = event?.graphId?.parentGraphId?.imgPath
      ? `${BASE_S3_URL}/${event.graphId.parentGraphId.imgPath}`
      : '';
    if (parentImg) return [parentImg];

    return [];
  }, [event]);

  const metrics =
    event?.metrics ||
    [
      { label: 'Linkedin', percent: 40, count: 20 },
      { label: 'Seek', percent: 40, count: 20 },
      { label: 'Glassdoor', percent: 20, count: 10 },
    ];

  const statusLabel = event?.graphId?.name || 'Группа';
  const statusTone = styles.statusOpen;

  return (
    <article
      className={`${styles.card} ${topicTone}`}
      style={{ background: pastel?.headerBgDark || undefined }}
    >
      <header className={styles.header}>
        <span className={`${styles.status} ${statusTone}`}>
          <span className={styles.dot} aria-hidden="true" />
          {statusLabel}
        </span>
        <button className={styles.iconCircle} type="button" aria-label="Опции">
          <MoreHorizontal size={18} />
        </button>
      </header>

      <div className={styles.metaRow}>
        <CalendarDays size={16} />
        <span className={styles.metaText}>{formatDate(event?.eventDate)}</span>
      </div>

      <div className={styles.titleRow}>
        <div className={styles.title}>{event?.name}</div>
        <div className={styles.avatars}>
          {participantAvatars.length === 0 && (
            <>
              <div className={styles.avatar} aria-hidden="true">
                A
              </div>
              <div className={styles.avatar} aria-hidden="true">
                B
              </div>
            </>
          )}
          {participantAvatars.map((src, idx) => (
            <div key={`avatar-${idx}`} className={styles.avatarImgWrap}>
              {src ? <img src={src} alt="Участник" /> : <div className={styles.avatar}>{'?'}</div>}
            </div>
          ))}
          {isRegistered && (
            <div className={`${styles.avatar} ${styles.me} ${justAdded ? styles.pulseIn : ''}`}>
              {userInitial}
            </div>
          )}
          <button
            type="button"
            className={`${styles.addBtn} ${isRegistered ? styles.added : ''}`}
            onClick={handleRegister}
            disabled={isLoading}
            aria-label={isRegistered ? 'Вы уже зарегистрированы' : 'Записаться'}
          >
            {isRegistered ? <Check size={18} /> : <Plus size={18} />}
          </button>
        </div>
      </div>

      <div className={styles.metaRow}>
        <MapPin size={16} />
        <span className={styles.metaText}>{event?.place || 'Локация уточняется'}</span>
      </div>

      <div className={styles.metrics}>
        {metrics.map((m: any, idx: number) => (
          <div key={`${m.label}-${idx}`} className={styles.metricTile}>
            <div className={styles.metricLabel}>{m.label}</div>
            <div className={styles.metricValue}>{m.percent}%</div>
            <div className={styles.metricSub}>{m.count} заявок</div>
          </div>
        ))}
      </div>

      <div className={styles.countLabel}>{displayCount} участников</div>
    </article>
  );
}

