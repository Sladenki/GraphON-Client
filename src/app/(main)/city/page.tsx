"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useMemo, useRef, useState, Suspense, useEffect } from "react";
import { Filter, List } from "lucide-react";
import styles from "./page.module.scss";
import { type CityEvent, type CityEventAPI } from "./mockEvents";
import type { EventCategory } from "./constants/categories";
import { useAuth } from "@/providers/AuthProvider";
import { useImperativeEventLayers } from "./hooks/useImperativeEventLayers";
import { useMapSetup } from "./hooks/useMapSetup";
import { useMapTheme } from "./hooks/useMapTheme";
import { useMapInteraction } from "./hooks/useMapInteraction";
import { createLocalMapStyle } from "./config/mapStyleConfig";
import { EventService } from "@/services/event.service";
import { GraphService } from "@/services/graph.service";
import { useQuery } from "@tanstack/react-query";
import { useCityEventsWithGeocoding } from "./hooks/useCityEvents";
import { SpinnerLoader } from "@/components/global/SpinnerLoader/SpinnerLoader";

// Константа ID графа города
const CITY_GRAPH_ID = "690bfec3f371d05b325be7ad";

// Маппинг названий тем на категории
const TOPIC_NAME_TO_CATEGORY: Record<string, EventCategory> = {
  "Бизнес": "business",
  "Вечеринки": "party",
  "Встречи": "meetup",
  "Гастро": "gastro",
  "Город": "city",
  "Искусство": "art",
  "Кино": "cinema",
  "Музыка": "music",
  "Образование": "education",
  "Семья": "family",
  "Спорт": "sport",
  "Театр": "theater",
  "Юмор": "humor",
  "Экскурсии": "excursion",
};

// Динамическая загрузка тяжелых компонентов
const ReactMapGL = dynamic(() => import("react-map-gl/maplibre").then(m => m.Map), { ssr: false });

// Lazy loading для попапов - загружаются только при открытии
const EventFilter = dynamic(() => import("./EventFilter/EventFilter"), {
  loading: () => <div className={styles.popupLoader}>Загрузка...</div>,
  ssr: false
});

const EventPopup = dynamic(() => import("./EventPopup/EventPopup"), {
  loading: () => <div className={styles.popupLoader}>Загрузка...</div>,
  ssr: false
});

const EventsList = dynamic(() => import("./EventsList"), {
  loading: () => <div className={styles.popupLoader}>Загрузка...</div>,
  ssr: false
});

const WelcomeNotice = dynamic(() => import("./components/WelcomeNotice"), {
  ssr: false
});


// ===== КОМПОНЕНТ =====

// Функция преобразования данных из API в CityEventAPI
function transformApiEventToCityEvent(apiEvent: any, topicMap: Map<string, string>): CityEventAPI {
  // Определяем категорию на основе parentGraphId
  let category: EventCategory = "city"; // Дефолтная категория
  
  // Получаем parentGraphId из события
  // Может быть в разных местах: apiEvent.parentGraphId или apiEvent.graphId?.parentGraphId
  const parentGraphId = apiEvent.parentGraphId 
    ? String(apiEvent.parentGraphId) 
    : (apiEvent.graphId?.parentGraphId ? String(apiEvent.graphId.parentGraphId) : null);
  
  if (parentGraphId) {
    // Проверяем точное совпадение
    if (topicMap.has(parentGraphId)) {
      const topicName = topicMap.get(parentGraphId)!;
      category = TOPIC_NAME_TO_CATEGORY[topicName] || "city";
    } else {
      // Пробуем найти по частичному совпадению (на случай разных форматов)
      const foundTopic = Array.from(topicMap.entries()).find(([id]) => 
        id === parentGraphId || String(id) === String(parentGraphId) || id.includes(parentGraphId) || parentGraphId.includes(id)
      );
      
      if (foundTopic) {
        const [, topicName] = foundTopic;
        category = TOPIC_NAME_TO_CATEGORY[topicName] || "city";
      }
    }
  }
  
  return {
    id: apiEvent._id,
    name: apiEvent.name,
    place: apiEvent.place,
    description: apiEvent.description,
    category: category,
    eventDate: apiEvent.eventDate,
    isDateTbd: apiEvent.isDateTbd || false,
    timeFrom: apiEvent.timeFrom,
    timeTo: apiEvent.timeTo,
    regedUsers: apiEvent.regedUsers || 0,
  };
}

