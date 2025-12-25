'use client'

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { EventRegService } from '@/services/eventReg.service';
import { AttendeeUser } from '@/components/shared/UsersListPopUp/AttendeeItem/AttendeeItem';
import { useAuth } from '@/providers/AuthProvider';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import styles from './ParticipantOrbits.module.scss';

interface ParticipantOrbitsProps {
  eventId: string;
  totalCount: number;
  isRegistered: boolean;
  onRegister?: () => void;
}

// Генерация цвета из строки
const generateColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 55%)`;
};

const ParticipantOrbits: React.FC<ParticipantOrbitsProps> = ({
  eventId,
  totalCount,
  isRegistered,
  onRegister
}) => {
  const { user } = useAuth();
  const isXs = useMediaQuery('(max-width: 500px)');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const queryClient = useQueryClient();
  const [justRegistered, setJustRegistered] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const prevRegisteredRef = useRef(isRegistered);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Получаем список участников
  const { data: attendees, isLoading, refetch } = useQuery({
    queryKey: ['eventRegUsers', eventId],
    queryFn: async () => {
      const res = await EventRegService.getUsersByEventId(eventId);
      return res.data as AttendeeUser[];
    },
    enabled: Boolean(eventId),
    staleTime: 30_000,
  });

  // Отслеживаем регистрацию для анимации - отслеживаем переход с false на true
  useEffect(() => {
    const prevRegistered = prevRegisteredRef.current;
    
    // Если статус регистрации изменился с false на true
    if (isRegistered && !prevRegistered && user?._id) {
      // Пользователь только что зарегистрировался
      setJustRegistered(true);
      setAnimationKey(prev => prev + 1);
      
      // Инвалидируем кеш и принудительно обновляем список участников
      queryClient.invalidateQueries({ queryKey: ['eventRegUsers', eventId] });
      
      // Небольшая задержка для обновления данных, затем запускаем анимацию
      setTimeout(() => {
        setShouldAnimate(true);
        refetch();
      }, 50);
      
      // Сбрасываем флаг через 3 секунды (после завершения анимации)
      const timer = setTimeout(() => {
        setJustRegistered(false);
        setShouldAnimate(false);
      }, 3000);
      
      prevRegisteredRef.current = isRegistered;
      return () => clearTimeout(timer);
    }
    
    // Если статус изменился с true на false (отмена регистрации)
    if (!isRegistered && prevRegistered && user?._id) {
      // Инвалидируем кеш и обновляем список участников
      queryClient.invalidateQueries({ queryKey: ['eventRegUsers', eventId] });
      refetch();
      prevRegisteredRef.current = isRegistered;
    } else if (prevRegistered !== isRegistered) {
      prevRegisteredRef.current = isRegistered;
    }
  }, [isRegistered, user?._id, refetch, queryClient, eventId]);

  // Подготовка данных для отображения
  const displayData = useMemo(() => {
    const maxVisibleAvatars = isXs ? 3 : isMobile ? 4 : 5;

    if (!attendees || attendees.length === 0) {
      // Если нет участников, показываем пустой список
      return {
        avatars: [],
        userIndex: -1
      };
    }

    // Берем первые maxVisibleAvatars участников
    const visibleAvatars = attendees.slice(0, maxVisibleAvatars);
    
    // Проверяем, зарегистрирован ли текущий пользователь
    const currentUserIndex = user?._id 
      ? visibleAvatars.findIndex(a => a._id === user._id)
      : -1;

    // Если пользователь зарегистрирован, но не в первых N, заменяем последнего
    let avatarsToShow = [...visibleAvatars];
    if (isRegistered && currentUserIndex === -1 && user?._id) {
      // Находим текущего пользователя в полном списке
      const currentUser = attendees.find(a => a._id === user._id);
      if (currentUser) {
        avatarsToShow = [...visibleAvatars.slice(0, Math.max(0, maxVisibleAvatars - 1)), currentUser];
      }
    }

    return {
      avatars: avatarsToShow.map((attendee, index) => {
        const displayName = attendee.firstName && attendee.lastName
          ? `${attendee.firstName} ${attendee.lastName}`
          : attendee.firstName || attendee.lastName || attendee.username || 'Пользователь';
        
        const firstLetter = displayName.charAt(0).toUpperCase();
        const colorKey = attendee.username || displayName || attendee._id;
        const avatarColor = generateColorFromString(colorKey);
        
        const isCurrentUser = user?._id === attendee._id;
        const baseUrl = process.env.NEXT_PUBLIC_S3_URL;
        const avatarUrl = attendee.avaPath 
          ? (attendee.avaPath.startsWith('http') ? attendee.avaPath : `${baseUrl}/${attendee.avaPath}`)
          : null;

        return {
          id: attendee._id,
          name: displayName,
          initial: firstLetter,
          color: avatarColor,
          avatarUrl,
          isCurrentUser,
          index
        };
      }),
      userIndex: isRegistered && user?._id 
        ? avatarsToShow.findIndex(a => a._id === user._id)
        : -1
    };
  }, [attendees, user, isRegistered, isMobile, isXs]);

  // Анимация для аватарки при регистрации
  const avatarVariants = {
    initial: (index: number) => ({
      scale: 0,
      opacity: 0,
      rotate: -180,
      x: index % 2 === 0 ? -50 : 50,
      y: index < 2 ? -50 : 50,
    }),
    animate: (index: number) => ({
      scale: 1,
      opacity: 1,
      rotate: 0,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: index * 0.1,
      }
    }),
    exit: {
      scale: 0,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  // Анимация для новой аватарки (при регистрации)
  const newAvatarVariants = {
    initial: {
      scale: 0,
      opacity: 0,
      rotate: -360,
      x: 100,
      y: -100,
    },
    animate: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      }
    }
  };


  if (isLoading) {
    return (
      <div className={styles.orbitsContainer}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  return (
    <div className={styles.orbitsContainer}>
      <div className={styles.orbitsWrapper}>
        <AnimatePresence mode="popLayout">
          {displayData.avatars.map((avatar, index) => {
            const isNewRegistration = shouldAnimate && justRegistered && avatar.isCurrentUser;
            // Используем уникальный key для принудительного пересоздания при регистрации
            const uniqueKey = isNewRegistration ? `${avatar.id}-new-${animationKey}` : `${avatar.id}-${index}`;
            
            return (
              <motion.div
                key={uniqueKey}
                custom={index}
                variants={isNewRegistration ? newAvatarVariants : avatarVariants}
                initial={isNewRegistration ? "initial" : false}
                animate="animate"
                exit="exit"
                className={styles.avatarOrbit}
                style={{
                  '--orbit-index': index,
                  '--total-avatars': displayData.avatars.length,
                } as React.CSSProperties}
              >
                <div className={`${styles.avatarCircle} ${avatar.isCurrentUser ? styles.currentUser : ''}`}>
                  {avatar.avatarUrl ? (
                    <img
                      src={avatar.avatarUrl}
                      alt={avatar.name}
                      className={styles.avatarImage}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={styles.avatarFallback}
                    style={{
                      background: `linear-gradient(135deg, ${avatar.color}, ${avatar.color}dd)`,
                      display: avatar.avatarUrl ? 'none' : 'flex'
                    }}
                  >
                    {avatar.initial}
                  </div>
                  {avatar.isCurrentUser && (
                    <motion.div
                      className={styles.userBadge}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                    />
                  )}
                </div>
              </motion.div>
          );
        })}
        </AnimatePresence>
      </div>
      
      {/* Счетчик участников */}
      {totalCount > 0 && (
        <div className={styles.participantsCount}>
          {totalCount} {totalCount === 1 ? 'участник' : totalCount < 5 ? 'участника' : 'участников'}
        </div>
      )}
    </div>
  );
};

export default ParticipantOrbits;

