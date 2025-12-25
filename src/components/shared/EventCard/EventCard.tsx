'use client'

import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { 
  Edit3, 
  Trash2, 
  Save, 
  X,
  UserPlus,
  UserX,
  LogIn,
  Share2,
  CalendarClock,
  MapPinned,
  UsersRound,
  Users,
  Music,
  Palette,
  GraduationCap,
  Briefcase,
  Trophy,
  Laugh,
  UtensilsCrossed,
  Home,
  Building2,
  PartyPopper,
  Film,
  Theater,
  Calendar,
  Clock,
  BadgeCheck
} from "lucide-react";
import { useEventRegistration } from "@/hooks/useEventRegistration";
import { useAuth } from "@/providers/AuthProvider";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { UserRole } from "@/types/user.interface";
import { useDeclensionWord } from "@/hooks/useDeclension";
import DeleteConfirmPopUp from './DeleteConfirmPopUp/DeleteConfirmPopUp';
import AttendeesPopUp from './AttendeesPopUp/AttendeesPopUp';
import ParticipantOrbits from './ParticipantOrbits/ParticipantOrbits';
import styles from './EventCard.module.scss';
import ActionButton from '@/components/ui/ActionButton/ActionButton';
import { linkifyText } from '@/lib/linkify';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { DatePicker, TimeInput } from '@heroui/react';
import { parseDate } from '@internationalized/date';
import { I18nProvider } from '@react-aria/i18n';
import { EventService } from '@/services/event.service';
import { notifySuccess, notifyError } from '@/lib/notifications';
import { getPastelTheme, getThemeName, type ThemeName } from './pastelTheme';
import { RegistrationSuccessModal } from './RegistrationSuccessModal/RegistrationSuccessModal';

type ThemeDecor = {
  Icon: React.ComponentType<{ size?: number }>;
  light: string;
  dark: string;
};

function getThemeDecor(theme: ThemeName): ThemeDecor {
  switch (theme) {
    case 'Музыка':
      return { Icon: Music, light: '#8b5cf6', dark: '#a78bfa' };
    case 'Искусство':
    case 'Творчество':
      return { Icon: Palette, light: '#ec4899', dark: '#f472b6' };
    case 'Образование':
    case 'Наука':
      return { Icon: GraduationCap, light: '#22c55e', dark: '#4ade80' };
    case 'Бизнес':
      return { Icon: Briefcase, light: '#3b82f6', dark: '#60a5fa' };
    case 'Спорт':
      return { Icon: Trophy, light: '#f59e0b', dark: '#fbbf24' };
    case 'Юмор':
      return { Icon: Laugh, light: '#eab308', dark: '#facc15' };
    case 'Гастро':
      return { Icon: UtensilsCrossed, light: '#ef4444', dark: '#f87171' };
    case 'Семья':
      return { Icon: Home, light: '#06b6d4', dark: '#22d3ee' };
    case 'Город':
    case 'Самоуправление':
      return { Icon: Building2, light: '#6366f1', dark: '#818cf8' };
    case 'Вечеринки':
    case 'Фестивали, праздники':
      return { Icon: PartyPopper, light: '#a855f7', dark: '#c084fc' };
    case 'Встречи':
    case 'Отряды':
    case 'Волонтерство':
      return { Icon: Users, light: '#14b8a6', dark: '#2dd4bf' };
    case 'Кино':
      return { Icon: Film, light: '#0ea5e9', dark: '#38bdf8' };
    case 'Театр':
      return { Icon: Theater, light: '#d946ef', dark: '#e879f9' };
    default:
      return { Icon: MapPinned, light: '#3b82f6', dark: '#60a5fa' };
  }
}

interface EventProps {
  event: {
    _id: string;
    graphId: {
      _id: string;
      name: string;
      ownerUserId?: string;
      imgPath?: string;
    };
    globalGraphId: string;
    name: string;
    description: string;
    place: string;
    eventDate: string;
    timeFrom?: string;
    timeTo?: string;
    regedUsers: number;
    isAttended: boolean;
    isDateTbd?: boolean;
  };
  isAttended?: boolean;
  onDelete?: (eventId: string) => void;
  disableRegistration?: boolean;
}

