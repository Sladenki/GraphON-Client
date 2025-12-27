'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Share2,
  CalendarClock,
  MapPinned,
  UserPlus,
  UserX,
  LogIn,
} from 'lucide-react';
import { useEventRegistration } from '@/hooks/useEventRegistration';
import { useAuth } from '@/providers/AuthProvider';
import { EventItem } from '@/types/schedule.interface';
import ParticipantOrbits from '@/components/shared/EventCard/ParticipantOrbits/ParticipantOrbits';
import styles from './EventCardTikTok.module.scss';
import { linkifyText } from '@/lib/linkify';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getPastelTheme, getThemeName } from '@/components/shared/EventCard/pastelTheme';
import { RegistrationSuccessModal } from '@/components/shared/EventCard/RegistrationSuccessModal/RegistrationSuccessModal';

interface EventCardTikTokProps {
  event: EventItem;
  isVisible?: boolean;
}

// Простой компонент аватара группы
const GroupAvatar: React.FC<{
  src: string;
  alt: string;
  fallback: string;
}> = ({ src, alt, fallback }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={styles.groupAvatar}>
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          className={styles.avatarImage}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={styles.avatarFallback}>
          {fallback.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

/**
 * EventCardTikTok - специализированная карточка события для TikTok-ленты
 * Упрощенная версия EventCard без редактирования
 */
export default function EventCardTikTok({ event, isVisible = true }: EventCardTikTokProps) {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Хуки
  const { isRegistered, toggleRegistration, isLoading } = useEventRegistration(event._id, (event as any).isAttended);

  // Триумфальная анимация кнопки сразу после клика "Записаться"
  const [isJustRegistered, setIsJustRegistered] = useState(false);
  const prevRegisteredRef = useRef<boolean>(isRegistered);
  useEffect(() => {
    const prev = prevRegisteredRef.current;
    if (!prev && isRegistered) {
      setIsJustRegistered(true);
      const t = setTimeout(() => setIsJustRegistered(false), 900);
      prevRegisteredRef.current = isRegistered;
      return () => clearTimeout(t);
    }
    prevRegisteredRef.current = isRegistered;
  }, [isRegistered]);

  // Форматирование времени
  const formattedTime = useMemo(() => {
    if ((event as any).isDateTbd) return 'Дата и время уточняется';

    const date = new Date(event.eventDate);
    const dateStr = date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    if (event.timeFrom && event.timeTo) {
      return `${dateStr}, ${event.timeFrom} - ${event.timeTo}`;
    } else if (event.timeFrom) {
      return `${dateStr}, ${event.timeFrom}`;
    } else {
      return dateStr;
    }
  }, [event.eventDate, event.timeFrom, event.timeTo]);

  // Проверка, прошло ли мероприятие
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

  // Логика для "Читать дальше" в описании
  const descriptionText = useMemo(() => {
    if (!event.description) return '';
    return event.description;
  }, [event.description]);

  const shouldTruncate = descriptionText.length > 300;
  const truncatedText = useMemo(() => {
    if (!shouldTruncate || isDescriptionExpanded) return descriptionText;
    return descriptionText.slice(0, 300);
  }, [descriptionText, shouldTruncate, isDescriptionExpanded]);

  // URL изображения
  const fullImageUrl = useMemo(() => {
    if (!event.graphId?.imgPath) return '';
    const baseUrl = process.env.NEXT_PUBLIC_S3_URL;
    return `${baseUrl}/${event.graphId.imgPath}`;
  }, [event.graphId?.imgPath]);

  // Обработчики
  const handleRegistration = useCallback(async () => {
    if (!isLoggedIn) {
      router.push('/signIn');
      return;
    }
    try {
      const wasRegistered = isRegistered;
      await toggleRegistration();

      if (!wasRegistered) {
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.65 },
          });
        } catch {}
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  }, [isLoggedIn, router, toggleRegistration, isRegistered]);

  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}/events/${event._id}`;
    const text = `${event.name} — ${formattedTime}${event.place ? `, ${event.place}` : ''}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: event.name, text: text, url: shareUrl } as any);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  }, [event.name, event.place, formattedTime]);

  const handleGroupClick = useCallback(() => {
    const graphId = typeof event.graphId === 'object' ? event.graphId._id : event.graphId;
    router.push(`/groups/${graphId}`);
  }, [event.graphId, router]);

  const themeName = getThemeName(event);
  const pastel = getPastelTheme(themeName);

  // Кнопка регистрации
  const registerButton = useMemo(() => {
    if (isEventPast) {
      return (
        <button className={styles.registerButton} disabled>
          <span>Мероприятие завершено</span>
        </button>
      );
    }

    if (!isLoggedIn) {
      return (
        <button className={styles.registerButton} onClick={handleRegistration}>
          <LogIn size={22} />
          <span>Войти для регистрации</span>
        </button>
      );
    }

    if (isRegistered) {
      return (
        <button
          className={`${styles.registerButton} ${styles.registeredButton} ${isJustRegistered ? styles.justRegistered : ''}`}
          onClick={handleRegistration}
          disabled={isLoading}>
          <UserX size={22} />
          <span>Отменить регистрацию</span>
        </button>
      );
    }

    return (
      <button className={styles.registerButton} onClick={handleRegistration} disabled={isLoading}>
        <UserPlus size={22} />
        <span>Записаться</span>
      </button>
    );
  }, [isLoggedIn, isRegistered, isJustRegistered, isLoading, handleRegistration, isEventPast]);

  if (!event || !event._id) {
    return null;
  }

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={
        isVisible
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 30, scale: 0.96 }
      }
      transition={{
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1], // Красивая пружинящая анимация
      }}>
      {/* Header - название и группа */}
      <div className={styles.cardHeader}>
        <div className={styles.headerTop}>
          <div className={styles.groupInfo} onClick={handleGroupClick}>
            <GroupAvatar
              src={fullImageUrl}
              alt={event.graphId?.name || ''}
              fallback={event.graphId?.name || ''}
            />
            <span className={styles.groupName}>{event.graphId?.name || ''}</span>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.shareButton} onClick={handleShare} aria-label="Поделиться">
              <Share2 size={16} />
            </button>
          </div>
        </div>

        <div className={styles.titleSection}>
          <h2 className={styles.eventTitle}>{event.name}</h2>
        </div>
      </div>

      {/* Description */}
      <div className={styles.cardBody}>
        <div className={styles.description}>
          {linkifyText(truncatedText)}
          {shouldTruncate && (
            <button
              className={styles.readMoreButton}
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              type="button">
              {isDescriptionExpanded ? 'Свернуть' : 'Читать дальше'}
            </button>
          )}
        </div>
      </div>

      {/* Important Info - время и место (компактные карточки) */}
      <div className={styles.importantInfo}>
        <div className={styles.timeInfo}>
          <CalendarClock size={20} />
          <span className={styles.timeText}>{formattedTime}</span>
        </div>

        {event.place && (
          <div className={styles.placeInfo}>
            <MapPinned size={20} />
            <span className={styles.placeText}>{event.place}</span>
          </div>
        )}
      </div>

      {/* Footer - орбиты участников и кнопка регистрации */}
      <div className={styles.cardFooter}>
        {/* Орбиты участников - над кнопкой */}
        <div className={styles.participantsOrbits}>
          <ParticipantOrbits
            eventId={event._id}
            totalCount={event.regedUsers}
            isRegistered={isRegistered}
            onRegister={undefined}
          />
        </div>

        {/* Доминирующая кнопка регистрации */}
        {registerButton}
      </div>

      {/* Viral Success Moment */}
      <RegistrationSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        event={{ id: event._id, name: event.name, description: event.description }}
        user={{
          name:
            user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.firstName || user?.lastName || user?.username || 'User',
          avatarUrl: user?.avaPath ? user.avaPath : undefined,
        }}
        theme={{ primary: '#7C6AEF', secondary: '#9682EE', accent: '#EE82C8' }}
      />
    </motion.div>
  );
}
