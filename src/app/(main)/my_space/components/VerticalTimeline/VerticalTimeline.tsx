'use client';

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { LifeTraceData, EventNode, FriendNode, CATEGORY_COLORS } from '../LifeTrace2D/types';
import { generateMockData } from '../LifeTrace2D/mockData';
import { useAuth } from '@/providers/AuthProvider';
import { EventModal } from '../LifeTrace2D/EventModal';
import { FriendProfileModal } from './FriendProfileModal';
import { Trophy, Users, MapPin, Star } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import styles from './VerticalTimeline.module.scss';

interface TimelineItem {
  event: EventNode;
  friends: FriendNode[];
  yPosition: number;
  side: 'left' | 'right'; // Для змейки
  opacity: number; // Затухание для старых событий
}

interface Achievement {
  id: string;
  icon: React.ReactNode;
  title: string;
  yPosition: number;
}

export function VerticalTimeline() {
  const { user } = useAuth();
  const [data] = useState<LifeTraceData>(() => generateMockData());
  const [selectedEvent, setSelectedEvent] = useState<EventNode | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<FriendNode | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const statsHeaderRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Сортируем события: новое сверху, старое снизу
  const sortedEvents = useMemo(() => {
    return [...data.events].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [data.events]);

  // Группируем друзей по событиям
  const friendsByEvent = useMemo(() => {
    const map = new Map<string, FriendNode[]>();
    data.friends.forEach((friend) => {
      const existing = map.get(friend.eventId) || [];
      map.set(friend.eventId, [...existing, friend]);
    });
    return map;
  }, [data.friends]);

  // Отслеживание скролла для анимаций и свернутого header
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const scrollHeight = containerRef.current.scrollHeight - containerRef.current.clientHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      setScrollProgress(progress);
      
      // Сворачиваем header на мобильных при скролле
      if (isMobile) {
        setIsScrolled(scrollTop > 50);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [isMobile]);

  // Статистика
  const stats = useMemo(() => {
    const totalEvents = sortedEvents.length;
    const totalFriends = data.friends.length;
    const categories = new Set(sortedEvents.map(e => e.category)).size;
    const daysSinceFirst = sortedEvents.length > 0
      ? Math.floor((Date.now() - sortedEvents[sortedEvents.length - 1].timestamp.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      events: totalEvents,
      friends: totalFriends,
      categories,
      days: daysSinceFirst,
    };
  }, [sortedEvents, data.friends]);

  // Создаем timeline items с позициями и затуханием
  const timelineItems = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];
    const itemHeight = 280; // Высота одной карточки события
    const spacing = 120; // Расстояние между событиями
    const maxOpacity = 1;
    const minOpacity = 0.4;
    const fadeStartIndex = 3; // Начинаем затухание с 4-го события

    sortedEvents.forEach((event, index) => {
      const yPosition = index * (itemHeight + spacing);
      const side = index % 2 === 0 ? 'right' : 'left'; // Змейка: четные справа, нечетные слева
      const friends = friendsByEvent.get(event.id) || [];
      
      // Вычисляем opacity: верхние события ярче, нижние тусклее
      let opacity = maxOpacity;
      if (index >= fadeStartIndex) {
        const fadeProgress = Math.min((index - fadeStartIndex) / (sortedEvents.length - fadeStartIndex), 1);
        opacity = maxOpacity - (maxOpacity - minOpacity) * fadeProgress;
      }

      items.push({
        event,
        friends,
        yPosition,
        side,
        opacity,
      });
    });

    return items;
  }, [sortedEvents, friendsByEvent]);

  // Вычисляем общую высоту контента
  const contentHeight = useMemo(() => {
    if (timelineItems.length === 0) return 100;
    const lastItem = timelineItems[timelineItems.length - 1];
    return lastItem.yPosition + 400; // Добавляем отступ снизу
  }, [timelineItems]);

  // Генерируем точки для извилистой линии пути
  const pathPoints = useMemo(() => {
    if (timelineItems.length === 0) return [];
    
    const points: Array<{ x: number; y: number }> = [];
    const centerX = 50; // Центр в процентах
    const itemHeight = 280;
    const spacing = 120;
    const topOffset = 200; // Отступ сверху для ближайшей цели
    
    // Добавляем начальную точку
    points.push({ x: centerX, y: topOffset });
    
    // Генерируем точки с извилинами
    timelineItems.forEach((item, index) => {
      const y = topOffset + item.yPosition + 140; // Центр карточки
      const offset = item.side === 'right' ? 6 : -6; // Смещение для змейки
      const x = centerX + offset;
      points.push({ x, y });
    });
    
    // Добавляем конечную точку
    const lastY = topOffset + (timelineItems[timelineItems.length - 1]?.yPosition || 0) + 400;
    points.push({ x: centerX, y: lastY });
    
    return points;
  }, [timelineItems]);

  // Создаем SVG path для извилистой линии с более мягкими кривыми
  const pathD = useMemo(() => {
    if (pathPoints.length < 2) return '';
    
    // Используем более плавные кривые Безье (как траектория полета)
    let d = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
    
    for (let i = 1; i < pathPoints.length; i++) {
      const prev = pathPoints[i - 1];
      const curr = pathPoints[i];
      const next = pathPoints[i + 1];
      
      if (next) {
        // Более мягкие контрольные точки для плавных космических изгибов
        const tension = 0.5; // Коэффициент плавности (чем больше, тем плавнее)
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const dxNext = next.x - curr.x;
        const dyNext = next.y - curr.y;
        
        // Контрольные точки для более естественных изгибов
        const cp1x = prev.x + dx * tension;
        const cp1y = prev.y + dy * (0.7 + tension * 0.3);
        const cp2x = curr.x - dxNext * tension;
        const cp2y = curr.y - dyNext * (0.3 + tension * 0.2);
        
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
      } else {
        // Последняя точка - плавная кривая
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const cp1x = prev.x + dx * 0.6;
        const cp1y = prev.y + dy * 0.8;
        d += ` Q ${cp1x} ${cp1y}, ${curr.x} ${curr.y}`;
      }
    }
    
    return d;
  }, [pathPoints]);

  // Создаем динамический градиент, перетекающий от цвета одного события к другому
  const pathGradients = useMemo(() => {
    if (timelineItems.length === 0) return null;
    
    const totalHeight = contentHeight;
    const topOffset = 200; // Отступ сверху для ближайшей цели
    
    // Создаем градиент с остановками для каждого события
    const stops: Array<{ offset: number; color: string; opacity: number }> = [];
    
    timelineItems.forEach((item, index) => {
      const y = topOffset + item.yPosition + 140; // Центр карточки
      const offset = (y / totalHeight) * 100;
      const color = CATEGORY_COLORS[item.event.category];
      
      // Вычисляем opacity на основе затухания события
      const opacity = item.opacity;
      
      // Добавляем остановку с цветом события
      stops.push({
        offset: Math.max(0, Math.min(100, offset)),
        color: color,
        opacity: opacity * 0.8, // Немного уменьшаем для линии
      });
    });
    
    // Сортируем остановки по offset
    stops.sort((a, b) => a.offset - b.offset);
    
    // Удаляем дубликаты с одинаковым offset
    const uniqueStops = stops.reduce((acc, stop) => {
      const last = acc[acc.length - 1];
      if (!last || Math.abs(last.offset - stop.offset) > 0.5) {
        acc.push(stop);
      }
      return acc;
    }, [] as typeof stops);
    
    // Добавляем начальную и конечную остановки
    if (uniqueStops.length > 0) {
      const firstColor = uniqueStops[0].color;
      const lastColor = uniqueStops[uniqueStops.length - 1].color;
      
      return (
        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={firstColor} stopOpacity="0.8" />
          {uniqueStops.map((stop, index) => (
            <stop
              key={`stop-${index}`}
              offset={`${stop.offset}%`}
              stopColor={stop.color}
              stopOpacity={stop.opacity}
            />
          ))}
          <stop offset="100%" stopColor={lastColor} stopOpacity="0.4" />
        </linearGradient>
      );
    }
    
    return null;
  }, [timelineItems, contentHeight]);

  // Бейджи достижений
  const achievements = useMemo<Achievement[]>(() => {
    const items: Achievement[] = [];
    const itemHeight = 280;
    const spacing = 120;
    
    // Добавляем достижения между событиями
    timelineItems.forEach((item, index) => {
      if (index > 0 && index % 3 === 0) {
        const yPosition = item.yPosition - spacing / 2;
        items.push({
          id: `achievement-${index}`,
          icon: <Trophy size={16} />,
          title: index === 3 ? 'Первая неделя без пропусков' : `Собрал созвездие из ${index * 2} друзей`,
          yPosition,
        });
      }
    });
    
    return items;
  }, [timelineItems]);

  const handleEventClick = useCallback((event: EventNode) => {
    setSelectedEvent(event);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const handleFriendClick = useCallback((friend: FriendNode) => {
    if (isMobile) {
      setSelectedFriend(friend);
    }
  }, [isMobile]);

  const handleCloseFriendModal = useCallback(() => {
    setSelectedFriend(null);
  }, []);

  // Группируем друзей для стека на мобильных
  const getFriendsForDisplay = useCallback((friends: FriendNode[]) => {
    if (!isMobile || friends.length <= 3) return friends;
    return friends.slice(0, 3);
  }, [isMobile]);

  const getRemainingFriendsCount = useCallback((friends: FriendNode[]) => {
    if (!isMobile || friends.length <= 3) return 0;
    return friends.length - 3;
  }, [isMobile]);

  // Форматируем дату
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className={styles.timelineContainer} ref={containerRef}>
      {/* Статистика в шапке */}
      <div 
        ref={statsHeaderRef}
        className={`${styles.statsHeader} ${isScrolled ? styles.scrolled : ''}`}
      >
        <div className={styles.statItem}>
          <MapPin size={18} />
          <span className={styles.statValue}>{stats.events}</span>
          <span className={styles.statLabel}>Событий</span>
        </div>
        <div className={styles.statItem}>
          <Users size={18} />
          <span className={styles.statValue}>{stats.friends}</span>
          <span className={styles.statLabel}>Союзников</span>
        </div>
        <div className={styles.statItem}>
          <Star size={18} />
          <span className={styles.statValue}>{stats.categories}</span>
          <span className={styles.statLabel}>Категорий</span>
        </div>
      </div>

      <div className={styles.timelineContent} style={{ minHeight: `${contentHeight}px` }}>
        {/* Извилистая линия пути */}
        <svg 
          className={styles.timelinePathSvg} 
          style={{ height: `${contentHeight}px` }}
          viewBox={`0 0 100 ${contentHeight}`}
          preserveAspectRatio="none"
        >
          <defs>
            {pathGradients}
            <filter id="pathGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d={pathD}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#pathGlow)"
            className={styles.timelinePath}
          />
        </svg>

        {/* Ближайшая цель вверху */}
        <div className={styles.nextEventCard}>
          <div className={styles.nextEventContent}>
            <div className={styles.nextEventIcon}>?</div>
            <div className={styles.nextEventText}>
              <div className={styles.nextEventTitle}>Твое следующее событие?</div>
              <div className={styles.nextEventSubtitle}>Продолжай свой путь</div>
            </div>
          </div>
        </div>

        {/* Бейджи достижений */}
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={styles.achievementBadge}
            style={{ top: `${achievement.yPosition}px` }}
          >
            <div className={styles.achievementIcon}>{achievement.icon}</div>
            <div className={styles.achievementTitle}>{achievement.title}</div>
          </div>
        ))}

        {/* События */}
        {timelineItems.map((item, index) => {
          const { event, friends, yPosition, side, opacity } = item;
          const color = CATEGORY_COLORS[event.category];
          const displayFriends = getFriendsForDisplay(friends);
          const remainingCount = getRemainingFriendsCount(friends);

          return (
            <div
              key={event.id}
              className={styles.timelineItem}
              style={{
                top: `${yPosition}px`,
                opacity,
              }}
            >
              {/* Карточка события */}
              <div
                className={`${styles.eventCard} ${styles[side]}`}
                onClick={() => handleEventClick(event)}
              >
                <div
                  className={styles.eventCardContent}
                  style={{
                    '--event-color': color,
                  } as React.CSSProperties}
                >
                  {/* Сфера события */}
                  <div className={styles.eventSphere}>
                    <div
                      className={styles.sphereInner}
                      style={{ backgroundColor: color }}
                    />
                    <div
                      className={styles.sphereGlow}
                      style={{ backgroundColor: color }}
                    />
                  </div>

                  {/* Информация о событии */}
                  <div className={styles.eventInfo}>
                    <div className={styles.eventCategory} style={{ color }}>
                      {event.category === 'sport' && 'Спорт'}
                      {event.category === 'science' && 'Наука'}
                      {event.category === 'creative' && 'Творчество'}
                      {event.category === 'general' && 'Общее'}
                    </div>
                    <h3 className={styles.eventName}>{event.name}</h3>
                    <div className={styles.eventDate}>{formatDate(event.timestamp)}</div>
                    {event.description && (
                      <p className={styles.eventDescription}>{event.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Друзья сбоку */}
              {friends.length > 0 && (
                <div className={`${styles.friendsContainer} ${styles[`friends${side === 'left' ? 'Right' : 'Left'}`]}`}>
                  {displayFriends.map((friend, friendIndex) => {
                    const initials = (friend.firstName?.[0] || friend.lastName?.[0] || friend.username?.[0] || 'F').toUpperCase();
                    const displayName = `${friend.firstName} ${friend.lastName}`;
                    const imageUrl = friend.avatarUrl?.startsWith('http')
                      ? friend.avatarUrl
                      : friend.avatarUrl
                        ? `${process.env.NEXT_PUBLIC_S3_URL}/${friend.avatarUrl}`
                        : null;

                    return (
                      <div
                        key={friend.id}
                        className={styles.friendAvatar}
                        onClick={() => handleFriendClick(friend)}
                        style={{ cursor: isMobile ? 'pointer' : 'default' }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={displayName}
                            className={styles.friendImage}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className={styles.friendFallback}
                          style={{ display: imageUrl ? 'none' : 'flex' }}
                        >
                          {initials}
                        </div>
                        <div className={`${styles.friendTooltip} ${side === 'left' ? styles.tooltipLeft : styles.tooltipRight}`}>
                          {displayName}
                        </div>
                      </div>
                    );
                  })}
                  {/* Показываем счетчик оставшихся друзей */}
                  {remainingCount > 0 && (
                    <div className={styles.friendAvatar}>
                      <div className={styles.friendMore}>
                        +{remainingCount}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Соединительная линия к центральной линии */}
              <div
                className={`${styles.connectorLine} ${styles[side]}`}
                style={{ '--event-color': color } as React.CSSProperties}
              />
            </div>
          );
        })}
      </div>

      {/* Модальное окно события */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={handleCloseModal} />
      )}

      {/* Модальное окно друга */}
      {selectedFriend && (
        <FriendProfileModal
          isOpen={!!selectedFriend}
          onClose={handleCloseFriendModal}
          friend={selectedFriend}
        />
      )}
    </div>
  );
}

