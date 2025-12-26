'use client';

import React, { useState } from 'react';
import { useSelectedGraphId } from '@/stores/useUIStore';
import { useEventsFeed } from '@/hooks/useEventsFeed';
import EventsTikTokContainer from '@/components/events/EventsTikTokContainer';
import EventSlide from '@/components/events/EventSlide';
import DynamicBackground from '@/components/events/DynamicBackground/DynamicBackground';
import SimilarEventsButton from '@/components/events/SimilarEventsButton';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { EmptyState } from '@/components/global/EmptyState/EmptyState';
import { ThemeName } from '@/components/shared/EventCard/pastelTheme';

export default function EventsTikTokFeed() {
  const selectedGraphId = useSelectedGraphId();
  const [filterByTheme, setFilterByTheme] = useState<ThemeName | null>(null);

  const {
    events,
    currentIndex,
    currentTheme,
    isLoading,
    error,
    setCurrentIndex,
  } = useEventsFeed({
    selectedGraphId,
    filterByTheme,
  });

  const handleFilterChange = (theme: ThemeName | null) => {
    setFilterByTheme(theme);
    setCurrentIndex(0); // Сбрасываем на первое событие при смене фильтра
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

  if (events.length === 0) {
    return <EmptyState message="Нет доступных событий" />;
  }

  return (
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

      <SimilarEventsButton
        currentTheme={currentTheme}
        isFiltered={!!filterByTheme}
        onFilterChange={handleFilterChange}
      />
    </EventsTikTokContainer>
  );
}

