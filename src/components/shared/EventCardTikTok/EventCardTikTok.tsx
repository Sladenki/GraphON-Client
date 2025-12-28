'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Share,
  CalendarClock,
  MapPinned,
  LogIn,
  Users,
  Search,
} from 'lucide-react';
import { useEventRegistration } from '@/hooks/useEventRegistration';
import { useAuth } from '@/providers/AuthProvider';
import { EventItem } from '@/types/schedule.interface';
import ParticipantOrbits from '@/components/shared/EventCard/ParticipantOrbits/ParticipantOrbits';
import styles from './EventCardTikTok.module.scss';
import { linkifyText } from '@/lib/linkify';
import { motion, AnimatePresence } from 'framer-motion';
import { getThemeName } from '@/components/shared/EventCard/pastelTheme';
import SwipeButton from './SwipeButton';
import CompanyRequestModal from '@/components/shared/CompanyRequestModal/CompanyRequestModal';
import { CompanyRequestService } from '@/services/companyRequest.service';
import { notifyError, notifySuccess } from '@/lib/notifications';

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
  const [isAnimatingAvatar, setIsAnimatingAvatar] = useState(false);
  const [isCompanyRequestModalOpen, setIsCompanyRequestModalOpen] = useState(false);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [hasActiveRequest, setHasActiveRequest] = useState(false);

  // Хуки
  const { isRegistered, toggleRegistration, isLoading } = useEventRegistration(event._id, (event as any).isAttended);

  // Проверка активного запроса при загрузке
  useEffect(() => {
    if (isLoggedIn && user?._id) {
      const checkActiveRequest = async () => {
        try {
          const requests = await CompanyRequestService.getRequestsByEvent(event._id);
          const myRequest = requests.find(r => r.initiator._id === user._id);
          setHasActiveRequest(!!myRequest);
        } catch (error) {
          // Игнорируем ошибки при проверке
          console.error('Error checking active request:', error);
        }
      };
      checkActiveRequest();
    }
  }, [isLoggedIn, user?._id, event._id]);

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
        // Запускаем анимацию перемещения аватарки
        setIsAnimatingAvatar(true);
        setTimeout(() => setIsAnimatingAvatar(false), 1400); // Длительность анимации
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

  const handleCompanyRequest = useCallback(async () => {
    if (!isLoggedIn) {
      router.push('/signIn');
      return;
    }

    setIsCreatingRequest(true);
    try {
      await CompanyRequestService.createRequest(event._id);
      setHasActiveRequest(true);
      notifySuccess('Вы ищете компанию');
      setIsCompanyRequestModalOpen(true);
    } catch (error: any) {
      console.error('Error creating company request:', error);
      if (error?.response?.data?.requestId) {
        // У пользователя уже есть активный запрос
        setHasActiveRequest(true);
        setIsCompanyRequestModalOpen(true);
      } else {
        notifyError('Не удалось создать запрос');
      }
    } finally {
      setIsCreatingRequest(false);
    }
  }, [isLoggedIn, router, event._id]);

  const handleViewCompanyRequests = useCallback(() => {
    if (!isLoggedIn) {
      router.push('/signIn');
      return;
    }
    setIsCompanyRequestModalOpen(true);
  }, [isLoggedIn, router]);

  const themeName = getThemeName(event);

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
            <button 
              className={styles.viewCompanyRequestsButton} 
              onClick={handleViewCompanyRequests}
              aria-label="Кто ищет компанию"
              title="Кто ищет компанию"
            >
              <Search size={18} />
            </button>
            <button 
              className={styles.companyRequestButton} 
              onClick={handleCompanyRequest}
              disabled={isCreatingRequest}
              aria-label="Ищу компанию"
              title={hasActiveRequest ? "Вы уже ищете компанию" : "Ищу компанию"}
            >
              <Users size={18} />
              {hasActiveRequest && <span className={styles.activeIndicator} />}
            </button>
            <button className={styles.shareButton} onClick={handleShare} aria-label="Поделиться">
              <Share />
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
            isAnimating={isAnimatingAvatar}
          />
        </div>

        {/* Swipe-to-register кнопка */}
        <div className={styles.registerButtonWrapper}>
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

        {/* Анимация перемещения аватарки от кнопки к списку */}
        <AnimatePresence>
          {isAnimatingAvatar && user && (
            <motion.div
              className={styles.animatedAvatar}
              initial={{
                scale: 0.6,
                opacity: 0,
                y: 0,
              }}
              animate={{
                scale: [0.6, 1.3, 1],
                opacity: [0, 1, 1, 0.8, 0],
                y: [0, -90, -90],
              }}
              exit={{
                scale: 0,
                opacity: 0,
              }}
              transition={{
                duration: 1.4,
                ease: [0.34, 1.56, 0.64, 1],
                times: [0, 0.2, 0.7, 0.9, 1],
              }}>
              {user?.avaPath ? (
                <img
                  src={user.avaPath.startsWith('http') ? user.avaPath : `${process.env.NEXT_PUBLIC_S3_URL}/${user.avaPath}`}
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
      </div>

      <CompanyRequestModal
        isOpen={isCompanyRequestModalOpen}
        onClose={() => setIsCompanyRequestModalOpen(false)}
        eventId={event._id}
      />
    </motion.div>
  );
}