export default function CityPage() {
  // Инициализация карты, темы и адаптивности
  const { isLight, isMobile, isVerySmallScreen } = useMapSetup();
  
  // Состояние карты
  const [mapRef, setMapRef] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapHostRef = useRef<HTMLDivElement | null>(null);
  
  // Auth
  const { isLoggedIn } = useAuth();
  
  // Состояние UI
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  
  // Состояние выбранного события
  const [selectedEvent, setSelectedEvent] = useState<CityEvent | null>(null);
  const [eventOpenedFromList, setEventOpenedFromList] = useState(false);

  // Загрузка тем города
  const { data: topicsResponse } = useQuery({
    queryKey: ['cityTopics', CITY_GRAPH_ID],
    queryFn: async () => {
      const response = await GraphService.getGraphsByTopic(CITY_GRAPH_ID);
      return response;
    },
    staleTime: 10 * 60 * 1000, // 10 минут
    gcTime: 30 * 60 * 1000, // 30 минут
  });

  // Создаем маппинг parentGraphId -> название темы
  const topicMap = useMemo(() => {
    const map = new Map<string, string>();
    
    // Структура ответа: { data: IGraphList[] } согласно CreateGraphForm
    // axios возвращает response.data, поэтому topicsResponse уже содержит { data: [...] }
    const topicsData = topicsResponse?.data?.data || (Array.isArray(topicsResponse?.data) ? topicsResponse.data : []);
    
    if (Array.isArray(topicsData)) {
      topicsData.forEach((topic: any) => {
        if (topic._id && topic.name) {
          map.set(String(topic._id), String(topic.name));
        }
      });
    }
    
    return map;
  }, [topicsResponse]);

  // Загрузка мероприятий из API
  const { data: eventsResponse, isLoading: isLoadingEvents, error: eventsError } = useQuery({
    queryKey: ['cityEvents', CITY_GRAPH_ID],
    queryFn: async () => {
      const response = await EventService.getUpcomingEvents(CITY_GRAPH_ID);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  });

  // Преобразование данных из API в CityEventAPI
  const eventsFromAPI = useMemo(() => {
    if (!eventsResponse?.data) return [];
    return (eventsResponse.data as any[]).map(event => transformApiEventToCityEvent(event, topicMap));
  }, [eventsResponse, topicMap]);

  // Геокодирование адресов для получения координат
  const { events: allEvents, isGeocoding } = useCityEventsWithGeocoding(eventsFromAPI);
  
  
  // Состояние фильтров
  const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({
    music: false,
    art: false,
    education: false,
    business: false,
    sport: false,
    humor: false,
    gastro: false,
    family: false,
    city: false,
    party: false,
    meetup: false,
    cinema: false,
    theater: false,
  });
  const [datePreset, setDatePreset] = useState<"today" | "tomorrow" | "weekend" | "custom" | null>(null);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  
  // Проверка наличия активных фильтров
  const hasActiveFilters = useMemo(() => {
    const activeCategories = Object.entries(selectedCategories)
      .filter(([_, selected]) => selected)
      .map(([key]) => key);
    
    return activeCategories.length > 0 || datePreset !== null;
  }, [selectedCategories, datePreset]);

  // Фильтрация событий по категориям и датам
  const filteredEvents = useMemo(() => {
    let result = [...allEvents];
    
    // Фильтрация по категориям
    const activeCategories = Object.entries(selectedCategories)
      .filter(([_, selected]) => selected)
      .map(([key]) => key);
    
    if (activeCategories.length > 0) {
      result = result.filter(event => activeCategories.includes(event.category));
    }
    
    // Фильтрация по датам
    if (datePreset === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      result = result.filter(event => {
        if (event.isDateTbd) return false;
        const eventDate = new Date(event.eventDate);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today && eventDate < tomorrow;
      });
    } else if (datePreset === "tomorrow") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
      result = result.filter(event => {
        if (event.isDateTbd) return false;
        const eventDate = new Date(event.eventDate);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= tomorrow && eventDate < dayAfterTomorrow;
      });
    } else if (datePreset === "weekend") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dayOfWeek = today.getDay();
      let weekendStart = new Date(today);
      
      // Если сегодня понедельник-четверг, берем ближайшие выходные
      // Если пятница-воскресенье, берем текущие выходные
      if (dayOfWeek >= 5) {
        // Уже выходные или пятница
        weekendStart = new Date(today);
      } else {
        // Найти следующую субботу
        const daysUntilSaturday = 6 - dayOfWeek;
        weekendStart.setDate(today.getDate() + daysUntilSaturday);
      }
      
      const weekendEnd = new Date(weekendStart);
      weekendEnd.setDate(weekendEnd.getDate() + 2); // Выходные: суббота + воскресенье
      
      result = result.filter(event => {
        if (event.isDateTbd) return false;
        const eventDate = new Date(event.eventDate);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= weekendStart && eventDate <= weekendEnd;
      });
    } else if (datePreset === "custom" && (dateFrom || dateTo)) {
      result = result.filter(event => {
        if (event.isDateTbd) return false;
        const eventDate = new Date(event.eventDate);
        eventDate.setHours(0, 0, 0, 0);
        
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          if (eventDate < fromDate) return false;
        }
        
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (eventDate > toDate) return false;
        }
        
        return true;
      });
    }
    
    return result;
  }, [allEvents, selectedCategories, datePreset, dateFrom, dateTo]);

  // GeoJSON данные для карты (используем отфильтрованные события)
  const eventGeoJSON = useMemo(() => {
    const geoJSON = {
      type: "FeatureCollection" as const,
      features: filteredEvents.map(ev => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [ev.lng, ev.lat] as [number, number]
        },
        properties: {
          id: ev.id,
          name: ev.name,
          place: ev.place,
          description: ev.description,
          category: ev.category,
          eventDate: ev.eventDate,
          isDateTbd: ev.isDateTbd,
          timeFrom: ev.timeFrom || "",
          timeTo: ev.timeTo || "",
          regedUsers: ev.regedUsers
        }
      }))
    };
    
    
    return geoJSON;
  }, [filteredEvents]);
  
  // Обработка взаимодействия с картой
  const { handleMapClick } = useMapInteraction({
    mapRef,
    selectedEvent,
    setSelectedEvent,
    setEventOpenedFromList,
    allEvents
  });
  
  // Управление темой карты
  const { handleMapLoad } = useMapTheme({ mapRef, mapLoaded, isLight });
  
  // Стиль карты
  const mapStyle = useMemo(() => {
    try {
      return createLocalMapStyle(isLight) as any;
    } catch (error) {
      console.error('❌ Ошибка при создании mapStyle:', error);
      return null;
    }
  }, [isLight]);
  
  // Добавление слоев событий на карту
  useImperativeEventLayers(mapRef, eventGeoJSON, isLight, mapLoaded);
  
  // Обработчик загрузки карты с применением стилей
  const onMapLoad = useCallback((e: any) => {
    const map = e?.target;
    if (!map) return;
    setMapRef(map);
    setMapLoaded(true);
    handleMapLoad(e); // Применяем стили темы
  }, [handleMapLoad]);

  // Мемоизированный обработчик открытия фильтра
  const handleFilterOpen = useCallback(() => {
    setIsFilterOpen(true);
  }, []);

  // Мемоизированный обработчик закрытия фильтра (без сброса позиции)
  const handleFilterClose = useCallback(() => {
    setIsFilterOpen(false);
  }, []);

  // Оптимизированная функция поиска ближайшего мероприятия
  // Использует квадрат расстояния для быстрого сравнения (избегает Math.sqrt)
  // Для Калининграда (небольшая территория) достаточно простой плоской проекции
  const findNearestEventForDate = useCallback((): CityEvent | null => {
    if (!mapRef || !mapLoaded || filteredEvents.length === 0) return null;
    
    try {
      // Получаем текущий центр карты
      const center = mapRef.getCenter();
      if (!center) return null;
      
      const currentLat = center.lat;
      const currentLng = center.lng;
      
      // Константы для преобразования градусов в метры (для широты Калининграда ~54.7°)
      // 1° широты ≈ 111 км, 1° долготы ≈ 65.5 км на широте 54.7°
      const LAT_TO_M = 111000; // метры на градус широты
      const LNG_TO_M = 65500;  // метры на градус долготы на широте ~54.7°
      
      // Находим ближайшее мероприятие, используя квадрат расстояния (быстрее)
      let nearestEvent: CityEvent | null = null;
      let minDistanceSquared = Infinity;
      
      for (const event of filteredEvents) {
        // Вычисляем квадрат расстояния (избегаем Math.sqrt для сравнения)
        const dLat = (event.lat - currentLat) * LAT_TO_M;
        const dLng = (event.lng - currentLng) * LNG_TO_M;
        const distanceSquared = dLat * dLat + dLng * dLng;
        
        if (distanceSquared < minDistanceSquared) {
          minDistanceSquared = distanceSquared;
          nearestEvent = event;
        }
      }
      
      return nearestEvent;
    } catch (error) {
      console.error('Ошибка при поиске ближайшего мероприятия:', error);
      return null;
    }
  }, [mapRef, mapLoaded, filteredEvents]);

  // Перемещение карты к ближайшему мероприятию при выборе даты
  useEffect(() => {
    // Проверяем базовые условия
    if (!datePreset || filteredEvents.length === 0 || !mapRef || !mapLoaded) return;
    
    // Для custom даты также проверяем наличие dateFrom
    if (datePreset === "custom" && !dateFrom) return;
    
    // Небольшая задержка для завершения фильтрации
    const timer = setTimeout(() => {
      const nearestEvent = findNearestEventForDate();
      if (nearestEvent) {
        try {
          mapRef.flyTo({
            center: [nearestEvent.lng, nearestEvent.lat],
            zoom: isVerySmallScreen ? 13.0 : (isMobile ? 14.0 : 15.5),
            pitch: 40,
            bearing: mapRef.getBearing() || -12,
            duration: 1500,
            essential: true
          });
        } catch (error) {
          console.error('Ошибка при перемещении карты к мероприятию:', error);
        }
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [datePreset, dateFrom, filteredEvents.length, mapRef, mapLoaded, findNearestEventForDate, isMobile, isVerySmallScreen]);

  // Мемоизированный обработчик применения фильтров (без сброса позиции, карта уже переместилась)
  const handleFilterApply = useCallback(() => {
    setIsFilterOpen(false);
  }, []);
  
  const handleListOpen = useCallback(() => {
    setIsListOpen(true);
  }, []);
  
  const handleListClose = useCallback(() => {
    setIsListOpen(false);
  }, []);

  // Обработчик выбора события из списка
  const handleEventSelectFromList = useCallback((event: CityEvent) => {
    setSelectedEvent(event);
    setEventOpenedFromList(true); // Открыто из списка
    setIsListOpen(false); // Закрываем список
  }, []);

  // Обработчик возврата к списку из EventPopup
  const handleBackToList = useCallback(() => {
    setSelectedEvent(null);
    setEventOpenedFromList(false);
    setIsListOpen(true); // Открываем список обратно
  }, []);

  // Обработчик открытия фильтра из EventsList
  const handleFilterOpenFromList = useCallback(() => {
    setIsListOpen(false);
    setIsFilterOpen(true);
  }, []);

  // Обработчик открытия списка из EventFilter
  const handleListOpenFromFilter = useCallback(() => {
    setIsFilterOpen(false);
    setIsListOpen(true);
  }, []);

  // Показываем загрузку только пока получаем данные из API
  // Геокодирование происходит в фоне, карта уже отображается с дефолтными координатами
  if (isLoadingEvents) {
    return (
      <section className={`${styles.page} ${isMobile ? styles.mobile : ''}`}>
        <div className={styles.content}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 12, flexDirection: 'column' }}>
            <SpinnerLoader />
            <span>Загрузка мероприятий...</span>
          </div>
        </div>
      </section>
    );
  }

  // Обработка ошибки загрузки
  if (eventsError) {
    return (
      <section className={`${styles.page} ${isMobile ? styles.mobile : ''}`}>
        <div className={styles.content}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 12, flexDirection: 'column' }}>
            <span style={{ color: 'var(--error-color, #ef4444)' }}>Ошибка загрузки мероприятий</span>
            <button 
              onClick={() => window.location.reload()} 
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid', cursor: 'pointer' }}
            >
              Обновить страницу
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${styles.page} ${isMobile ? styles.mobile : ''}`} data-swipe-enabled="false">
      <div className={styles.content}>
        <div ref={mapHostRef} className={`${styles.mapHost} ${mapLoaded ? styles.mapLoaded : ''} ${isMobile ? styles.mobileMap : ''}`}>
          <div className={styles.map}>
          <ReactMapGL
            initialViewState={{ 
              longitude: 20.5103, 
              latitude: 54.7068, 
              zoom: isVerySmallScreen ? 12.5 : (isMobile ? 13.0 : 15.0), 
              pitch: 40, 
              bearing: -12 
            }}
            mapStyle={mapStyle || undefined}
            attributionControl={false}
            dragRotate={!isMobile}
            maxBounds={[[20.36, 54.62], [20.62, 54.78]]}
            onLoad={onMapLoad}
            onClick={handleMapClick}
            interactiveLayerIds={mapLoaded ? ['event-points', 'event-icons', 'event-labels', 'event-border-circle', 'clusters'] : []}
            cursor="pointer"
          >
            {/* Маркеры событий добавляются императивно через useImperativeEventLayers */}
          </ReactMapGL>
          </div>

          {/* Мягкая градиентная подложка для светлой темы */}
          {isLight && <div className={styles.lightGradientOverlay} />}

          {/* Неоновый пост-обработка для темной темы */}
          {!isLight && <div className={styles.neonBoost} />}
          
          {/* Cyberpunk Effects - только для темной темы */}
          {!isLight && (
            <>
              {/* Неоновый виньетка (радиальное свечение по краям) */}
              <div className={styles.cyberpunkVignette} />
              
              {/* Неоновое свечение по углам */}
              <div className={styles.edgeGlow} />
              
              {/* Шум текстура */}
              <div className={styles.noiseOverlay} />
            </>
          )}
            
          {/* Кнопки фильтра и списка */}
          {!isFilterOpen && !isListOpen && !selectedEvent && (
            <>
              <button 
                className={`${styles.listButton} ${isLoggedIn ? styles.listButtonWithMenu : ''}`}
                onClick={handleListOpen}
                aria-label="Список мероприятий"
              >
                <List size={20} />
              </button>
              <button 
                className={`${styles.filterButton} ${isLoggedIn ? styles.filterButtonWithMenu : ''} ${hasActiveFilters ? styles.filterButtonActive : ''}`}
                onClick={handleFilterOpen}
                aria-label="Открыть фильтры"
              >
                <Filter size={20} />
                {hasActiveFilters && <span className={styles.filterBadge} />}
              </button>
            </>
          )}

          {/* Pop-up фильтра - загружается только при открытии */}
          {isFilterOpen && (
            <Suspense fallback={<div className={styles.popupLoader}>Загрузка фильтров...</div>}>
              <EventFilter 
                isOpen={isFilterOpen} 
                onClose={handleFilterClose}
                onApply={handleFilterApply}
                resultsCount={filteredEvents.length}
                selectedCategories={selectedCategories}
                onCategoriesChange={setSelectedCategories}
                datePreset={datePreset}
                onDatePresetChange={setDatePreset}
                dateFrom={dateFrom}
                onDateFromChange={setDateFrom}
                dateTo={dateTo}
                onDateToChange={setDateTo}
                onOpenList={handleListOpenFromFilter}
                portalContainer={mapHostRef.current || undefined}
              />
            </Suspense>
          )}
          
          {/* Pop-up списка мероприятий - загружается только при открытии */}
          {isListOpen && (
            <Suspense fallback={<div className={styles.popupLoader}>Загрузка списка...</div>}>
              <EventsList
                isOpen={isListOpen}
                onClose={handleListClose}
                events={filteredEvents}
                onEventClick={handleEventSelectFromList}
                onOpenFilter={handleFilterOpenFromList}
                hasActiveFilters={hasActiveFilters}
                portalContainer={mapHostRef.current || undefined}
              />
            </Suspense>
          )}
          
          {/* Pop-up события - загружается только при открытии */}
          {selectedEvent && (
            <Suspense fallback={<div className={styles.popupLoader}>Загрузка события...</div>}>
              <EventPopup
                event={selectedEvent}
                isOpen={!!selectedEvent}
                onClose={() => {
                  setSelectedEvent(null);
                  setEventOpenedFromList(false);
                }}
                isLight={isLight}
                showBackButton={eventOpenedFromList}
                onBack={handleBackToList}
                portalContainer={mapHostRef.current || undefined}
              />
            </Suspense>
          )}
        </div>
      </div>
      
      {/* Информационное сообщение при первом посещении */}
      <WelcomeNotice />
    </section>
  );
}


