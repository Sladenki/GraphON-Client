"use client";

import { memo } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import { useEventIcons } from "./useEventIcons";
import { CATEGORY_COLORS } from "../constants/categories";

interface EventMarkerProps {
  eventGeoJSON: {
    type: "FeatureCollection";
    features: Array<{
      type: "Feature";
      geometry: {
        type: "Point";
        coordinates: [number, number];
      };
      properties: Record<string, any>;
    }>;
  };
  isLight: boolean;
  mapRef?: any;
}

/**
 * Компонент для отображения маркеров событий на карте
 * Использует SVG иконки через icon-image для высокой производительности
 * Мемоизирован для предотвращения лишних рендеров
 */
function EventMarker({ eventGeoJSON, isLight, mapRef }: EventMarkerProps) {
  // Загружаем SVG иконки в карту
  useEventIcons(mapRef, isLight);

  return (
    <Source 
      id="events" 
      type="geojson" 
      data={eventGeoJSON}
      cluster={true}
      clusterMaxZoom={14}
      clusterRadius={50}
    >
      {/* Кластеры - внешнее свечение (усиленное) */}
      <Layer
        id="clusters-glow"
        type="circle"
        filter={["has", "point_count"]}
        paint={{
          "circle-radius": [
            "step",
            ["get", "point_count"],
            28, // 1-10 событий
            10, 38, // 10-50 событий
            50, 48, // 50+ событий
          ],
          "circle-color": "#6a57e8",
          "circle-opacity": isLight ? 0.3 : 0.5,
          "circle-blur": 2,
        }}
      />

      {/* Кластеры - основной круг с градиентом */}
      <Layer
        id="clusters"
        type="circle"
        filter={["has", "point_count"]}
        paint={{
          "circle-radius": [
            "step",
            ["get", "point_count"],
            24, // 1-10 событий (увеличено)
            10, 32, // 10-50 событий
            50, 40, // 50+ событий
          ],
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#6a57e8", // 1-10 событий
            10, "#7c68eb", // 10-50 событий (промежуточный)
            50, "#8b7aef", // 50+ событий
          ],
          "circle-opacity": 1,
          "circle-stroke-width": [
            "step",
            ["get", "point_count"],
            4, // 1-10 событий
            10, 4.5, // 10-50 событий
            50, 5, // 50+ событий
          ],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-opacity": 1,
        }}
      />

      {/* Кластеры - число событий */}
      <Layer
        id="cluster-count"
        type="symbol"
        filter={["has", "point_count"]}
        layout={{
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": [
            "step",
            ["get", "point_count"],
            16, // 1-10 событий (увеличено)
            10, 17, // 10-50 событий
            50, 18, // 50+ событий
          ],
          "text-allow-overlap": true,
        }}
        paint={{
          "text-color": "#ffffff",
          "text-halo-color": "rgba(0, 0, 0, 0.3)",
          "text-halo-width": 1.5,
          "text-halo-blur": 0.5,
        }}
      />

      {/* Некластеризованные точки - внешнее пульсирующее кольцо (усиленное) */}
      <Layer
        id="event-pulse-outer"
        type="circle"
        filter={["!", ["has", "point_count"]]}
        paint={{
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 24,
            15, 32,
            18, 42
          ],
          "circle-color": [
            "match",
            ["get", "category"],
            "music", CATEGORY_COLORS.music.pulseGlow,
            "art", CATEGORY_COLORS.art.pulseGlow,
            "education", CATEGORY_COLORS.education.pulseGlow,
            "business", CATEGORY_COLORS.business.pulseGlow,
            "sport", CATEGORY_COLORS.sport.pulseGlow,
            "humor", CATEGORY_COLORS.humor.pulseGlow,
            "gastro", CATEGORY_COLORS.gastro.pulseGlow,
            "family", CATEGORY_COLORS.family.pulseGlow,
            "city", CATEGORY_COLORS.city.pulseGlow,
            CATEGORY_COLORS.default.pulseGlow
          ],
          "circle-opacity": isLight ? 0.35 : 0.5,
          "circle-blur": 2.5,
        }}
      />

      {/* Некластеризованные точки - второй слой свечения (насыщенный) */}
      <Layer
        id="event-glow-middle"
        type="circle"
        filter={["!", ["has", "point_count"]]}
        paint={{
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 16,
            15, 22,
            18, 28
          ],
          "circle-color": [
            "match",
            ["get", "category"],
            "music", CATEGORY_COLORS.music.glow,
            "art", CATEGORY_COLORS.art.glow,
            "education", CATEGORY_COLORS.education.glow,
            "business", CATEGORY_COLORS.business.glow,
            "sport", CATEGORY_COLORS.sport.glow,
            "humor", CATEGORY_COLORS.humor.glow,
            "gastro", CATEGORY_COLORS.gastro.glow,
            "family", CATEGORY_COLORS.family.glow,
            "city", CATEGORY_COLORS.city.glow,
            CATEGORY_COLORS.default.glow
          ],
          "circle-opacity": isLight ? 0.6 : 0.8,
          "circle-blur": 2,
        }}
      />

      {/* Некластеризованные точки - интенсивное свечение (только для темной темы) */}
      {!isLight && (
        <Layer
          id="event-glow"
          type="circle"
          filter={["!", ["has", "point_count"]]}
          paint={{
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10, 14,
              15, 19,
              18, 24
            ],
            "circle-color": [
              "match",
              ["get", "category"],
              "music", CATEGORY_COLORS.music.glow,
              "art", CATEGORY_COLORS.art.glow,
              "education", CATEGORY_COLORS.education.glow,
              "business", CATEGORY_COLORS.business.glow,
              "sport", CATEGORY_COLORS.sport.glow,
              "humor", CATEGORY_COLORS.humor.glow,
              "gastro", CATEGORY_COLORS.gastro.glow,
              "family", CATEGORY_COLORS.family.glow,
              "city", CATEGORY_COLORS.city.glow,
              CATEGORY_COLORS.default.glow
            ],
            "circle-opacity": 0.9,
            "circle-blur": 2.5,
          }}
        />
      )}

      {/* Некластеризованные точки - стильный центральный круг */}
      <Layer
        id="event-border-circle"
        type="circle"
        filter={["!", ["has", "point_count"]]}
        paint={{
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 12,
            15, 16,
            18, 20
          ],
          "circle-color": isLight ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.15)",
          "circle-opacity": 1,
          "circle-stroke-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 3.5,
            15, 4.5,
            18, 5.5
          ],
          "circle-stroke-color": [
            "match",
            ["get", "category"],
            "music", isLight ? CATEGORY_COLORS.music.light : CATEGORY_COLORS.music.dark,
            "art", isLight ? CATEGORY_COLORS.art.light : CATEGORY_COLORS.art.dark,
            "education", isLight ? CATEGORY_COLORS.education.light : CATEGORY_COLORS.education.dark,
            "business", isLight ? CATEGORY_COLORS.business.light : CATEGORY_COLORS.business.dark,
            "sport", isLight ? CATEGORY_COLORS.sport.light : CATEGORY_COLORS.sport.dark,
            "humor", isLight ? CATEGORY_COLORS.humor.light : CATEGORY_COLORS.humor.dark,
            "gastro", isLight ? CATEGORY_COLORS.gastro.light : CATEGORY_COLORS.gastro.dark,
            "family", isLight ? CATEGORY_COLORS.family.light : CATEGORY_COLORS.family.dark,
            "city", isLight ? CATEGORY_COLORS.city.light : CATEGORY_COLORS.city.dark,
            isLight ? CATEGORY_COLORS.default.light : CATEGORY_COLORS.default.dark
          ],
          "circle-stroke-opacity": 1,
        }}
      />

      {/* Некластеризованные точки - SVG Иконки категорий (увеличенные) */}
      <Layer
        id="event-icons"
        type="symbol"
        filter={["!", ["has", "point_count"]]}
        layout={{
          "icon-image": [
            "match",
            ["get", "category"],
            "music", "icon-music",
            "art", "icon-art",
            "education", "icon-education",
            "business", "icon-business",
            "sport", "icon-sport",
            "humor", "icon-humor",
            "gastro", "icon-gastro",
            "family", "icon-family",
            "city", "icon-city",
            "icon-default"
          ],
          "icon-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 0.6,
            15, 0.75,
            18, 0.9
          ],
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        }}
        paint={{
          "icon-opacity": 1,
        }}
      />

      {/* Некластеризованные точки - интерактивный слой для кликов (увеличенный) */}
      <Layer
        id="event-points"
        type="circle"
        filter={["!", ["has", "point_count"]]}
        paint={{
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 20,
            15, 26,
            18, 32
          ],
          "circle-color": "transparent",
          "circle-opacity": 0,
        }}
      />

      {/* Некластеризованные точки - стильные метки */}
      <Layer
        id="event-labels"
        type="symbol"
        filter={["!", ["has", "point_count"]]}
        layout={{
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 11,
            15, 13,
            18, 15
          ],
          "text-anchor": "top",
          "text-offset": [0, 1.8],
          "text-allow-overlap": false,
          "text-optional": true,
          "text-max-width": 10,
          "text-letter-spacing": 0.02,
        }}
        paint={{
          "text-color": [
            "match",
            ["get", "category"],
            "music", isLight ? CATEGORY_COLORS.music.stroke.light : CATEGORY_COLORS.music.dark,
            "art", isLight ? CATEGORY_COLORS.art.stroke.light : CATEGORY_COLORS.art.dark,
            "education", isLight ? CATEGORY_COLORS.education.stroke.light : CATEGORY_COLORS.education.dark,
            "business", isLight ? CATEGORY_COLORS.business.stroke.light : CATEGORY_COLORS.business.dark,
            "sport", isLight ? CATEGORY_COLORS.sport.stroke.light : CATEGORY_COLORS.sport.dark,
            "humor", isLight ? CATEGORY_COLORS.humor.stroke.light : CATEGORY_COLORS.humor.dark,
            "gastro", isLight ? CATEGORY_COLORS.gastro.stroke.light : CATEGORY_COLORS.gastro.dark,
            "family", isLight ? CATEGORY_COLORS.family.stroke.light : CATEGORY_COLORS.family.dark,
            "city", isLight ? CATEGORY_COLORS.city.stroke.light : CATEGORY_COLORS.city.dark,
            isLight ? CATEGORY_COLORS.default.stroke.light : CATEGORY_COLORS.default.dark
          ],
          "text-halo-color": isLight ? "rgba(255, 255, 255, 0.95)" : "rgba(0, 0, 0, 0.9)",
          "text-halo-width": 3,
          "text-halo-blur": 1.5,
          "text-opacity": 1,
        }}
      />
    </Source>
  );
}

// Кастомная функция сравнения для memo
function arePropsEqual(prevProps: EventMarkerProps, nextProps: EventMarkerProps) {
  // Проверяем isLight (примитив)
  if (prevProps.isLight !== nextProps.isLight) return false;
  
  // Проверяем mapRef (используем shallow comparison)
  if (prevProps.mapRef !== nextProps.mapRef) return false;
  
  // Проверяем eventGeoJSON по длине features и первому элементу (оптимизация)
  if (prevProps.eventGeoJSON.features.length !== nextProps.eventGeoJSON.features.length) {
    return false;
  }
  
  // Если длина одинаковая, считаем пропсы равными (eventGeoJSON не меняется часто)
  return true;
}

// Экспортируем мемоизированную версию компонента
export default memo(EventMarker, arePropsEqual);

