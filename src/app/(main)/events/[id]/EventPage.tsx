'use client'

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  UserPlus, 
  UserX,
  CalendarClock,
  Share2,
  ExternalLink
} from 'lucide-react';
import { EventService } from '@/services/event.service';
import { useAuth } from '@/providers/AuthProvider';
import { useEventRegistration } from '@/hooks/useEventRegistration';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { UserRole } from '@/types/user.interface';
import { linkifyText } from '@/lib/linkify';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { notifySuccess, notifyError } from '@/lib/notifications';
import styles from './EventPage.module.scss';

interface EventPageProps {
  eventId: string;
}

const EventPage: React.FC<EventPageProps> = ({ eventId }) => {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  
  const [isAttendeesOpen, setIsAttendeesOpen] = useState(false);

  // Получение данных события
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => EventService.getEventById(eventId),
    enabled: !!eventId,
  });

  const { isRegistered, toggleRegistration, isLoading: isRegistrationLoading } = useEventRegistration(
    eventId, 
    event?.data?.isAttended || false
  );

  const canViewAttendees = Boolean(
    user && (
      user.role === UserRole.Create ||
      (user._id && event?.data?.graphId?.ownerUserId && user._id === event?.data?.graphId?.ownerUserId) ||
      (user.role === UserRole.Admin && !!user.selectedGraphId && (user.selectedGraphId as any)._id === event?.data?.globalGraphId)
    )
  );

  const handleBack = () => {
    router.back();
  };

  const handleRegistration = async () => {
    if (!isLoggedIn) {
      router.push('/signIn');
      return;
    }
    await toggleRegistration();
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/events/${eventId}`;
      const text = `${event?.data?.name}`;
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;

      const win = window.open(telegramUrl, '_blank', 'noopener,noreferrer');
      if (!win) {
        window.location.href = telegramUrl;
      }
      notifySuccess('Откройте Telegram и выберите чат');
    } catch (err) {
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/events/${eventId}`);
        notifySuccess('Ссылка скопирована в буфер обмена');
      } catch {
        notifyError('Не удалось скопировать ссылку');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeFrom: string, timeTo: string) => {
    return `${timeFrom} - ${timeTo}`;
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <SpinnerLoader />
      </div>
    );
  }

  if (error || !event?.data) {
    return (
      <div className={styles.errorContainer}>
        <h2>Событие не найдено</h2>
        <p>Возможно, событие было удалено или ссылка неверна.</p>
        <button onClick={handleBack} className={styles.backButtonError}>
          <ArrowLeft size={16} />
          Вернуться назад
        </button>
      </div>
    );
  }

  const eventData = event.data;
  const fullImageUrl = eventData.graphId.imgPath 
    ? `${process.env.NEXT_PUBLIC_S3_URL}/${eventData.graphId.imgPath}` 
    : '';

  return (
    <div className={styles.eventPage}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          <ArrowLeft size={20} />
          <span>Назад</span>
        </button>
        
        <button onClick={handleShare} className={styles.shareButton}>
          <Share2 size={18} />
          <span>Поделиться</span>
        </button>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Event Info Card */}
        <div className={styles.eventCard}>
          {/* Group Info */}
          <a href={`/groups/${eventData.graphId._id}`} className={styles.groupInfo}>
            <div className={styles.groupAvatar}>
              {fullImageUrl ? (
                <img src={fullImageUrl} alt={eventData.graphId.name} className={styles.avatarImage} />
              ) : (
                <div className={styles.avatarFallback}>
                  {eventData.graphId.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className={styles.groupName}>{eventData.graphId.name}</span>
          </a>

          {/* Event Title */}
          <h1 className={styles.eventTitle}>
            {eventData.name}
          </h1>

          {/* Description */}
          <div className={styles.description}>
            {linkifyText(eventData.description)}
          </div>

          {/* Event Details */}
          <div className={styles.detailsGrid}>
            <div className={styles.detailCard}>
              <CalendarClock size={24} />
              <div className={styles.detailInfo}>
                <span className={styles.detailLabel}>Дата и время</span>
                <span className={styles.detailValue}>
                  {eventData.isDateTbd ? 'Дата уточняется' : `${formatDate(eventData.eventDate)}, ${formatTime(eventData.timeFrom, eventData.timeTo)}`}
                </span>
              </div>
            </div>

            <div className={styles.detailCard}>
              <MapPin size={24} />
              <div className={styles.detailInfo}>
                <span className={styles.detailLabel}>Место проведения</span>
                <span className={styles.detailValue}>{eventData.place}</span>
              </div>
            </div>

            <div 
              className={`${styles.detailCard} ${canViewAttendees ? styles.clickable : ''}`}
              onClick={canViewAttendees ? () => setIsAttendeesOpen(true) : undefined}
            >
              <Users size={24} />
              <div className={styles.detailInfo}>
                <span className={styles.detailLabel}>Участники</span>
                <span className={styles.detailValue}>
                  {eventData.regedUsers} человек
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Button */}
        <button
          onClick={handleRegistration}
          disabled={isRegistrationLoading}
          className={`${styles.registrationButton} ${isRegistered ? styles.cancelRegistration : ''}`}
        >
          {isRegistrationLoading ? (
            <>
              <div className={styles.spinner}></div>
              <span>Загрузка...</span>
            </>
          ) : !isLoggedIn ? (
            <>
              <UserPlus size={20} />
              <span>Войти для регистрации</span>
            </>
          ) : isRegistered ? (
            <>
              <UserX size={20} />
              <span>Отменить регистрацию</span>
            </>
          ) : (
            <>
              <UserPlus size={20} />
              <span>Зарегистрироваться</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EventPage;
