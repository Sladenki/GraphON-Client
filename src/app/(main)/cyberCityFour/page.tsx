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
  
  // GeoJSON данные для карты
  const eventGeoJSON = useMemo(() => ({
    type: "FeatureCollection" as const,
    features: mockEvents.map(ev => ({
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
  }), []);
  
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
                className={`${styles.filterButton} ${isLoggedIn ? styles.filterButtonWithMenu : ''}`}
                onClick={handleFilterOpen}
                aria-label="Открыть фильтры"
              >
                <Filter size={20} />
              </button>
            </>
          )}

          {/* Pop-up фильтра - загружается только при открытии */}
          {isFilterOpen && (
            <Suspense fallback={<div className={styles.popupLoader}>Загрузка фильтров...</div>}>
              <EventFilter 
                isOpen={isFilterOpen} 
                onClose={handleFilterClose}
                resultsCount={mockEvents.length}
              />
            </Suspense>
          )}
          
          {/* Pop-up списка мероприятий - загружается только при открытии */}
          {isListOpen && (
            <Suspense fallback={<div className={styles.popupLoader}>Загрузка списка...</div>}>
              <EventsList
                isOpen={isListOpen}
                onClose={handleListClose}
                events={mockEvents}
                onEventClick={handleEventSelectFromList}
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


