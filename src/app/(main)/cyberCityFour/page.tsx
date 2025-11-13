"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useMemo, useState, Suspense } from "react";
import { Filter, List } from "lucide-react";
import styles from "./page.module.scss";
import { mockEvents, type CityEvent } from "./mockEvents";
import { useAuth } from "@/providers/AuthProvider";
import { useImperativeEventLayers } from "./hooks/useImperativeEventLayers";
import { useMapSetup } from "./hooks/useMapSetup";
import { useMapTheme } from "./hooks/useMapTheme";
import { useMapInteraction } from "./hooks/useMapInteraction";
import { createLocalMapStyle } from "./config/mapStyleConfig";

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


// ===== КОМПОНЕНТ =====

export default function CyberCityFour() {
  // Инициализация карты, темы и адаптивности
  const { isLight, isMobile, isVerySmallScreen } = useMapSetup();
  
  // Состояние карты
  const [mapRef, setMapRef] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Auth
  const { isLoggedIn } = useAuth();
  
  // Состояние UI
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  
  // Состояние выбранного события
  const [selectedEvent, setSelectedEvent] = useState<CityEvent | null>(null);
  const [eventOpenedFromList, setEventOpenedFromList] = useState(false);
  
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
    let result = [...mockEvents];
    
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
  }, [selectedCategories, datePreset, dateFrom, dateTo]);

  // GeoJSON данные для карты (используем отфильтрованные события)
  const eventGeoJSON = useMemo(() => ({
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
  }), [filteredEvents]);
  
  // Обработка взаимодействия с картой
  const { handleMapClick } = useMapInteraction({
    mapRef,
    selectedEvent,
    setSelectedEvent,
    setEventOpenedFromList
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

  // Мемоизированный обработчик закрытия фильтра
  const handleFilterClose = useCallback(() => {
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

  return (
    <section className={`${styles.page} ${isMobile ? styles.mobile : ''}`} data-swipe-enabled="false">
      <div className={styles.content}>
        <div className={`${styles.mapHost} ${mapLoaded ? styles.mapLoaded : ''} ${isMobile ? styles.mobileMap : ''}`}>
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
            interactiveLayerIds={mapLoaded ? ['event-points', 'clusters'] : []}
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
          {!isFilterOpen && !isListOpen && (
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
              />
            </Suspense>
          )}
        </div>
      </div>
    </section>
  );
}


