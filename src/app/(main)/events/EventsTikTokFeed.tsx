'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSelectedGraphId } from '@/stores/useUIStore';
import { useEventsFeed } from '@/hooks/useEventsFeed';
import EventsTikTokContainer from '@/components/events/EventsTikTokContainer';
import EventSlide from '@/components/events/EventSlide';
import DynamicBackground from '@/components/events/DynamicBackground/DynamicBackground';
import SimilarEventsButton from '@/components/events/SimilarEventsButton';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { EmptyState } from '@/components/global/EmptyState/EmptyState';
import { ThemeName } from '@/components/shared/EventCard/pastelTheme';
import PillTabs from '@/components/shared/PillTabs/PillTabs';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { EventService } from '@/services/event.service';
import { GraphSubsService } from '@/services/graphSubs.service';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getThemeName, getPastelThemeTikTok } from '@/components/shared/EventCard/pastelTheme';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTheme } from 'next-themes';
import styles from './EventsTikTokFeed.module.scss';

type EventsPillTab = 'groups' | 'students' | 'subs';

const EVENTS_PER_PAGE = 20;

export default function EventsTikTokFeed() {
  const { isLoggedIn, user } = useAuth();
  const selectedGraphId = useSelectedGraphId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subsCount = user?.graphSubsNum ?? 0;
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [filterByTheme, setFilterByTheme] = useState<ThemeName | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const initialTab: EventsPillTab = useMemo(() => {
    const tab = searchParams.get('tab');
    if (tab === 'subs') return 'subs';
    if (tab === 'students') return 'students';
    return 'groups';
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<EventsPillTab>(initialTab);

  // Синхронизация таба с URL (простая логика как в EventsList)
  useEffect(() => {
    if (!isLoggedIn && activeTab === 'subs') {
      setActiveTab('groups');
    } else {
      setActiveTab(initialTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, initialTab]);

  const setTabInUrl = (tab: EventsPillTab) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (tab === 'subs') {
      sp.set('tab', 'subs');
    } else if (tab === 'students') {
      sp.set('tab', 'students');
    } else {
      // Для 'groups' удаляем параметр tab
      sp.delete('tab');
    }
    const qs = sp.toString();
    router.replace(qs ? `/events/?${qs}` : '/events/');
  };

  const handleTabChange = (tab: EventsPillTab) => {
    if (!isLoggedIn && tab === 'subs') return;
    // Сначала обновляем состояние, затем URL (как в EventsList)
    setActiveTab(tab);
    setCurrentIndex(0); // Сбрасываем индекс при смене таба
    setTabInUrl(tab);
  };

  // Загрузка событий в зависимости от активного таба
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ['eventsTikTok', selectedGraphId, activeTab, filterByTheme],
    queryFn: async ({ pageParam = 0 }) => {
      // Для таба 'subs' используем другой API endpoint (через graphSubs/getSubsEvents)
      if (activeTab === 'subs' && isLoggedIn) {
        // Используем GraphSubsService (пока без пагинации на сервере)
        // Загружаем все события и делаем пагинацию на клиенте
        if (pageParam === 0) {
          const result = await GraphSubsService.getSubsEvents();
          const allEvents = result?.data || [];
          return { data: allEvents.slice(0, EVENTS_PER_PAGE), allEvents };
        }
        // Для следующих страниц используем данные из кеша
        return { data: [] };
      }

      // Для таба 'students' используем endpoint для мероприятий, созданных студентами
      if (activeTab === 'students') {
        if (!selectedGraphId) {
          return { data: [] };
        }
        return await EventService.getStudentCreatedEvents(selectedGraphId, undefined, pageParam, EVENTS_PER_PAGE);
      }

      // Для остальных табов используем обычный endpoint
      if (!selectedGraphId) {
        return { data: [] };
      }
      return await EventService.getUpcomingEvents(selectedGraphId, pageParam, EVENTS_PER_PAGE);
    },
    enabled: (activeTab === 'subs' ? isLoggedIn : !!selectedGraphId),
    getNextPageParam: (lastPage, allPages) => {
      // Для таба 'subs' делаем пагинацию на клиенте
      if (activeTab === 'subs' && isLoggedIn) {
        const allEvents = (lastPage as any).allEvents || [];
        const currentPage = allPages.length;
        const start = currentPage * EVENTS_PER_PAGE;
        if (start >= allEvents.length) {
          return undefined;
        }
        return start;
      }

      // Для остальных табов - обычная пагинация
      const events = lastPage?.data || [];
      if (events.length < EVENTS_PER_PAGE) {
        return undefined;
      }
      return allPages.length * EVENTS_PER_PAGE;
    },
    initialPageParam: 0,
    gcTime: 15 * 60 * 1000,
    staleTime: 10 * 60 * 1000,
  });

  // Объединение всех страниц в один массив событий
  const events = useMemo(() => {
    if (!data?.pages) return [];

    // Для таба 'subs' используем все события из первой страницы
    if (activeTab === 'subs' && isLoggedIn) {
      const firstPage = data.pages[0];
      if ((firstPage as any)?.isSubs && (firstPage as any)?.allEvents) {
        const allEvents = (firstPage as any).allEvents;
        
        // Применяем фильтрацию по тематике
        if (filterByTheme) {
          return allEvents.filter((event: any) => {
            const eventTheme = getThemeName(event);
            return eventTheme === filterByTheme;
          });
        }
        return allEvents;
      }
      // Fallback: объединяем все страницы
      return data.pages.flatMap((page) => page?.data || []);
    }

    // Для остальных табов объединяем все страницы
    let allEvents = data.pages.flatMap((page) => page?.data || []);

    // Фильтрация по тематике
    if (filterByTheme) {
      allEvents = allEvents.filter((event) => {
        const eventTheme = getThemeName(event);
        return eventTheme === filterByTheme;
      });
    }

    return allEvents;
  }, [data?.pages, activeTab, filterByTheme, isLoggedIn]);

  const currentEvent = events[currentIndex] || null;
  const currentTheme = currentEvent ? getThemeName(currentEvent) : 'Без тематики';

  // Предзагрузка следующей страницы
  useEffect(() => {
    if (currentIndex >= events.length - 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [currentIndex, events.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleFilterChange = (theme: ThemeName | null) => {
    setFilterByTheme(theme);
    setCurrentIndex(0);
  };

  if (isLoading) {
    return <SpinnerLoader />;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Ошибка загрузки событий. Попробуйте обновить страницу.
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Переключатель вкладок */}
      <div className={styles.tabsContainer}>
        <div className={styles.pillsWrapper}>
          <PillTabs
            options={[
              { key: 'groups', label: 'События' },
              { key: 'students', label: 'Студенчество' },
              ...(isLoggedIn ? [{ key: 'subs', label: 'Подписки', badge: subsCount }] : []),
            ]}
            activeKey={activeTab}
            onChange={(key) => handleTabChange(key as EventsPillTab)}
            className={styles.fullWidthRail}
            aria-label="Фильтр событий"
          />
        </div>
      </div>

      {events.length === 0 ? (
        <EmptyState message="Нет доступных событий" />
      ) : (
        <EventsTikTokContainer>
          <DynamicBackground theme={currentTheme} />

          {events.map((event, index) => (
            <EventSlide
              key={event._id}
              event={event}
              isActive={index === currentIndex}
              onIntersect={() => setCurrentIndex(index)}
            />
          ))}

          {/* <SimilarEventsButton
            currentTheme={currentTheme}
            isFiltered={!!filterByTheme}
            onFilterChange={handleFilterChange}
          /> */}
        </EventsTikTokContainer>
      )}
    </div>
  );
}
