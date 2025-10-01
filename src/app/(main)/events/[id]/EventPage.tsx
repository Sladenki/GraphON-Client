'use client'

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardBody, 
  Button, 
  Chip, 
  Spinner,
  Divider,
  Image as HeroImage
} from '@heroui/react';
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
import styles from './EventPage.module.scss';

interface EventPageProps {
  eventId: string;
}

const EventPage: React.FC<EventPageProps> = ({ eventId }) => {
  console.log('EventPage rendered with eventId:', eventId);
  
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const { canAccessEditor } = useRoleAccess(user?.role as UserRole);
  
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
      (user.role === UserRole.Admin && !!user.selectedGraphId && user.selectedGraphId._id === event?.data?.globalGraphId)
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

  const getRegistrationButtonText = () => {
    if (!isLoggedIn) return 'Войти для регистрации';
    if (isRegistrationLoading) return 'Загрузка...';
    return isRegistered ? 'Отменить регистрацию' : 'Зарегистрироваться';
  };

  const getRegistrationButtonIcon = () => {
    if (isRegistrationLoading) return <Spinner size="sm" />;
    return isRegistered ? <UserX size={16} /> : <UserPlus size={16} />;
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="lg" />
        <p>Загрузка события...</p>
      </div>
    );
  }

  if (error || !event?.data) {
    return (
      <div className={styles.errorContainer}>
        <h2>Событие не найдено</h2>
        <p>Возможно, событие было удалено или ссылка неверна.</p>
        <Button onClick={handleBack} color="primary">
          <ArrowLeft size={16} />
          Вернуться назад
        </Button>
      </div>
    );
  }

  const eventData = event.data;

  return (
    <div className={styles.eventPage}>
      {/* Header */}
      <div className={styles.header}>
        <Button
          variant="ghost"
          onClick={handleBack}
          className={styles.backButton}
        >
          <ArrowLeft size={20} />
          Назад
        </Button>
        
        <div className={styles.headerActions}>
          <Button
            variant="ghost"
            size="sm"
            className={styles.shareButton}
          >
            <Share2 size={16} />
            Поделиться
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Event Card */}
        <Card className={styles.eventCard}>
          <CardBody className={styles.cardBody}>
            {/* Event Header */}
            <div className={styles.eventHeader}>
              <div className={styles.graphInfo}>
                <div className={styles.graphAvatar}>
                  {eventData.graphId.imgPath ? (
                    <HeroImage
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${eventData.graphId.imgPath}`}
                      alt={eventData.graphId.name}
                      className={styles.avatarImage}
                    />
                  ) : (
                    <div className={styles.avatarFallback}>
                      {eventData.graphId.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className={styles.graphDetails}>
                  <Chip
                    variant="flat"
                    size="sm"
                    className={styles.graphChip}
                  >
                    {eventData.graphId.name}
                  </Chip>
                </div>
              </div>
            </div>

            {/* Event Title */}
            <h1 className={styles.eventTitle}>
              {eventData.name}
            </h1>

            {/* Event Details */}
            <div className={styles.eventDetails}>
              <div className={styles.detailItem}>
                <Calendar className={styles.detailIcon} />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Дата</span>
                  <span className={styles.detailValue}>
                    {formatDate(eventData.eventDate)}
                  </span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <Clock className={styles.detailIcon} />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Время</span>
                  <span className={styles.detailValue}>
                    {formatTime(eventData.timeFrom, eventData.timeTo)}
                  </span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <MapPin className={styles.detailIcon} />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Место</span>
                  <span className={styles.detailValue}>
                    {eventData.place}
                  </span>
                </div>
              </div>

              <div className={styles.detailItem}>
                <Users className={styles.detailIcon} />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Участники</span>
                  <span className={styles.detailValue}>
                    {eventData.regedUsers} человек
                    {canViewAttendees && (
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => setIsAttendeesOpen(true)}
                        className={styles.viewAttendeesButton}
                      >
                        <ExternalLink size={12} />
                        Посмотреть
                      </Button>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <Divider className={styles.divider} />

            {/* Event Description */}
            <div className={styles.descriptionSection}>
              <h3 className={styles.descriptionTitle}>Описание</h3>
              <div className={styles.description}>
                {linkifyText(eventData.description)}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Registration Section */}
        <Card className={styles.registrationCard}>
          <CardBody className={styles.registrationBody}>
            <div className={styles.registrationContent}>
              <div className={styles.registrationInfo}>
                <CalendarClock className={styles.registrationIcon} />
                <div>
                  <h3 className={styles.registrationTitle}>
                    {isRegistered ? 'Вы зарегистрированы' : 'Регистрация на событие'}
                  </h3>
                  <p className={styles.registrationSubtitle}>
                    {isRegistered 
                      ? 'Вы успешно зарегистрированы на это событие'
                      : 'Зарегистрируйтесь, чтобы принять участие в событии'
                    }
                  </p>
                </div>
              </div>
              
              <Button
                color={isRegistered ? "danger" : "primary"}
                size="lg"
                onClick={handleRegistration}
                disabled={isRegistrationLoading}
                className={styles.registrationButton}
              >
                {getRegistrationButtonIcon()}
                {getRegistrationButtonText()}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default EventPage;
