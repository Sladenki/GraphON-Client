# Примеры реализации компонентов для TikTok-стиля страницы /events

## 📝 Содержание

1. [EventsTikTokContainer](#eventstiktokcontainer)
2. [DynamicBackground](#dynamicbackground)
3. [AnimatedObjects](#animatedobjects)
4. [EventSlide](#eventslide)
5. [SimilarEventsButton](#similareventsbutton)
6. [Хук useEventsFeed](#хук-useeventsfeed)

---

## EventsTikTokContainer

**Файл**: `src/components/events/EventsTikTokContainer.tsx`

```typescript
'use client';

import React, { ReactNode } from 'react';
import styles from './EventsTikTokContainer.module.scss';

interface EventsTikTokContainerProps {
  children: ReactNode;
}

export default function EventsTikTokContainer({ children }: EventsTikTokContainerProps) {
  return (
    <div className={styles.container}>
      <div className={styles.slidesContainer}>{children}</div>
    </div>
  );
}
```

**Файл**: `src/components/events/EventsTikTokContainer.module.scss`

```scss
.container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;

  // Скрытие scrollbar для чистого вида
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  // Оптимизация для мобильных
  -webkit-overflow-scrolling: touch;
}

.slidesContainer {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

// Уважение к пользовательским предпочтениям
@media (prefers-reduced-motion: reduce) {
  .container {
    scroll-behavior: auto;
  }
}
```

---

## DynamicBackground

**Файл**: `src/components/events/DynamicBackground/DynamicBackground.tsx`

```typescript
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { getPastelTheme, ThemeName } from '@/components/shared/EventCard/pastelTheme';
import AnimatedObjects from './AnimatedObjects';
import GradientOverlay from './GradientOverlay';
import styles from './DynamicBackground.module.scss';

interface DynamicBackgroundProps {
  theme: ThemeName;
  isDark?: boolean;
}

export default function DynamicBackground({ theme, isDark = false }: DynamicBackgroundProps) {
  const themeData = getPastelTheme(theme);

  const backgroundStyle = isDark ? themeData.headerBgDark : themeData.headerBgLight;

  return (
    <motion.div
      className={styles.background}
      style={{
        background: backgroundStyle,
      }}
      animate={{
        background: backgroundStyle,
      }}
      transition={{
        duration: 0.8,
        ease: 'easeInOut',
      }}>
      <AnimatedObjects theme={theme} />
      <GradientOverlay theme={theme} />
    </motion.div>
  );
}
```

**Файл**: `src/components/events/DynamicBackground/DynamicBackground.module.scss`

```scss
.background {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  will-change: background;
}
```

---

## AnimatedObjects

**Файл**: `src/components/events/DynamicBackground/AnimatedObjects.tsx`

```typescript
'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
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
  TrendingUp,
  Code,
  Beaker,
  Camera,
} from 'lucide-react';
import { ThemeName } from '@/components/shared/EventCard/pastelTheme';
import styles from './AnimatedObjects.module.scss';

interface AnimatedObject {
  icon: React.ReactNode;
  initialPosition: { x: string; y: string };
  movementRange: { x: number; y: number };
  rotation?: boolean;
  duration: number;
  size?: number;
}

function getObjectsForTheme(theme: ThemeName): AnimatedObject[] {
  switch (theme) {
    case 'Музыка':
      return [
        {
          icon: <Music />,
          initialPosition: { x: '10%', y: '20%' },
          movementRange: { x: 50, y: 100 },
          duration: 25,
          size: 60,
        },
        {
          icon: <Music />,
          initialPosition: { x: '80%', y: '60%' },
          movementRange: { x: -30, y: 80 },
          duration: 30,
          size: 40,
          rotation: true,
        },
        {
          icon: <Music />,
          initialPosition: { x: '50%', y: '80%' },
          movementRange: { x: 70, y: -50 },
          duration: 28,
          size: 50,
        },
      ];

    case 'Бизнес':
      return [
        {
          icon: <TrendingUp />,
          initialPosition: { x: '15%', y: '40%' },
          movementRange: { x: 80, y: 50 },
          duration: 20,
          size: 50,
        },
        {
          icon: <Briefcase />,
          initialPosition: { x: '70%', y: '30%' },
          movementRange: { x: -40, y: 90 },
          duration: 22,
          size: 45,
        },
      ];

    case 'Наука':
    case 'Образование':
      return [
        {
          icon: <Beaker />,
          initialPosition: { x: '20%', y: '50%' },
          movementRange: { x: 60, y: 70 },
          duration: 24,
          size: 55,
          rotation: true,
        },
        {
          icon: <GraduationCap />,
          initialPosition: { x: '75%', y: '25%' },
          movementRange: { x: -50, y: 80 },
          duration: 26,
          size: 50,
        },
      ];

    case 'Искусство':
    case 'Творчество':
      return [
        {
          icon: <Palette />,
          initialPosition: { x: '25%', y: '35%' },
          movementRange: { x: 70, y: 60 },
          duration: 23,
          size: 55,
          rotation: true,
        },
        {
          icon: <Camera />,
          initialPosition: { x: '65%', y: '70%' },
          movementRange: { x: -45, y: 50 },
          duration: 27,
          size: 48,
        },
      ];

    case 'Спорт':
      return [
        {
          icon: <Trophy />,
          initialPosition: { x: '30%', y: '45%' },
          movementRange: { x: 65, y: 75 },
          duration: 21,
          size: 52,
        },
      ];

    case 'Кино':
      return [
        {
          icon: <Film />,
          initialPosition: { x: '20%', y: '30%' },
          movementRange: { x: 80, y: 90 },
          duration: 25,
          size: 50,
        },
      ];

    case 'Театр':
      return [
        {
          icon: <Theater />,
          initialPosition: { x: '15%', y: '50%' },
          movementRange: { x: 75, y: 65 },
          duration: 24,
          size: 55,
        },
      ];

    default:
      return []; // Без тематики - минимальные объекты или пусто
  }
}

export default function AnimatedObjects({ theme }: { theme: ThemeName }) {
  const objects = useMemo(() => getObjectsForTheme(theme), [theme]);

  if (objects.length === 0) {
    return null;
  }

  return (
    <>
      {objects.map((object, index) => (
        <motion.div
          key={index}
          className={styles.object}
          style={{
            position: 'absolute',
            left: object.initialPosition.x,
            top: object.initialPosition.y,
            width: object.size || 50,
            height: object.size || 50,
            color: 'rgba(0, 0, 0, 0.15)',
            opacity: 0.6,
          }}
          animate={{
            x: object.movementRange.x,
            y: object.movementRange.y,
            rotate: object.rotation ? 360 : 0,
          }}
          transition={{
            duration: object.duration,
            repeat: Infinity,
            ease: 'linear',
          }}>
          {object.icon}
        </motion.div>
      ))}
    </>
  );
}
```

**Файл**: `src/components/events/DynamicBackground/AnimatedObjects.module.scss`

```scss
.object {
  position: absolute;
  will-change: transform;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 100%;
    height: 100%;
  }
}

// Отключение анимаций для пользователей с prefers-reduced-motion
@media (prefers-reduced-motion: reduce) {
  .object {
    animation: none;
  }
}
```

---

## EventSlide

**Файл**: `src/components/events/EventSlide.tsx`

```typescript
'use client';

import React, { useEffect, useRef } from 'react';
import EventCard from '@/components/shared/EventCard/EventCard';
import { EventItem } from '@/types/schedule.interface';
import styles from './EventSlide.module.scss';

interface EventSlideProps {
  event: EventItem;
  isActive: boolean;
  onIntersect: () => void;
}

export default function EventSlide({ event, isActive, onIntersect }: EventSlideProps) {
  const slideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            onIntersect();
          }
        });
      },
      {
        threshold: [0.5], // Событие активно, когда 50% видно
        rootMargin: '0px',
      },
    );

    const currentRef = slideRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [onIntersect]);

  return (
    <div ref={slideRef} className={styles.slide}>
      <div className={styles.cardWrapper}>
        <EventCard event={event} />
      </div>
    </div>
  );
}
```

**Файл**: `src/components/events/EventSlide.module.scss`

```scss
.slide {
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.cardWrapper {
  width: 100%;
  max-width: 680px; // Максимальная ширина EventCard
  position: relative;
  z-index: 1;
}
```

---

## SimilarEventsButton

**Файл**: `src/components/events/SimilarEventsButton.tsx`

```typescript
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ThemeName } from '@/components/shared/EventCard/pastelTheme';
import styles from './SimilarEventsButton.module.scss';

interface SimilarEventsButtonProps {
  currentTheme: ThemeName;
  isFiltered: boolean;
  onFilterChange: (theme: ThemeName | null) => void;
}

export default function SimilarEventsButton({
  currentTheme,
  isFiltered,
  onFilterChange,
}: SimilarEventsButtonProps) {
  const handleClick = () => {
    if (isFiltered) {
      // Сброс фильтра - показываем все события
      onFilterChange(null);
    } else {
      // Фильтруем по текущей тематике
      onFilterChange(currentTheme);
    }
  };

  // Не показываем кнопку для темы "Без тематики"
  if (currentTheme === 'Без тематики') {
    return null;
  }

  return (
    <motion.button
      className={styles.button}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}>
      <span className={styles.text}>{isFiltered ? 'Показать все' : 'Показать похожее'}</span>
      {isFiltered && (
        <motion.span className={styles.badge} initial={{ scale: 0 }} animate={{ scale: 1 }}>
          {currentTheme}
        </motion.span>
      )}
    </motion.button>
  );
}
```

**Файл**: `src/components/events/SimilarEventsButton.module.scss`

```scss
.button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
  padding: 12px 24px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  font-family: var(--font-inter);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    background: rgba(255, 255, 255, 1);
  }

  &:active {
    transform: scale(0.98);
  }
}

.text {
  white-space: nowrap;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(var(--main-Color), 0.1);
  color: rgb(var(--main-Color));
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

// Мобильные устройства
@media (max-width: 768px) {
  .button {
    bottom: 16px;
    right: 16px;
    padding: 10px 20px;
    font-size: 13px;
  }
}
```

---

## Хук useEventsFeed

**Файл**: `src/hooks/useEventsFeed.ts`

```typescript
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { EventService } from '@/services/event.service';
import { EventItem } from '@/types/schedule.interface';
import { getThemeName, ThemeName } from '@/components/shared/EventCard/pastelTheme';

const EVENTS_PER_PAGE = 20;

interface UseEventsFeedOptions {
  selectedGraphId: string | null;
  filterByTheme?: ThemeName | null;
}

export function useEventsFeed({ selectedGraphId, filterByTheme = null }: UseEventsFeedOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, refetch } =
    useInfiniteQuery({
      queryKey: ['eventsTikTok', selectedGraphId, filterByTheme],
      queryFn: async ({ pageParam = 0 }) => {
        if (!selectedGraphId) {
          return { data: [] };
        }
        return await EventService.getUpcomingEvents(selectedGraphId, pageParam, EVENTS_PER_PAGE);
      },
      enabled: !!selectedGraphId,
      getNextPageParam: (lastPage, allPages) => {
        const events = lastPage?.data || [];
        if (events.length < EVENTS_PER_PAGE) {
          return undefined;
        }
        return allPages.length * EVENTS_PER_PAGE;
      },
      initialPageParam: 0,
      gcTime: 15 * 60 * 1000, // 15 минут
      staleTime: 10 * 60 * 1000, // 10 минут
    });

  // Объединение всех страниц в один массив событий
  const events = useMemo(() => {
    if (!data?.pages) return [];
    let allEvents = data.pages.flatMap((page) => page?.data || []);

    // Клиентская фильтрация по тематике (если нет API фильтрации)
    if (filterByTheme) {
      allEvents = allEvents.filter((event) => {
        const eventTheme = getThemeName(event);
        return eventTheme === filterByTheme;
      });
    }

    return allEvents;
  }, [data?.pages, filterByTheme]);

  const currentEvent = events[currentIndex] || null;
  const currentTheme = currentEvent ? getThemeName(currentEvent) : 'Без тематики';

  // Предзагрузка следующей страницы
  useEffect(() => {
    if (currentIndex >= events.length - 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [currentIndex, events.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const goToNext = useCallback(() => {
    if (currentIndex < events.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, events.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const setFilterByTheme = useCallback((theme: ThemeName | null) => {
    setCurrentIndex(0); // Сбрасываем на первое событие при смене фильтра
  }, []);

  return {
    events,
    currentEvent,
    currentIndex,
    currentTheme,
    isLoading,
    error,
    hasMore: hasNextPage,
    isFetchingMore: isFetchingNextPage,
    setCurrentIndex,
    goToNext,
    goToPrevious,
    refetch,
  };
}
```

---

## Использование в page.tsx

**Файл**: `src/app/(main)/events/tiktok/page.tsx`

```typescript
'use client';

import React from 'react';
import { useSelectedGraphId } from '@/stores/useUIStore';
import { useEventsFeed } from '@/hooks/useEventsFeed';
import EventsTikTokContainer from '@/components/events/EventsTikTokContainer';
import EventSlide from '@/components/events/EventSlide';
import DynamicBackground from '@/components/events/DynamicBackground/DynamicBackground';
import SimilarEventsButton from '@/components/events/SimilarEventsButton';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { EmptyState } from '@/components/global/EmptyState/EmptyState';
import { useState } from 'react';
import { ThemeName } from '@/components/shared/EventCard/pastelTheme';

export default function EventsTikTokPage() {
  const selectedGraphId = useSelectedGraphId();
  const [filterByTheme, setFilterByTheme] = useState<ThemeName | null>(null);

  const { events, currentEvent, currentIndex, currentTheme, isLoading, error, setCurrentIndex } =
    useEventsFeed({
      selectedGraphId,
      filterByTheme,
    });

  if (isLoading) {
    return <SpinnerLoader />;
  }

  if (error) {
    return <div>Ошибка загрузки событий</div>;
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
        onFilterChange={setFilterByTheme}
      />
    </EventsTikTokContainer>
  );
}
```

---

## Дополнительные утилиты

### GradientOverlay (опционально)

**Файл**: `src/components/events/DynamicBackground/GradientOverlay.tsx`

```typescript
'use client';

import React from 'react';
import { ThemeName } from '@/components/shared/EventCard/pastelTheme';
import styles from './GradientOverlay.module.scss';

interface GradientOverlayProps {
  theme: ThemeName;
}

export default function GradientOverlay({ theme }: GradientOverlayProps) {
  // Можно добавить дополнительный градиентный оверлей для глубины
  return <div className={styles.overlay} />;
}
```

---

## 🎯 Следующие шаги

1. Создать структуру папок:

   ```
   src/
   ├── components/
   │   └── events/
   │       ├── EventsTikTokContainer.tsx
   │       ├── EventsTikTokContainer.module.scss
   │       ├── EventSlide.tsx
   │       ├── EventSlide.module.scss
   │       ├── SimilarEventsButton.tsx
   │       ├── SimilarEventsButton.module.scss
   │       └── DynamicBackground/
   │           ├── DynamicBackground.tsx
   │           ├── DynamicBackground.module.scss
   │           ├── AnimatedObjects.tsx
   │           ├── AnimatedObjects.module.scss
   │           └── GradientOverlay.tsx (опционально)
   └── hooks/
       └── useEventsFeed.ts
   ```

2. Интегрировать в существующую структуру проекта
3. Тестировать на различных устройствах
4. Оптимизировать производительность
5. Добавить обработку ошибок и пустых состояний
