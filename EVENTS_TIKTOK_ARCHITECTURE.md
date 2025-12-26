# Архитектура страницы /events в стиле TikTok

## 🎯 Концепция

Страница `/events` работает как вертикальная лента в стиле TikTok:

- Одно событие на экран
- Вертикальный скролл/свайп для переключения
- Динамический фон, меняющийся в зависимости от тематики события
- Анимированные объекты на фоне (планеты, иконки, частицы)
- Бесконечная подгрузка данных
- Кнопка "Показать похожее" для фильтрации по тематике

---

## 📐 Архитектура компонентов

```
/events (page.tsx)
└── EventsTikTokFeed
    ├── EventsTikTokContainer (главный контейнер)
    │   ├── DynamicBackground (динамический фон)
    │   │   ├── AnimatedObjects (планеты/объекты)
    │   │   └── GradientOverlay (градиентный оверлей)
    │   ├── EventSlide (обертка для одного события)
    │   │   └── EventCard (существующий компонент)
    │   ├── SimilarEventsButton (кнопка "Показать похожее")
    │   └── LoadingIndicator (индикатор загрузки)
    └── EventsFeedProvider (контекст для управления состоянием)
```

---

## 🏗️ Структура компонентов

### 1. EventsTikTokFeed (главный компонент)

**Расположение**: `src/app/(main)/events/EventsTikTokFeed.tsx`

**Ответственность**:

- Управление состоянием списка событий
- Загрузка данных через `useInfiniteQuery`
- Управление текущим индексом активного события
- Обработка фильтрации "похожих событий"

**Состояние**:

```typescript
interface EventsTikTokFeedState {
  events: EventItem[];
  currentIndex: number; // Индекс текущего видимого события
  filteredByTheme: ThemeName | null; // Фильтр по тематике
  isLoading: boolean;
  hasMore: boolean;
}
```

**Основная логика**:

```typescript
// Использует useInfiniteQuery для загрузки
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['eventsTikTok', selectedGraphId, filteredByTheme],
  queryFn: ({ pageParam = 0 }) =>
    EventService.getUpcomingEvents(selectedGraphId, pageParam, EVENTS_PER_PAGE),
  getNextPageParam: (lastPage, allPages) => {
    // Логика определения следующей страницы
  },
});

// Текущее событие
const currentEvent = events[currentIndex];
const currentTheme = getThemeName(currentEvent);
```

---

### 2. EventsTikTokContainer

**Расположение**: `src/components/events/EventsTikTokContainer.tsx`

**Ответственность**:

- Контейнер с вертикальным скроллом и snap-точками
- Обработка событий скролла для определения активного слайда
- Управление высотой и позиционированием слайдов

**Структура**:

```typescript
<div className={styles.container}>
  <DynamicBackground theme={currentTheme} />
  <div className={styles.slidesContainer}>
    {events.map((event, index) => (
      <EventSlide
        key={event._id}
        event={event}
        isActive={index === currentIndex}
        onIntersect={() => setCurrentIndex(index)}
      />
    ))}
  </div>
  <SimilarEventsButton currentTheme={currentTheme} onFilterChange={handleFilterChange} />
</div>
```

**CSS (snap-scroll)**:

```scss
.container {
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  // Отключение скроллбара для чистого вида
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.slidesContainer {
  display: flex;
  flex-direction: column;
}

.slide {
  height: 100vh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  position: relative;
}
```

---

### 3. DynamicBackground

**Расположение**: `src/components/events/DynamicBackground/DynamicBackground.tsx`

**Ответственность**:

- Динамическая смена фона в зависимости от тематики
- Управление анимированными объектами
- Плавные переходы между темами

**Реализация**:

```typescript
const DynamicBackground = ({ theme }: { theme: ThemeName }) => {
  const themeData = getPastelTheme(theme);

  return (
    <motion.div
      className={styles.background}
      style={{
        background: themeData.headerBgLight, // или headerBgDark в зависимости от темы
      }}
      animate={{
        background: themeData.headerBgLight,
      }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}>
      <AnimatedObjects theme={theme} />
      <GradientOverlay theme={theme} />
    </motion.div>
  );
};
```

**Стили**:

```scss
.background {
  position: fixed;
  inset: 0;
  z-index: 0;
  // Градиент берется из pastelTheme.ts
}
```

---

### 4. AnimatedObjects

