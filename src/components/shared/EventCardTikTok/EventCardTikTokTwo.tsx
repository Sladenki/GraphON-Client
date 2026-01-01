'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Share,
  CalendarClock,
  MapPinned,
  LogIn,
} from 'lucide-react';
import { useEventRegistration } from '@/hooks/useEventRegistration';
import { useAuth } from '@/providers/AuthProvider';
import { EventItem } from '@/types/schedule.interface';
import ParticipantOrbits from '@/components/shared/EventCard/ParticipantOrbits/ParticipantOrbits';
import styles from './EventCardTikTokTwo.module.scss';
import { linkifyText } from '@/lib/linkify';
import { motion, AnimatePresence } from 'framer-motion';
import { getThemeName, getPastelThemeTikTok } from '@/components/shared/EventCard/pastelTheme';
import SwipeButton from './SwipeButton';

interface EventCardTikTokTwoProps {
  event: EventItem;
  isVisible?: boolean;
}

/**
 * Formats participant count with abbreviation (e.g., 1.2K, 245)
 */
function formatParticipantCount(count: number): string {
  if (count >= 1000) {
    const k = count / 1000;
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * EventCardTikTokTwo - Redesigned TikTok-style event card
 * Premium design with immersive header and dark glass content area
 */
export default function EventCardTikTokTwo({ event, isVisible = true }: EventCardTikTokTwoProps) {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'description'>('info');
  const [isAnimatingAvatar, setIsAnimatingAvatar] = useState(false);

  // Registration hook
  const { isRegistered, toggleRegistration, isLoading } = useEventRegistration(
    event._id,
    (event as any).isAttended
  );

  // Theme for background
  const themeName = useMemo(() => getThemeName(event), [event]);
  const theme = useMemo(() => getPastelThemeTikTok(themeName), [themeName]);

  // Format date for pills
  const formattedDate = useMemo(() => {
    if ((event as any).isDateTbd) return 'Дата уточняется';
    const date = new Date(event.eventDate);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [event.eventDate]);

  // Format time for pills
  const formattedTime = useMemo(() => {
    if ((event as any).isDateTbd) return '';
    if (event.timeFrom && event.timeTo) {
      return `${event.timeFrom} - ${event.timeTo}`;
    } else if (event.timeFrom) {
      return event.timeFrom;
    }
    return '';
  }, [event.timeFrom, event.timeTo]);

  // Check if event is past
  const isEventPast = useMemo(() => {
    if ((event as any).isDateTbd) return false;

    const eventDate = new Date(event.eventDate);

    if (event.timeTo) {
      const [hours, minutes] = event.timeTo.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
    } else {
      eventDate.setHours(23, 59, 59, 999);
    }

    return eventDate < new Date();
  }, [event.eventDate, event.timeTo]);

  // Check if event is student-created
  const isStudentCreated = (event as any).isStudentCreated === true;

  // Author avatar and name
  const fullImageUrl = useMemo(() => {
    if (isStudentCreated && (event as any).createdBy?.avaPath) {
      return (event as any).createdBy.avaPath;
    }
    if (!event.graphId?.imgPath) return '';
    const baseUrl = process.env.NEXT_PUBLIC_S3_URL;
    return `${baseUrl}/${event.graphId.imgPath}`;
  }, [event.graphId?.imgPath, isStudentCreated, (event as any).createdBy?.avaPath]);

  const displayName = useMemo(() => {
    if (isStudentCreated && (event as any).createdBy) {
      const createdBy = (event as any).createdBy;
      return `${createdBy.firstName || ''} ${createdBy.lastName || ''}`.trim() || createdBy.username || '';
    }
    return event.graphId?.name || '';
  }, [isStudentCreated, event.graphId?.name, (event as any).createdBy]);

  const avatarFallback = useMemo(() => {
    if (isStudentCreated && (event as any).createdBy) {
      const createdBy = (event as any).createdBy;
      const name = `${createdBy.firstName || ''} ${createdBy.lastName || ''}`.trim() || createdBy.username || '';
      return name.charAt(0).toUpperCase();
    }
    return (event.graphId?.name || '').charAt(0).toUpperCase();
  }, [isStudentCreated, event.graphId?.name, (event as any).createdBy]);

  // Background style (using theme gradient)
  const backgroundStyle = useMemo(() => {
    return {
      background: theme.headerBgLight,
    };
  }, [theme]);

  // Handlers
  const handleRegistration = useCallback(async () => {
    if (!isLoggedIn) {
      router.push('/signIn');
      return;
    }
    try {
      const wasRegistered = isRegistered;
      await toggleRegistration();

      if (!wasRegistered) {
        setIsAnimatingAvatar(true);
        setTimeout(() => setIsAnimatingAvatar(false), 1400);
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  }, [isLoggedIn, router, toggleRegistration, isRegistered]);

  const handleShare = useCallback(async () => {
    try {
      const shareUrl = `${window.location.origin}/events/${event._id}`;
      const fullTime = (event as any).isDateTbd 
        ? 'Дата и время уточняется'
        : `${formattedDate}${formattedTime ? `, ${formattedTime}` : ''}`;
      const text = `${event.name} — ${fullTime}${event.place ? `, ${event.place}` : ''}`;
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;

      const opened = window.open(telegramUrl, '_blank', 'noopener,noreferrer');
      if (opened) {
        return;
      }

      if (navigator.share) {
        await navigator.share({ title: event.name, text: `${event.name}`, url: shareUrl } as any);
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
    } catch (err) {
      const fallbackUrl = `${window.location.origin}/events/${event._id}`;
      try {
        if (navigator.share) {
          await navigator.share({ title: event.name, text: `${event.name}`, url: fallbackUrl } as any);
          return;
        }
      } catch {}
      try {
        await navigator.clipboard.writeText(fallbackUrl);
      } catch {
        // ignore
      }
    }
  }, [event._id, event.name, formattedDate, formattedTime, event.place]);

  const handleGroupClick = useCallback(() => {
    if (isStudentCreated && (event as any).createdBy?._id) {
      router.push(`/friends/${(event as any).createdBy._id}`);
      return;
    }
    const graphId = typeof event.graphId === 'object' ? event.graphId._id : event.graphId;
    if (!graphId) return;
    router.push(`/groups/${graphId}`);
  }, [event.graphId, router, isStudentCreated, (event as any).createdBy?._id]);

  // Participant count formatting
  const participantCount = event.regedUsers || 0;
  const formattedCount = formatParticipantCount(participantCount);

  if (!event || !event._id) {
    return null;
  }

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.96 }}
      transition={{
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1],
      }}>
      {/* Block 1: Event Header (Immersive Background) */}
      <div className={styles.headerBlock} style={backgroundStyle}>
        {/* Share Button - Top Right (Circular, White, Icon-only) */}
        <button className={styles.shareButton} onClick={handleShare} aria-label="Поделиться">
          <Share size={18} />
        </button>

        {/* Event Title */}
        <div className={styles.titleContainer}>
          <h1 className={styles.eventTitle}>{event.name}</h1>
        </div>

        {/* Bottom Row: Participant Orbits + Author */}
        <div className={styles.bottomRow}>
          {/* Left: Participant Orbits + Count */}
          <div className={styles.participantsSection}>
            <div className={styles.participantsOrbits}>
              <ParticipantOrbits
                eventId={event._id}
                totalCount={participantCount}
                isRegistered={isRegistered}
                onRegister={undefined}
                isAnimating={isAnimatingAvatar}
              />
            </div>
            {/* <span className={styles.participantCount}>{formattedCount}</span> */}
          </div>

          {/* Right: Author Avatar + Name */}
          <div className={styles.authorSection} onClick={handleGroupClick}>
            <div className={styles.authorAvatar}>
              {fullImageUrl ? (
                <img src={fullImageUrl} alt={displayName} className={styles.avatarImage} />
              ) : (
                <div className={styles.avatarFallback}>{avatarFallback}</div>
              )}
            </div>
            <span className={styles.authorName}>{displayName}</span>
          </div>
        </div>
      </div>

      {/* Block 2: Content Area (Dark Glass) */}
      <div className={styles.contentBlock}>
        {/* Tabs Navigation - Fixed at top */}
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tab} ${activeTab === 'info' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('info')}
            type="button">
            Информация
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'description' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('description')}
            type="button">
            Описание
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          <AnimatePresence mode="wait">
            {activeTab === 'info' ? (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={styles.infoContent}>
                {/* Date and Time Pills */}
                <div className={styles.infoPills}>
                  {formattedDate && (
                    <div className={styles.infoPill}>
                      <CalendarClock size={16} />
                      <span>{formattedDate}</span>
                    </div>
                  )}
                  {formattedTime && (
                    <div className={styles.infoPill}>
                      <CalendarClock size={16} />
                      <span>{formattedTime}</span>
                    </div>
                  )}
                  {event.place && (
                    <div className={styles.infoPill}>
                      <MapPinned size={16} />
                      <span>{event.place}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="description"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={styles.descriptionContent}>
                <div className={styles.descriptionText}>
                  {event.description ? linkifyText(event.description) : 'Описание отсутствует'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Registration CTA (Persistent at Bottom - Inside Dark Block) */}
        <div className={styles.registrationCTA}>
        {isEventPast ? (
          <div className={styles.pastEventButton}>Мероприятие завершено</div>
        ) : !isLoggedIn ? (
          <button className={styles.loginButton} onClick={handleRegistration}>
            <LogIn size={20} />
            <span>Войти для регистрации</span>
          </button>
        ) : (
          <SwipeButton
            onSwipeComplete={handleRegistration}
            disabled={isLoading}
            isLoading={isLoading}
            isRegistered={isRegistered}
            onUnregister={handleRegistration}
            text="Свайп для регистрации"
            registeredText="Вы записаны"
          />
        )}
        </div>
      </div>

      {/* Animated Avatar (for registration feedback) */}
      <AnimatePresence>
        {isAnimatingAvatar && user && (
          <motion.div
            className={styles.animatedAvatar}
            initial={{ scale: 0.6, opacity: 0, y: 0 }}
            animate={{ scale: [0.6, 1.3, 1], opacity: [0, 1, 1, 0.8, 0], y: [0, -90, -90] }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1], times: [0, 0.2, 0.7, 0.9, 1] }}>
            {user?.avaPath ? (
              <img
                src={
                  user.avaPath.startsWith('http')
                    ? user.avaPath
                    : `${process.env.NEXT_PUBLIC_S3_URL}/${user.avaPath}`
                }
                alt={user?.firstName || user?.lastName || 'User'}
                className={styles.animatedAvatarImage}
              />
            ) : (
              <div className={styles.animatedAvatarFallback}>
                {(user?.firstName?.[0] || user?.lastName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

