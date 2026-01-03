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
  Navigation,
  UserCheck,
} from 'lucide-react';
import { useEventRegistration } from '@/hooks/useEventRegistration';
import { useAuth } from '@/providers/AuthProvider';
import { EventItem } from '@/types/schedule.interface';
import ParticipantOrbits from '@/components/shared/EventCard/ParticipantOrbits/ParticipantOrbits';
import styles from './EventCardTikTok.module.scss';
import { linkifyText } from '@/lib/linkify';
import { motion, AnimatePresence } from 'framer-motion';
import SwipeButton from './SwipeButton';
import CompanyRequestModal from '@/components/shared/CompanyRequestModal/CompanyRequestModal';
import { CompanyRequestService } from '@/services/companyRequest.service';
import { notifyError, notifySuccess } from '@/lib/notifications';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { InviteFriendModal } from '@/components/shared/EventCard/InviteFriendModal/InviteFriendModal';
import { useSelectedGraphId } from '@/stores/useUIStore';
import PopUpWrapper from '@/components/global/PopUpWrapper/PopUpWrapper';

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

const CITY_GRAPH_ID = "690bfec3f371d05b325be7ad";

export default function EventCardTikTok({ event, isVisible = true }: EventCardTikTokProps) {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const queryClient = useQueryClient();

  const selectedGraphId = useSelectedGraphId();

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isDescriptionPopupOpen, setIsDescriptionPopupOpen] = useState(false);

  const handleReadMoreClick = useCallback(() => {
    setIsDescriptionPopupOpen(true);
  }, []);
  const [isAnimatingAvatar, setIsAnimatingAvatar] = useState(false);
  const [isCompanyRequestModalOpen, setIsCompanyRequestModalOpen] = useState(false);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInviteFriendOpen, setIsInviteFriendOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Хуки
  const { isRegistered, toggleRegistration, isLoading } = useEventRegistration(event._id, (event as any).isAttended);

  // Проверка активного запроса через React Query
  const { data: companyRequests } = useQuery({
    queryKey: ['companyRequests', event._id],
    queryFn: () => CompanyRequestService.getRequestsByEvent(event._id),
    enabled: isLoggedIn && !!user?._id && !!event._id,
    staleTime: 30_000, // 30 секунд
    refetchOnWindowFocus: false,
  });

  // Определяем, есть ли активный запрос от текущего пользователя
  const hasActiveRequest = useMemo(() => {
    if (!isLoggedIn || !user?._id || !companyRequests) return false;
    
    const userId = typeof user._id === 'string' ? user._id : (user._id as any)?._id;
    const myRequest = companyRequests.find(r => {
      const initiatorId = typeof r.initiator._id === 'string' ? r.initiator._id : (r.initiator._id as any)?._id;
      return String(initiatorId) === String(userId);
    });
    return !!myRequest;
  }, [isLoggedIn, user?._id, companyRequests]);

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

  const shouldTruncate = descriptionText.length > 150;
  const truncatedText = useMemo(() => {
    if (!shouldTruncate || isDescriptionExpanded) return descriptionText;
    return descriptionText.slice(0, 150);
  }, [descriptionText, shouldTruncate, isDescriptionExpanded]);

  // Проверка, является ли мероприятие созданным студентом
  const isStudentCreated = (event as any).isStudentCreated === true;

  // Полный URL изображения группы или пользователя
  const fullImageUrl = useMemo(() => {
    if (isStudentCreated && (event as any).createdBy?.avaPath) {
      // Для мероприятий, созданных студентами, используем аватар пользователя
      return (event as any).createdBy.avaPath;
    }
    if (!event.graphId?.imgPath) return '';
    const baseUrl = process.env.NEXT_PUBLIC_S3_URL;
    return `${baseUrl}/${event.graphId.imgPath}`;
  }, [event.graphId?.imgPath, isStudentCreated, (event as any).createdBy?.avaPath]);

  // Получаем название группы или имя пользователя
  const displayName = useMemo(() => {
    if (isStudentCreated && (event as any).createdBy) {
      const createdBy = (event as any).createdBy;
      return `${createdBy.firstName || ''} ${createdBy.lastName || ''}`.trim() || createdBy.username || '';
    }
    return event.graphId?.name || '';
  }, [isStudentCreated, event.graphId?.name, (event as any).createdBy]);

  // Получаем fallback для аватара (первая буква имени или названия)
  const avatarFallback = useMemo(() => {
    if (isStudentCreated && (event as any).createdBy) {
      const createdBy = (event as any).createdBy;
      const name = `${createdBy.firstName || ''} ${createdBy.lastName || ''}`.trim() || createdBy.username || '';
      return name.charAt(0).toUpperCase();
    }
    return (event.graphId?.name || '').charAt(0).toUpperCase();
  }, [isStudentCreated, event.graphId?.name, (event as any).createdBy]);

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
    setIsMenuOpen(false);
    try {
      const shareUrl = `${window.location.origin}/events/${event._id}`;
      const text = `${event.name} — ${formattedTime}${event.place ? `, ${event.place}` : ''}`;
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;

      const opened = window.open(telegramUrl, '_blank', 'noopener,noreferrer');
      if (opened) {
        return;
      }

      // Если всплывающее окно заблокировано
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
  }, [event._id, event.name, formattedTime, event.place]);

  const handleInviteFriend = useCallback(() => {
    setIsMenuOpen(false);
    setIsInviteFriendOpen(true);
  }, []);

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  // Обработчик клика на группу или пользователя
  const handleGroupClick = useCallback(() => {
    if (isStudentCreated && (event as any).createdBy?._id) {
      // Для мероприятий, созданных студентами, переходим на профиль пользователя
      router.push(`/friends/${(event as any).createdBy._id}`);
      return;
    }
    const graphId = typeof event.graphId === 'object' ? event.graphId._id : event.graphId;
    if (!graphId) return;
    router.push(`/groups/${graphId}`);
  }, [event.graphId, router, isStudentCreated, (event as any).createdBy?._id]);

  const handleCompanyRequest = useCallback(async () => {
    if (!isLoggedIn) {
      router.push('/signIn');
      return;
    }

    setIsCreatingRequest(true);
    try {
      await CompanyRequestService.createRequest(event._id);
      // Инвалидируем кеш, чтобы обновить состояние
      await queryClient.invalidateQueries({ queryKey: ['companyRequests', event._id] });
      notifySuccess('Вы ищете компанию');
      setIsCompanyRequestModalOpen(true);
    } catch (error: any) {
      console.error('Error creating company request:', error);
      if (error?.response?.data?.requestId) {
        // У пользователя уже есть активный запрос
        await queryClient.invalidateQueries({ queryKey: ['companyRequests', event._id] });
        setIsCompanyRequestModalOpen(true);
      } else {
        notifyError('Не удалось создать запрос');
      }
    } finally {
      setIsCreatingRequest(false);
    }
  }, [isLoggedIn, router, event._id, queryClient]);

  const handleViewCompanyRequests = useCallback(async () => {
    if (!isLoggedIn) {
      router.push('/signIn');
      return;
    }
    // Обновляем кеш перед открытием модального окна
    await queryClient.invalidateQueries({ queryKey: ['companyRequests', event._id] });
    setIsCompanyRequestModalOpen(true);
  }, [isLoggedIn, router, event._id, queryClient]);

  if (!event || !event._id) {
    return null;
  }

  return (
    <motion.div
      className={styles.card}
      style={{
        marginBottom: selectedGraphId === CITY_GRAPH_ID ? '10%' : '',
      }}
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
              alt={displayName}
              fallback={avatarFallback}
            />
            <span className={styles.groupName}>{displayName}</span>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.menuContainer} ref={menuRef}>
              <button 
                className={styles.navigationButton} 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Меню действий"
                aria-expanded={isMenuOpen}
              >
                <Share size={18} />
              </button>
              {isMenuOpen && (
                <div className={styles.menu}>
                  <button 
                    className={styles.menuItem}
                    onClick={handleShare}
                    aria-label="Поделиться"
                  >
                    <Share size={16} />
                    <span>Поделиться</span>
                  </button>
                  {isLoggedIn && (
                    <button 
                      className={styles.menuItem}
                      onClick={handleInviteFriend}
                      aria-label="Пригласить друга"
                    >
                      <UserCheck size={16} />
                      <span>Пригласить друга</span>
                    </button>
                  )}
                </div>
              )}
            </div>
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
              onClick={handleReadMoreClick}
              type="button">
              {'Читать дальше'}
            </button>
          )}
        </div>
      </div>

       {/* Important Info - время и место (компактные карточки) */}
       <div className={styles.importantInfo}>
         <div className={styles.timeInfo}>
           <div className={styles.metaIconWrapper}>
             <CalendarClock className={styles.metaIcon} size={20} />
           </div>
           <span className={styles.timeText}>{formattedTime}</span>
         </div>

         {event.place && (
         <div className={styles.placeInfo}>
           <div className={styles.metaIconWrapper}>
             <MapPinned className={styles.metaIcon} size={20} />
           </div>
           <span className={styles.placeText}>{event.place}</span>
         </div>
         )}
       </div>

      {/* Footer - орбиты участников и кнопка регистрации */}
      <div className={styles.cardFooter}>
        {/* Орбиты участников и кнопка компании */}
        {/* <div className={styles.participantsSection}>
          <div className={styles.participantsOrbits}>
            <ParticipantOrbits
              eventId={event._id}
              totalCount={event.regedUsers}
              isRegistered={isRegistered}
              onRegister={undefined}
              isAnimating={isAnimatingAvatar}
            />
          </div>
          {isLoggedIn && (
            <button
              className={styles.companyButton}
              onClick={hasActiveRequest ? handleViewCompanyRequests : handleCompanyRequest}
              disabled={isCreatingRequest}
              aria-label={hasActiveRequest ? "Кто ищет компанию" : "Ищу компанию"}
            >
              {hasActiveRequest ? (
                <>
                  <Search size={16} />
                  <span>Кто ищет компании</span>
                </>
              ) : (
                <>
                  <Users size={16} />
                  <span>Ищу компанию</span>
                </>
              )}
            </button>
          )}
        </div> */}

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
        onClose={async () => {
          setIsCompanyRequestModalOpen(false);
          // Обновляем кеш после закрытия модального окна
          await queryClient.invalidateQueries({ queryKey: ['companyRequests', event._id] });
        }}
        eventId={event._id}
      />

      <InviteFriendModal
        isOpen={isInviteFriendOpen}
        onClose={() => setIsInviteFriendOpen(false)}
        eventId={event._id}
        eventName={event.name}
      />
      
      {/* Description Popup */}
      {isDescriptionPopupOpen && (
        <PopUpWrapper
          isOpen={isDescriptionPopupOpen}
          onClose={() => setIsDescriptionPopupOpen(false)}
          width={500}
        
        >
          <div className={styles.popupDescription}>
            {linkifyText(event.description || '')}
          </div>
        </PopUpWrapper>
      )}
    </motion.div>
  );
}
