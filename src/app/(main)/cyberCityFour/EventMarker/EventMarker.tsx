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
 * Создает многослойные маркеры с цветовой категоризацией и свечением
 */
export default function EventMarker({ eventGeoJSON, isLight }: EventMarkerProps) {
  // Конфигурация цветов для категорий
  const categoryColors = {
    concert: { light: "#8b5cf6", dark: "#a78bfa", stroke: { light: "#6d28d9", dark: "#c4b5fd" }, glow: "rgba(139, 92, 246, 0.3)" },
    exhibit: { light: "#06b6d4", dark: "#22d3ee", stroke: { light: "#0891b2", dark: "#67e8f9" }, glow: "rgba(6, 182, 212, 0.3)" },
    lecture: { light: "#22c55e", dark: "#4ade80", stroke: { light: "#16a34a", dark: "#86efac" }, glow: "rgba(34, 197, 94, 0.3)" },
    festival: { light: "#ec4899", dark: "#f472b6", stroke: { light: "#db2777", dark: "#f9a8d4" }, glow: "rgba(236, 72, 153, 0.3)" },
    meetup: { light: "#fb923c", dark: "#fb923c", stroke: { light: "#ea580c", dark: "#fdba74" }, glow: "rgba(251, 146, 60, 0.3)" },
    default: { light: "#3b82f6", dark: "#60a5fa", stroke: { light: "#1e40af", dark: "#93c5fd" }, glow: "rgba(96, 165, 250, 0.3)" },
  };

  return (
    <Source id="events" type="geojson" data={eventGeoJSON}>
      {/* Внешний слой свечения для темной темы */}
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
              15, 16,
              18, 20
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
            "circle-opacity": 0.6,
            "circle-blur": 2,
          }}
        />
      )}

      {/* Основной маркер */}
      <Layer
        id="event-points"
        type="circle"
        paint={{
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 10,
            15, 14,
            18, 18
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
          "circle-stroke-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 2,
            15, 3,
            18, 4
          ],
          "circle-stroke-color": [
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

      {/* Внутренний белый центр */}
      <Layer
        id="event-center"
        type="circle"
        paint={{
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10, 4,
            15, 5,
            18, 6
          ],
          "circle-color": "#ffffff",
          "circle-opacity": 0.9,
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
            10, 11,
            15, 13,
            18, 15
          ],
          "text-anchor": "top",
          "text-offset": [0, 2.2],
          "text-allow-overlap": false,
          "text-optional": true,
        }}
        paint={{
          "text-color": isLight ? "#1e293b" : "#ffffff",
          "text-halo-color": isLight ? "#ffffff" : "#000000",
          "text-halo-width": 2,
          "text-halo-blur": 1.5,
        }}
      />
    </Source>
  );
}

