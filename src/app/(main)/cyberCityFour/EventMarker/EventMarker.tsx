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
      {/* Кластеры - внешнее свечение */}
      <Layer
        id="clusters-glow"
        type="circle"
        filter={["has", "point_count"]}
        paint={{
          "circle-radius": [
            "step",
            ["get", "point_count"],
            25, // 1-10 событий
            10, 35, // 10-50 событий
            50, 45, // 50+ событий
          ],
          "circle-color": "#6a57e8",
          "circle-opacity": 0.2,
          "circle-blur": 1,
        }}
      />

      {/* Кластеры - основной круг */}
      <Layer
        id="clusters"
        type="circle"
        filter={["has", "point_count"]}
        paint={{
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20, // 1-10 событий
            10, 28, // 10-50 событий
            50, 36, // 50+ событий
          ],
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#6a57e8", // 1-10 событий
            10, "#8b7aef", // 10-50 событий
            50, "#a78bfa", // 50+ событий
          ],
          "circle-opacity": 0.9,
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-opacity": 0.8,
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
          "text-size": 14,
          "text-allow-overlap": true,
        }}
        paint={{
          "text-color": "#ffffff",
          "text-halo-color": "rgba(0, 0, 0, 0.2)",
          "text-halo-width": 1,
        }}
      />

      {/* Некластеризованные точки - внешнее пульсирующее кольцо (самое большое) */}
      <Layer
        id="event-pulse-outer"
        type="circle"
        filter={["!", ["has", "point_count"]]}
        paint={{
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 20,
            15, 28,
            18, 36
          ],
          "circle-color": [
            "match",
            ["get", "category"],
            "concert", CATEGORY_COLORS.concert.pulseGlow,
            "exhibit", CATEGORY_COLORS.exhibit.pulseGlow,
            "lecture", CATEGORY_COLORS.lecture.pulseGlow,
            "festival", CATEGORY_COLORS.festival.pulseGlow,
            "meetup", CATEGORY_COLORS.meetup.pulseGlow,
            CATEGORY_COLORS.default.pulseGlow
          ],
          "circle-opacity": isLight ? 0.3 : 0.4,
          "circle-blur": 1,
        }}
      />

      {/* Некластеризованные точки - второй слой свечения (средний) */}
      <Layer
        id="event-glow-middle"
        type="circle"
        filter={["!", ["has", "point_count"]]}
        paint={{
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 14,
            15, 20,
            18, 26
          ],
          "circle-color": [
            "match",
            ["get", "category"],
            "concert", CATEGORY_COLORS.concert.glow,
            "exhibit", CATEGORY_COLORS.exhibit.glow,
            "lecture", CATEGORY_COLORS.lecture.glow,
            "festival", CATEGORY_COLORS.festival.glow,
            "meetup", CATEGORY_COLORS.meetup.glow,
            CATEGORY_COLORS.default.glow
          ],
          "circle-opacity": isLight ? 0.5 : 0.7,
          "circle-blur": 1.5,
        }}
      />

      {/* Некластеризованные точки - основное свечение (близкое к маркеру) */}
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
              10, 12,
              15, 17,
              18, 22
            ],
            "circle-color": [
              "match",
              ["get", "category"],
              "concert", CATEGORY_COLORS.concert.glow,
              "exhibit", CATEGORY_COLORS.exhibit.glow,
              "lecture", CATEGORY_COLORS.lecture.glow,
              "festival", CATEGORY_COLORS.festival.glow,
              "meetup", CATEGORY_COLORS.meetup.glow,
              CATEGORY_COLORS.default.glow
            ],
            "circle-opacity": 0.8,
            "circle-blur": 2,
          }}
        />
      )}

      {/* Некластеризованные точки - цветная обводка вокруг иконки */}
      <Layer
        id="event-border-circle"
        type="circle"
        filter={["!", ["has", "point_count"]]}
        paint={{
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 11,
            15, 15,
            18, 19
          ],
          "circle-color": "#ffffff",
          "circle-opacity": 0.3,
          "circle-stroke-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 3,
            15, 4,
            18, 5
          ],
          "circle-stroke-color": [
            "match",
            ["get", "category"],
            "concert", isLight ? CATEGORY_COLORS.concert.light : CATEGORY_COLORS.concert.dark,
            "exhibit", isLight ? CATEGORY_COLORS.exhibit.light : CATEGORY_COLORS.exhibit.dark,
            "lecture", isLight ? CATEGORY_COLORS.lecture.light : CATEGORY_COLORS.lecture.dark,
            "festival", isLight ? CATEGORY_COLORS.festival.light : CATEGORY_COLORS.festival.dark,
            "meetup", isLight ? CATEGORY_COLORS.meetup.light : CATEGORY_COLORS.meetup.dark,
            isLight ? CATEGORY_COLORS.default.light : CATEGORY_COLORS.default.dark
          ],
          "circle-stroke-opacity": 1,
        }}
      />

      {/* Некластеризованные точки - SVG Иконки категорий (рендерятся ПОВЕРХ белого круга) */}
      <Layer
        id="event-icons"
        type="symbol"
        filter={["!", ["has", "point_count"]]}
        layout={{
          "icon-image": [
            "match",
            ["get", "category"],
            "concert", "icon-concert",
            "exhibit", "icon-exhibit",
            "lecture", "icon-lecture",
            "festival", "icon-festival",
            "meetup", "icon-meetup",
            "icon-default"
          ],
          "icon-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 0.5,
            15, 0.65,
            18, 0.8
          ],
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        }}
        paint={{
          "icon-opacity": 1,
        }}
      />

      {/* Некластеризованные точки - интерактивный слой для кликов (невидимый круг) */}
      <Layer
        id="event-points"
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
          "circle-color": "transparent",
          "circle-opacity": 0,
        }}
      />

      {/* Некластеризованные точки - текст с названием события */}
      <Layer
        id="event-labels"
        type="symbol"
        filter={["!", ["has", "point_count"]]}
        layout={{
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 10,
            15, 12,
            18, 14
          ],
          "text-anchor": "top",
          "text-offset": [0, 2.5],
          "text-allow-overlap": false,
          "text-optional": true,
          "text-max-width": 8,
        }}
        paint={{
          "text-color": [
            "match",
            ["get", "category"],
            "concert", isLight ? CATEGORY_COLORS.concert.stroke.light : CATEGORY_COLORS.concert.dark,
            "exhibit", isLight ? CATEGORY_COLORS.exhibit.stroke.light : CATEGORY_COLORS.exhibit.dark,
            "lecture", isLight ? CATEGORY_COLORS.lecture.stroke.light : CATEGORY_COLORS.lecture.dark,
            "festival", isLight ? CATEGORY_COLORS.festival.stroke.light : CATEGORY_COLORS.festival.dark,
            "meetup", isLight ? CATEGORY_COLORS.meetup.stroke.light : CATEGORY_COLORS.meetup.dark,
            isLight ? CATEGORY_COLORS.default.stroke.light : CATEGORY_COLORS.default.dark
          ],
          "text-halo-color": isLight ? "#ffffff" : "#000000",
          "text-halo-width": 2.5,
          "text-halo-blur": 1,
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

