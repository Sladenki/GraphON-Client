"use client";

import { Source, Layer } from "react-map-gl/maplibre";

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
}

/**
 * Компонент для отображения маркеров событий на карте
 * Создает многослойные маркеры с цветовой категоризацией и улучшенными визуальными эффектами
 */
export default function EventMarker({ eventGeoJSON, isLight }: EventMarkerProps) {
  // Конфигурация цветов для категорий
  const categoryColors = {
    concert: { 
      light: "#8b5cf6", 
      dark: "#a78bfa", 
      stroke: { light: "#6d28d9", dark: "#c4b5fd" }, 
      glow: "rgba(139, 92, 246, 0.5)",
      pulseGlow: "rgba(139, 92, 246, 0.25)"
    },
    exhibit: { 
      light: "#06b6d4", 
      dark: "#22d3ee", 
      stroke: { light: "#0891b2", dark: "#67e8f9" }, 
      glow: "rgba(6, 182, 212, 0.5)",
      pulseGlow: "rgba(6, 182, 212, 0.25)"
    },
    lecture: { 
      light: "#22c55e", 
      dark: "#4ade80", 
      stroke: { light: "#16a34a", dark: "#86efac" }, 
      glow: "rgba(34, 197, 94, 0.5)",
      pulseGlow: "rgba(34, 197, 94, 0.25)"
    },
    festival: { 
      light: "#ec4899", 
      dark: "#f472b6", 
      stroke: { light: "#db2777", dark: "#f9a8d4" }, 
      glow: "rgba(236, 72, 153, 0.5)",
      pulseGlow: "rgba(236, 72, 153, 0.25)"
    },
    meetup: { 
      light: "#fb923c", 
      dark: "#fb923c", 
      stroke: { light: "#ea580c", dark: "#fdba74" }, 
      glow: "rgba(251, 146, 60, 0.5)",
      pulseGlow: "rgba(251, 146, 60, 0.25)"
    },
    default: { 
      light: "#3b82f6", 
      dark: "#60a5fa", 
      stroke: { light: "#1e40af", dark: "#93c5fd" }, 
      glow: "rgba(96, 165, 250, 0.5)",
      pulseGlow: "rgba(96, 165, 250, 0.25)"
    },
  };

  return (
    <Source id="events" type="geojson" data={eventGeoJSON}>
      {/* Внешнее пульсирующее кольцо (самое большое) */}
      <Layer
        id="event-pulse-outer"
        type="circle"
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
            "concert", categoryColors.concert.pulseGlow,
            "exhibit", categoryColors.exhibit.pulseGlow,
            "lecture", categoryColors.lecture.pulseGlow,
            "festival", categoryColors.festival.pulseGlow,
            "meetup", categoryColors.meetup.pulseGlow,
            categoryColors.default.pulseGlow
          ],
          "circle-opacity": isLight ? 0.3 : 0.4,
          "circle-blur": 1,
        }}
      />

      {/* Второй слой свечения (средний) */}
      <Layer
        id="event-glow-middle"
        type="circle"
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
            "concert", categoryColors.concert.glow,
            "exhibit", categoryColors.exhibit.glow,
            "lecture", categoryColors.lecture.glow,
            "festival", categoryColors.festival.glow,
            "meetup", categoryColors.meetup.glow,
            categoryColors.default.glow
          ],
          "circle-opacity": isLight ? 0.5 : 0.7,
          "circle-blur": 1.5,
        }}
      />

      {/* Основное свечение (близкое к маркеру) */}
      {!isLight && (
        <Layer
          id="event-glow"
          type="circle"
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
              "concert", categoryColors.concert.glow,
              "exhibit", categoryColors.exhibit.glow,
              "lecture", categoryColors.lecture.glow,
              "festival", categoryColors.festival.glow,
              "meetup", categoryColors.meetup.glow,
              categoryColors.default.glow
            ],
            "circle-opacity": 0.8,
            "circle-blur": 2,
          }}
        />
      )}

      {/* Внешнее кольцо маркера (темная обводка) */}
      <Layer
        id="event-ring-outer"
        type="circle"
        paint={{
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 11,
            15, 16,
            18, 21
          ],
          "circle-color": [
            "match",
            ["get", "category"],
            "concert", isLight ? categoryColors.concert.stroke.light : categoryColors.concert.stroke.dark,
            "exhibit", isLight ? categoryColors.exhibit.stroke.light : categoryColors.exhibit.stroke.dark,
            "lecture", isLight ? categoryColors.lecture.stroke.light : categoryColors.lecture.stroke.dark,
            "festival", isLight ? categoryColors.festival.stroke.light : categoryColors.festival.stroke.dark,
            "meetup", isLight ? categoryColors.meetup.stroke.light : categoryColors.meetup.stroke.dark,
            isLight ? categoryColors.default.stroke.light : categoryColors.default.stroke.dark
          ],
          "circle-opacity": 1,
        }}
      />

      {/* Основной цветной маркер */}
      <Layer
        id="event-points"
        type="circle"
        paint={{
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 9,
            15, 13,
            18, 17
          ],
          "circle-color": [
            "match",
            ["get", "category"],
            "concert", isLight ? categoryColors.concert.light : categoryColors.concert.dark,
            "exhibit", isLight ? categoryColors.exhibit.light : categoryColors.exhibit.dark,
            "lecture", isLight ? categoryColors.lecture.light : categoryColors.lecture.dark,
            "festival", isLight ? categoryColors.festival.light : categoryColors.festival.dark,
            "meetup", isLight ? categoryColors.meetup.light : categoryColors.meetup.dark,
            isLight ? categoryColors.default.light : categoryColors.default.dark
          ],
          "circle-opacity": 1,
        }}
      />

      {/* Внутреннее белое кольцо (создает эффект булавки) */}
      <Layer
        id="event-ring-inner"
        type="circle"
        paint={{
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 6,
            15, 8,
            18, 10
          ],
          "circle-color": "#ffffff",
          "circle-opacity": 1,
        }}
      />

      {/* Центральная точка */}
      <Layer
        id="event-center"
        type="circle"
        paint={{
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 3,
            15, 4,
            18, 5
          ],
          "circle-color": [
            "match",
            ["get", "category"],
            "concert", isLight ? categoryColors.concert.stroke.light : categoryColors.concert.light,
            "exhibit", isLight ? categoryColors.exhibit.stroke.light : categoryColors.exhibit.light,
            "lecture", isLight ? categoryColors.lecture.stroke.light : categoryColors.lecture.light,
            "festival", isLight ? categoryColors.festival.stroke.light : categoryColors.festival.light,
            "meetup", isLight ? categoryColors.meetup.stroke.light : categoryColors.meetup.light,
            isLight ? categoryColors.default.stroke.light : categoryColors.default.light
          ],
          "circle-opacity": 0.95,
        }}
      />

      {/* Текст с названием события */}
      <Layer
        id="event-labels"
        type="symbol"
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
            "concert", isLight ? categoryColors.concert.stroke.light : categoryColors.concert.dark,
            "exhibit", isLight ? categoryColors.exhibit.stroke.light : categoryColors.exhibit.dark,
            "lecture", isLight ? categoryColors.lecture.stroke.light : categoryColors.lecture.dark,
            "festival", isLight ? categoryColors.festival.stroke.light : categoryColors.festival.dark,
            "meetup", isLight ? categoryColors.meetup.stroke.light : categoryColors.meetup.dark,
            isLight ? categoryColors.default.stroke.light : categoryColors.default.dark
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