**Расположение**: `src/components/events/DynamicBackground/AnimatedObjects.tsx`

**Ответственность**:

- Рендеринг анимированных объектов в зависимости от тематики
- Плавные анимации движения (планеты, иконки, частицы)

**Объекты по темам**:

- **Музыка**: ноты, звуковые волны, музыкальные инструменты
- **Бизнес**: графики, стрелки роста, диаграммы
- **IT/Наука**: коды, формулы, шестеренки
- **Искусство**: кисти, палитры, карандаши
- **Спорт**: мячи, медали, спортивные иконки
- И т.д.

**Реализация с Framer Motion**:

```typescript
const AnimatedObjects = ({ theme }: { theme: ThemeName }) => {
  const objects = getObjectsForTheme(theme); // Массив объектов для темы

  return (
    <>
      {objects.map((object, index) => (
        <motion.div
          key={index}
          className={styles.object}
          style={{
            ...object.initialPosition,
          }}
          animate={{
            x: object.initialPosition.x + object.movementRange.x,
            y: object.initialPosition.y + object.movementRange.y,
            rotate: object.rotation ? 360 : 0,
          }}
          transition={{
            duration: object.duration || 20,
            repeat: Infinity,
            ease: 'linear',
          }}>
          {object.icon}
        </motion.div>
      ))}
    </>
  );
};
```

**Пример объектов**:

```typescript
function getObjectsForTheme(theme: ThemeName): AnimatedObject[] {
  switch (theme) {
    case 'Музыка':
      return [
        {
          icon: <Music size={60} />,
          initialPosition: { x: '10%', y: '20%' },
          movementRange: { x: 50, y: 100 },
          duration: 25,
        },
        {
          icon: <Music size={40} />,
          initialPosition: { x: '80%', y: '60%' },
          movementRange: { x: -30, y: 80 },
          duration: 30,
        },
        // Больше объектов...
      ];
    case 'Бизнес':
      return [
        {
          icon: <TrendingUp size={50} />,
          initialPosition: { x: '15%', y: '40%' },
          movementRange: { x: 80, y: 50 },
          duration: 20,
        },
        // ...
      ];
    default:
      return []; // Без тематики - минимальные объекты
  }
}
```

**Оптимизация**:

- Использовать `will-change` для GPU-ускорения
- Ограничить количество объектов (3-5 на тему)
- Использовать CSS `transform` вместо `top/left`

---

### 5. EventSlide

**Расположение**: `src/components/events/EventSlide.tsx`

**Ответственность**:

- Обертка для одного события с правильной высотой
- Определение активного слайда через Intersection Observer
- Передача информации о текущем событии в DynamicBackground

**Реализация**:

```typescript
const EventSlide = ({
  event,
  isActive,
  onIntersect,
}: {
  event: EventItem;
  isActive: boolean;
  onIntersect: () => void;
}) => {
  const slideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      { threshold: 0.5 }, // Событие активно, когда 50% видно
    );

    if (slideRef.current) {
      observer.observe(slideRef.current);
    }

    return () => observer.disconnect();
  }, [onIntersect]);

  return (
    <div ref={slideRef} className={styles.slide}>
      <EventCard event={event} />
    </div>
  );
};
```

---

### 6. SimilarEventsButton

**Расположение**: `src/components/events/SimilarEventsButton.tsx`

**Ответственность**:

- Показ кнопки "Показать похожее" на основе текущей тематики
- Фильтрация событий по тематике при клике
- Сброс фильтра для возврата к общему потоку

**Реализация**:

```typescript
const SimilarEventsButton = ({
  currentTheme,
  isFiltered,
  onFilterChange,
}: {
  currentTheme: ThemeName;
  isFiltered: boolean;
  onFilterChange: (theme: ThemeName | null) => void;
}) => {
  const handleClick = () => {
    if (isFiltered) {
      // Сброс фильтра - показываем все события
      onFilterChange(null);
    } else {
      // Фильтруем по текущей тематике
      onFilterChange(currentTheme);
    }
  };

  return (
    <motion.button
      className={styles.button}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}>
      {isFiltered ? 'Показать все' : 'Показать похожее'}
    </motion.button>
  );
};
```

**Позиционирование**:

```scss
.button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  padding: 12px 24px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  // ...
}
```

---

## 🔄 Логика переключения событий

### Механизм скролла