// Простой компонент аватара группы
const GroupAvatar: React.FC<{ 
  src: string; 
  alt: string; 
  fallback: string;
}> = ({ src, alt, fallback }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="h-9 w-9 overflow-hidden rounded-2xl bg-white/70 ring-1 ring-black/5 flex items-center justify-center">
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-slate-700">
          {fallback.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

const EventCard: React.FC<EventProps> = ({ 
  event, 
  isAttended, 
  onDelete,
  disableRegistration
}) => {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const { canAccessEditor } = useRoleAccess(user?.role as UserRole);
  
  // Состояния
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(event);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAttendeesOpen, setIsAttendeesOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  // Хуки
  const { isRegistered, toggleRegistration, isLoading } = useEventRegistration(
    event._id, 
    isAttended
  );

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
  
  // Проверка прав на просмотр участников
  const canViewAttendees = Boolean(
    user && (
      user.role === UserRole.Create ||
      (user._id && event.graphId?.ownerUserId && user._id === event.graphId.ownerUserId) ||
      (user.role === UserRole.Admin && !!user.selectedGraphId && (user.selectedGraphId as any)._id === event.globalGraphId)
    )
  );
  
  // Форматирование времени
  const formattedTime = useMemo(() => {
    if (event.isDateTbd) return "Дата и время уточняется";
    
    const date = new Date(event.eventDate);
    const dateStr = date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    if (event.timeFrom && event.timeTo) {
      return `${dateStr}, ${event.timeFrom} - ${event.timeTo}`;
    } else if (event.timeFrom) {
      return `${dateStr}, ${event.timeFrom}`;
    } else {
      return dateStr;
    }
  }, [event.eventDate, event.timeFrom, event.timeTo, event.isDateTbd]);

  // Проверка, прошло ли мероприятие
  const isEventPast = useMemo(() => {
    if (event.isDateTbd) return false;
    
    // Создаем дату события, используя дату и время окончания
    const eventDate = new Date(event.eventDate);
    
    // Если есть время окончания, используем его, иначе проверяем только дату
    if (event.timeTo) {
      const [hours, minutes] = event.timeTo.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
    } else {
      // Если времени нет, считаем событие прошедшим, если дата меньше сегодняшней
      eventDate.setHours(23, 59, 59, 999);
    }
    
    const now = new Date();
    
    // Отладочная информация (можно убрать после тестирования)
    console.log('Event date:', eventDate);
    console.log('Current date:', now);
    console.log('Is past:', eventDate < now);
    
    return eventDate < now;
  }, [event.eventDate, event.timeTo, event.isDateTbd]);

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

  // Значение для HTML input[type="date"] в формате YYYY-MM-DD
  const dateInputValue = useMemo(() => {
    const value = editedEvent?.eventDate;
    if (!value) return '';
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
      // Если уже в нужном формате, отдадим как есть
      return value;
    }
    // Нормализуем к локальной дате без смещения времени
    const tzOffset = parsed.getTimezoneOffset() * 60000;
    const local = new Date(parsed.getTime() - tzOffset);
    return local.toISOString().slice(0, 10);
  }, [editedEvent?.eventDate]);
  const datePickerValue = useMemo(() => {
    return editedEvent?.eventDate ? parseDate(dateInputValue) : null;
  }, [dateInputValue, editedEvent?.eventDate]);
  
  // URL изображения
  const fullImageUrl = useMemo(() => {
    if (!event.graphId.imgPath) return '';
    const baseUrl = process.env.NEXT_PUBLIC_S3_URL;
    return `${baseUrl}/${event.graphId.imgPath}`;
  }, [event.graphId.imgPath]);
  
  // Обработчики
  const handleRegistration = useCallback(async () => {
    if (!isLoggedIn) {
      router.push('/signIn');
      return;
    }
    try {
      const wasRegistered = isRegistered;
      await toggleRegistration();

      // "Viral success moment" — только при успешной регистрации (false -> true)
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
  
  const handleEdit = useCallback(async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const updateData = {
        graphId: typeof event.graphId === 'object' ? event.graphId._id : event.graphId,
        name: editedEvent.name,
        description: editedEvent.description,
        place: editedEvent.place,
        isDateTbd: editedEvent.isDateTbd,
        ...(editedEvent.isDateTbd ? {} : {
          eventDate: editedEvent.eventDate,
          ...(editedEvent.timeFrom && { timeFrom: editedEvent.timeFrom }),
          ...(editedEvent.timeTo && { timeTo: editedEvent.timeTo }),
        })
      };

      await EventService.updateEvent(event._id, updateData);
      
      // Обновляем исходное событие после успешного сохранения
      Object.assign(event, editedEvent);
      
      notifySuccess('Успешно сохранено', 'Изменения мероприятия сохранены');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating event:', error);
      notifyError('Ошибка сохранения', 'Не удалось сохранить изменения');
    } finally {
      setIsSaving(false);
    }
  }, [event, editedEvent, isSaving]);
  
  const handleCancel = useCallback(() => {
    setEditedEvent(event);
    setIsEditing(false);
  }, [event]);
  
  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
  }, []);
  
  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);
  
  const handleConfirmDelete = useCallback(async () => {
    if (onDelete) {
      await onDelete(event._id);
    }
    setShowDeleteConfirm(false);
  }, [event._id, onDelete]);
  
  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);
  
  const updateEditedEvent = useCallback((key: string, value: string | boolean) => {
    setEditedEvent(prev => ({ ...prev, [key]: value }));
  }, []);

  // Правильное склонение для количества участников
  const participantsWord = useDeclensionWord(event.regedUsers, 'PARTICIPANT');
  
  // Обработчик перехода на страницу группы
  const handleGroupClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const graphId = typeof event.graphId === 'object' ? event.graphId._id : event.graphId;
    if (graphId) {
      router.push(`/groups/${graphId}`);
    }
  }, [event.graphId, router]);

  const handleShare = useCallback(async () => {
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
  
  const themeName = useMemo(() => getThemeName(event), [event]);
  const pastel = useMemo(() => getPastelTheme(themeName), [themeName]);
  const decor = useMemo(() => getThemeDecor(themeName), [themeName]);

  // Кнопки действий (как было)
  const actionButtons = useMemo(() => {
    if (!canAccessEditor) return null;

    return (
      <div className={styles.actionButtons}>
        {isEditing ? (
          <>
            <button
              className={`${styles.actionButton} ${styles.saveButton}`}
              onClick={handleEdit}
              disabled={isSaving}
              title="Сохранить изменения"
            >
              {isSaving ? <div className={styles.spinner} /> : <Save size={16} />}
            </button>
            <button
              className={`${styles.actionButton} ${styles.cancelButton}`}
              onClick={handleCancel}
              disabled={isSaving}
              title="Отменить редактирование"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <button
              className={`${styles.actionButton} ${styles.editButton}`}
              onClick={handleStartEdit}
              disabled={!!disableRegistration}
              title="Редактировать мероприятие"
            >
              <Edit3 size={16} />
            </button>
            <button
              className={`${styles.actionButton} ${styles.deleteButton}`}
              onClick={handleDelete}
              disabled={!!disableRegistration}
              title="Удалить мероприятие"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    );
  }, [canAccessEditor, isEditing, isSaving, handleEdit, handleCancel, handleStartEdit, handleDelete, disableRegistration]);

  // Кнопка регистрации (как было)
  const registerButton = useMemo(() => (
    <ActionButton
      className={[
        styles.registerWide,
        isRegistered ? styles.registerTicket : styles.registerDefault,
        isJustRegistered ? styles.registerTicketPulse : '',
      ].filter(Boolean).join(' ')}
      onClick={handleRegistration}
      disabled={isLoading || !!disableRegistration || isEventPast}
      // Важно: для билетика используем custom, иначе ActionButton.primary перетрёт фон (background)
      variant={isEventPast ? 'info' : (isRegistered ? 'custom' : 'primary')}
      icon={
        isLoading ? (
          <div className={styles.spinner} />
        ) : isEventPast ? (
          <Clock size={16} />
        ) : !isLoggedIn ? (
          <LogIn size={16} />
        ) : isRegistered ? (
          <BadgeCheck size={16} />
        ) : (
          <UserPlus size={16} />
        )
      }
      label={
        isEventPast ? 'Запись закончена' : disableRegistration ? 'Регистрация недоступна' : isLoggedIn
          ? (isRegistered ? 'Вы записаны' : 'Записаться')
          : 'Необходимо войти'
      }
      data-registered={isRegistered ? 'true' : 'false'}
    />
  ), [isLoggedIn, isRegistered, isJustRegistered, isLoading, handleRegistration, disableRegistration, isEventPast]);

  if (!event || !event._id) {
    return null;
  }

  return (
    <div className={styles.eventCardWrapper}>
      <motion.div 
        className={styles.eventCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Динамический фон с движущимися градиентами */}
        <motion.div
          className={styles.dynamicBackground}
          animate={{
            x: ['-30%', '30%', '-30%'],
            y: ['-30%', '30%', '-30%'],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className={styles.dynamicBackgroundSecondary}
          animate={{
            x: ['30%', '-30%', '30%'],
            y: ['30%', '-30%', '30%'],
            scale: [1.3, 1, 1.3],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        {/* Header - название и группа */}
        <div className={styles.cardHeader}>
          {/* Тематический фон по тематикам */}
          <div
            className={styles.themeHeaderBg}
            style={{
              // CSS-переключение по теме в SCSS (без зависимости от Tailwind scanning)
              ['--eventHeaderBgLight' as any]: pastel.headerBgLight,
              ['--eventHeaderBgDark' as any]: pastel.headerBgDark,
            }}
            aria-hidden="true"
          />

          {/* Декоративные фоновые иконки (как в EventPopUp на карте) */}
          <div
            className={styles.backgroundIcons}
            style={{
              ['--eventThemeIconLight' as any]: decor.light,
              ['--eventThemeIconDark' as any]: decor.dark,
            }}
            aria-hidden="true"
          >
            <div className={styles.bgIcon}>
              <decor.Icon size={120} />
            </div>
            <div className={styles.bgIconSecondary}>
              <decor.Icon size={84} />
            </div>
            <div className={styles.bgIconTertiary}>
              <decor.Icon size={64} />
            </div>
          </div>

          <div className={styles.headerTop}>
            <div className={styles.groupInfo} onClick={handleGroupClick}>
              {/* Оставляем дизайн аватарки и названия организатора */}
              <GroupAvatar src={fullImageUrl} alt={event.graphId.name} fallback={event.graphId.name} />
              <span className="truncate text-[13px] font-normal text-slate-700">
                {event.graphId.name}
              </span>
            </div>
            
            <div className={styles.headerActions}>
              <button 
                className={styles.shareButton}
                onClick={handleShare}
                aria-label="Поделиться"
              >
                <Share2 size={16} />
              </button>
              {actionButtons}
            </div>
          </div>
          
          <div className={styles.titleSection}>
            {isEditing ? (
              <input
                type="text"
                value={editedEvent.name}
                onChange={(e) => updateEditedEvent('name', e.target.value)}
                className={styles.titleInput}
                placeholder="Название мероприятия"
              />
            ) : (
              <h2 className={styles.eventTitle}>
                {event.name}
              </h2>
            )}
          </div>
        </div>
        
        {/* Description */}
        <div className={styles.cardBody}>
          {isEditing ? (
            <div>
              <textarea
                value={editedEvent.description}
                onChange={(e) => updateEditedEvent('description', e.target.value)}
                className={styles.descriptionInput}
                placeholder="Описание мероприятия"
                rows={3}
                maxLength={300}
              />
              <div className={styles.characterCount}>
                {editedEvent.description.length}/300
              </div>
            </div>
          ) : (
            <div className={styles.description}>
              {linkifyText(truncatedText)}
              {shouldTruncate && (
                <button
                  className={styles.readMoreButton}
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  type="button"
                >
                  {isDescriptionExpanded ? 'Свернуть' : 'Читать дальше'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Important Info - время, место и участники */}
        <div className={styles.importantInfo}>
          {isEditing ? (
            <>
              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="editIsDateTbd"
                  checked={editedEvent.isDateTbd || false}
                  onChange={(e) => updateEditedEvent('isDateTbd', e.target.checked)}
                />
                <label htmlFor="editIsDateTbd">Дата и время уточняется</label>
              </div>

              {!editedEvent.isDateTbd && (
                <>
                  <div className={styles.timeInfo}>
                    <CalendarClock size={20} />
                    <I18nProvider locale="ru-RU">
                      <DatePicker
                        label="Дата"
                        aria-label="Дата"
                        variant="bordered"
                        size="sm"
                        value={datePickerValue as any}
                        onChange={(v: any) => updateEditedEvent('eventDate', v ? v.toString() : '')}
                        className={styles.dateInput}
                      />
                    </I18nProvider>
                  </div>
                  <div className={styles.timeInfo}>
                    <Clock size={20} />
                    <div className={styles.timeInputs}>
                      <input
                        type="time"
                        value={editedEvent.timeFrom || ''}
                        onChange={(e) => updateEditedEvent('timeFrom', e.target.value)}
                        className={styles.timeInput}
                      />
                      <input
                        type="time"
                        value={editedEvent.timeTo || ''}
                        onChange={(e) => updateEditedEvent('timeTo', e.target.value)}
                        className={styles.timeInput}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className={styles.placeInfo}>
                <MapPinned size={20} />
                <input
                  type="text"
                  value={editedEvent.place}
                  onChange={(e) => updateEditedEvent('place', e.target.value)}
                  className={styles.placeInput}
                  placeholder="Место проведения"
                />
              </div>
            </>
          ) : (
            <>
              <div className={styles.timeInfo}>
                <CalendarClock size={20} />
                <span className={styles.timeText}>{formattedTime}</span>
              </div>
              
              <div className={styles.placeInfo}>
                <MapPinned size={20} />
                <span className={styles.placeText}>{event.place}</span>
              </div>
            </>
          )}

          <div className={styles.participantsInfo}>
            <UsersRound size={18} />
            <span 
              className={`${styles.participantsText} ${canViewAttendees ? styles.clickable : ''}`}
              onClick={canViewAttendees ? () => setIsAttendeesOpen(true) : undefined}
              role={canViewAttendees ? 'button' : undefined}
              tabIndex={canViewAttendees ? 0 : undefined as unknown as number}
              onKeyDown={canViewAttendees ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (canViewAttendees) {
                    setIsAttendeesOpen(true);
                  }
                }
              } : undefined}
            >
              {event.regedUsers} {participantsWord}
            </span>
          </div>
        </div>

        {/* Footer - участники и кнопка регистрации */}
        <div className={styles.cardFooter}>
          {isEditing ? null : registerButton}

          {/* Орбиты участников вместо текста */}
          <div className={styles.participantsOrbits}>
            <ParticipantOrbits
              eventId={event._id}
              totalCount={event.regedUsers}
              isRegistered={isRegistered}
              onRegister={canViewAttendees ? () => setIsAttendeesOpen(true) : undefined}
            />
          </div>
        </div>
      </motion.div>
      
      {/* PopUp подтверждения удаления */}
      <DeleteConfirmPopUp
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        eventName={event.name}
        isDeleting={false}
      />

      {/* PopUp со списком участников */}
      <AttendeesPopUp
        isOpen={isAttendeesOpen}
        onClose={() => setIsAttendeesOpen(false)}
        eventId={event._id}
        eventName={event.name}
      />

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
        theme={{ primary: decor.light, secondary: decor.dark, accent: '#EE82C8' }}
      />
    </div>
  );
};

export default EventCard;