1. **CSS Scroll Snap**: Обеспечивает привязку к каждому слайду
2. **Intersection Observer**: Определяет активный слайд для смены фона
3. **Preloading**: Предзагрузка следующего/предыдущего события

### Определение активного слайда

```typescript
const [currentIndex, setCurrentIndex] = useState(0);

useEffect(() => {
  const observers: IntersectionObserver[] = [];

  slides.forEach((slide, index) => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          setCurrentIndex(index);
        }
      },
      { threshold: [0.5] },
    );

    observer.observe(slide);
    observers.push(observer);
  });

  return () => {
    observers.forEach((obs) => obs.disconnect());
  };
}, [events]);
```

### Предзагрузка данных

```typescript
// Предзагружаем следующую страницу, когда осталось 3 события
useEffect(() => {
  if (currentIndex >= events.length - 3 && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }
}, [currentIndex, events.length, hasNextPage, isFetchingNextPage]);
```

---

## 🎨 Динамический фон

### Реализация смены фона

```typescript
const DynamicBackground = ({ theme }: { theme: ThemeName }) => {
  const themeData = getPastelTheme(theme);
  const isDark = useTheme(); // Хук для определения темы (light/dark)

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
      {/* Анимированные объекты */}
    </motion.div>
  );
};
```

### Плавные переходы

- **Длительность**: 0.8s для плавного перехода
- **Easing**: `easeInOut` для естественного движения
- **GPU-ускорение**: Использование `transform` и `opacity` вместо других свойств

---

## 📱 Мобильная оптимизация

### Touch события (swipe)

```typescript
const handleTouchStart = (e: TouchEvent) => {
  touchStartY.current = e.touches[0].clientY;
};

const handleTouchEnd = (e: TouchEvent) => {
  const touchEndY = e.changedTouches[0].clientY;
  const diff = touchStartY.current - touchEndY;

  if (Math.abs(diff) > 50) {
    // Минимальное расстояние для swipe
    if (diff > 0 && currentIndex < events.length - 1) {
      // Swipe вверх - следующее событие
      scrollToSlide(currentIndex + 1);
    } else if (diff < 0 && currentIndex > 0) {
      // Swipe вниз - предыдущее событие
      scrollToSlide(currentIndex - 1);
    }
  }
};
```

### Программная прокрутка

```typescript
const scrollToSlide = (index: number) => {
  const slideElement = slideRefs.current[index];
  if (slideElement) {
    slideElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
};
```

---

## ⚡ Оптимизация производительности

### 1. Виртуализация (опционально)

Для большого количества событий можно использовать `react-window` или `react-virtual`:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: events.length,
  getScrollElement: () => containerRef.current,
  estimateSize: () => window.innerHeight,
  overscan: 2, // Предзагружаем 2 события сверху и снизу
});
```

### 2. Lazy loading изображений

```typescript
// В EventCard используем next/image с lazy loading
<Image src={event.image} alt={event.name} loading="lazy" placeholder="blur" />
```

### 3. Мемоизация компонентов

```typescript
const EventSlide = React.memo(
  ({ event, isActive, onIntersect }) => {
    // ...
  },
  (prevProps, nextProps) => {
    return prevProps.event._id === nextProps.event._id && prevProps.isActive === nextProps.isActive;
  },
);
```

### 4. Оптимизация анимаций

- Использование `will-change: transform` для объектов
- Ограничение количества анимированных элементов
- Использование `transform` и `opacity` вместо других свойств
- Отключение анимаций при `prefers-reduced-motion`

```scss
@media (prefers-reduced-motion: reduce) {
  .object {
    animation: none;
  }
}
```

---

## 🎯 Рекомендации по реализации

### Фаза 1: Базовая структура

1. Создать `EventsTikTokFeed.tsx` с базовой логикой
2. Реализовать `EventsTikTokContainer` с CSS snap-scroll
3. Интегрировать существующий `EventCard`
4. Настроить загрузку данных через `useInfiniteQuery`

### Фаза 2: Динамический фон

1. Создать `DynamicBackground` компонент
2. Интегрировать с системой тем из `pastelTheme.ts`
3. Реализовать плавные переходы через Framer Motion
4. Добавить базовые анимированные объекты

### Фаза 3: Анимации и UX

1. Расширить `AnimatedObjects` для всех тем
2. Добавить кнопку "Показать похожее"
3. Реализовать touch/swipe события для мобильных
4. Оптимизировать производительность

### Фаза 4: Полировка

1. Добавить индикатор загрузки
2. Обработка пустых состояний
3. Обработка ошибок
4. Тестирование на различных устройствах

---

## 📋 Примеры кода

### Полная структура EventsTikTokFeed

```typescript
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { EventService } from '@/services/event.service';
import { EventItem } from '@/types/schedule.interface';
import { getThemeName, ThemeName } from '@/components/shared/EventCard/pastelTheme';
import { useSelectedGraphId } from '@/stores/useUIStore';
import EventsTikTokContainer from '@/components/events/EventsTikTokContainer';
import EventSlide from '@/components/events/EventSlide';
import DynamicBackground from '@/components/events/DynamicBackground/DynamicBackground';
import SimilarEventsButton from '@/components/events/SimilarEventsButton';

const EVENTS_PER_PAGE = 20;

export default function EventsTikTokFeed() {
  const selectedGraphId = useSelectedGraphId();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filteredByTheme, setFilteredByTheme] = useState<ThemeName | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['eventsTikTok', selectedGraphId, filteredByTheme],
    queryFn: async ({ pageParam = 0 }) => {
      if (!selectedGraphId) return { data: [] };
      return await EventService.getUpcomingEvents(selectedGraphId, pageParam, EVENTS_PER_PAGE);
    },
    enabled: !!selectedGraphId,
    getNextPageParam: (lastPage, allPages) => {
      const events = lastPage?.data || [];
      if (events.length < EVENTS_PER_PAGE) return undefined;
      return allPages.length * EVENTS_PER_PAGE;
    },
    initialPageParam: 0,
  });

  const events = useMemo(() => {
    if (!data?.pages) return [];
    let allEvents = data.pages.flatMap((page) => page?.data || []);

    // Фильтрация по тематике на клиенте (если нет API фильтрации)
    if (filteredByTheme) {
      allEvents = allEvents.filter((event) => {
        const eventTheme = getThemeName(event);
        return eventTheme === filteredByTheme;
      });
    }

    return allEvents;
  }, [data?.pages, filteredByTheme]);

  const currentEvent = events[currentIndex];
  const currentTheme = currentEvent ? getThemeName(currentEvent) : 'Без тематики';

  // Предзагрузка следующей страницы
  useEffect(() => {
    if (currentIndex >= events.length - 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [currentIndex, events.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleFilterChange = (theme: ThemeName | null) => {
    setFilteredByTheme(theme);
    setCurrentIndex(0); // Сбрасываем на первое событие
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (events.length === 0) {
    return <EmptyState />;
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
        isFiltered={!!filteredByTheme}
        onFilterChange={handleFilterChange}
      />
    </EventsTikTokContainer>
  );
}
```

---

## 🎨 Стили (SCSS)

### EventsTikTokContainer.module.scss

```scss
.container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.slidesContainer {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.background {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

// Оптимизация для производительности
@media (prefers-reduced-motion: reduce) {
  .container {
    scroll-behavior: auto;
  }
}

// Мобильные устройства
@media (max-width: 768px) {
  .container {
    -webkit-overflow-scrolling: touch;
  }
}
```

### EventSlide.module.scss

```scss
.slide {
  width: 100%;
  height: 100vh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}
```

---

## 🔍 Дополнительные соображения

### Доступность (Accessibility)

- Добавить `aria-label` для кнопки "Показать похожее"
- Поддержка клавиатурной навигации (стрелки вверх/вниз)
- Уважение к `prefers-reduced-motion`

### SEO

- Для SEO можно добавить мета-теги для каждого события
- Использовать `next/head` для динамических meta tags

### Аналитика

- Отслеживание просмотров событий (какое событие сколько времени просмотрено)
- Отслеживание кликов на "Показать похожее"

---

## 📦 Зависимости

- `framer-motion` - для анимаций
- `@tanstack/react-query` - для загрузки данных (уже используется)
- `lucide-react` - для иконок анимированных объектов (уже используется)

---

## 🚀 Заключение

Эта архитектура обеспечивает:

- ✅ Плавный UX в стиле TikTok
- ✅ Динамический фон, адаптирующийся к тематике
- ✅ Производительность через оптимизацию и предзагрузку
- ✅ Масштабируемость через модульную структуру
- ✅ Поддержку мобильных устройств
