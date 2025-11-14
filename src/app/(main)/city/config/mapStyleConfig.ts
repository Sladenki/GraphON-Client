/**
 * Конфигурация стилей карты для PMTiles
 * Определяет базовые слои карты и их стили
 */

import { COLORS } from "../constants/mapStyles";
import { createZoomInterpolation } from "../utils/mapHelpers";

/**
 * Создать полный стиль карты для MapLibre GL
 * @param isLight - светлая тема или темная
 * @returns Объект стиля карты в формате MapLibre Style Spec
 */
export const createLocalMapStyle = (isLight: boolean) => ({
  version: 8 as const,
  sources: {
    "local-tiles": {
      type: "vector" as const,
      url: "pmtiles:///tiles/kaliningrad.pmtiles",
      attribution: "© OpenStreetMap contributors"
    }
  },
  // Используем бесплатный источник шрифтов от MapLibre
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  layers: [
    // Фон - более светлый серый для лучшей читаемости
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": isLight ? "#f8f8f8" : "#1a1d23"
      }
    },
    // Земля/районы - добавляем серые тона
    {
      id: "landuse",
      type: "fill",
      source: "local-tiles",
      "source-layer": "landuse",
      paint: {
        "fill-color": isLight ? "#e8e8e8" : "#2a2d35",
        "fill-opacity": isLight ? 0.3 : 0.4
      }
    },
    // Вода - улучшенная с градиентом и анимацией
    {
      id: "water",
      type: "fill",
      source: "local-tiles",
      "source-layer": "water",
      paint: {
        "fill-color": isLight ? COLORS.light.water : COLORS.dark.water,
        "fill-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10, isLight ? 0.6 : 0.4,
          14, isLight ? 0.75 : 0.5,
          18, isLight ? 0.85 : 0.6
        ]
      }
    },
    // Обводка воды для depth эффекта
    {
      id: "water-outline",
      type: "line",
      source: "local-tiles",
      "source-layer": "water",
      paint: {
        "line-color": isLight ? COLORS.light.waterOutline : COLORS.dark.waterOutline,
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10, 0.5,
          14, 1,
          18, 1.5
        ],
        "line-opacity": isLight ? 0.6 : 0.8
      }
    },
    // Парки и зеленые зоны - улучшенные с обводкой
    {
      id: "landuse-park",
      type: "fill",
      source: "local-tiles",
      "source-layer": "landuse",
      filter: ["in", "class", "park", "garden", "forest", "wood"],
      paint: {
        "fill-color": isLight ? COLORS.light.park : COLORS.dark.park,
        "fill-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10, isLight ? 0.3 : 0.2,
          14, isLight ? 0.5 : 0.3,
          18, isLight ? 0.6 : 0.4
        ]
      }
    },
    // Обводка парков для depth
    {
      id: "landuse-park-outline",
      type: "line",
      source: "local-tiles",
      "source-layer": "landuse",
      filter: ["in", "class", "park", "garden", "forest", "wood"],
      paint: {
        "line-color": isLight ? COLORS.light.parkOutline : COLORS.dark.parkOutline,
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10, 0.3,
          14, 0.5,
          18, 0.8
        ],
        "line-opacity": 0.5
      }
    },
    // Здания - с улучшенной визуализацией и depth
    {
      id: "building",
      type: "fill",
      source: "local-tiles",
      "source-layer": "building",
      minzoom: 14,
      paint: {
        "fill-color": isLight ? "#d9d9d9" : "#3a3f4a",
        "fill-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          14, isLight ? 0.5 : 0.4,
          16, isLight ? 0.7 : 0.6,
          18, isLight ? 0.85 : 0.75
        ],
        "fill-outline-color": isLight ? "#bfbfbf" : "#4a4f5a"
      }
    },
    // Обводка зданий для 3D эффекта
    {
      id: "building-outline",
      type: "line",
      source: "local-tiles",
      "source-layer": "building",
      minzoom: 15,
      paint: {
        "line-color": isLight ? "#a0a0a0" : "#5a5f6a",
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15, 0.3,
          17, 0.5,
          19, 0.8
        ],
        "line-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15, 0.3,
          17, 0.5,
          19, 0.7
        ]
      }
    },
    // Дороги - мелкие (более заметные)
    {
      id: "road-minor",
      type: "line",
      source: "local-tiles",
      "source-layer": "transportation",
      filter: ["in", "class", "minor", "service", "track"],
      paint: {
        "line-color": isLight ? "#e0e0e0" : "#3a3f4a",
        "line-width": createZoomInterpolation([0.5, 1, 1.5, 2]),
        "line-opacity": isLight ? 0.6 : 0.4
      }
    },
    // Дороги - вторичные (более заметные)
    {
      id: "road-secondary",
      type: "line",
      source: "local-tiles",
      "source-layer": "transportation",
      filter: ["in", "class", "secondary", "tertiary"],
      paint: {
        "line-color": isLight ? "#d0d0d0" : "#4a4f5a",
        "line-width": createZoomInterpolation([1, 2, 3, 4]),
        "line-opacity": isLight ? 0.7 : 0.5
      }
    },
    // Дороги - основные (базовые цвета на сером фоне, неон применяется позже)
    {
      id: "road-major",
      type: "line",
      source: "local-tiles",
      "source-layer": "transportation",
      filter: ["in", "class", "primary", "motorway", "trunk"],
      paint: {
        "line-color": isLight ? "#c0c0c0" : "#5a5f6a",
        "line-width": createZoomInterpolation([1.5, 3, 5, 7]),
        "line-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10, isLight ? 0.6 : 0.4,
          14, isLight ? 0.8 : 0.6,
          18, isLight ? 0.9 : 0.75
        ]
      }
    },
    // Названия основных дорог
    {
      id: "road-label-major",
      type: "symbol",
      source: "local-tiles",
      "source-layer": "transportation_name",
      filter: ["in", "class", "primary", "motorway", "trunk"],
      minzoom: 13,
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Noto Sans Regular"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          13, 11,
          16, 14,
          18, 16
        ],
        "symbol-placement": "line",
        "text-rotation-alignment": "map",
        "text-pitch-alignment": "viewport",
        "text-max-angle": 30
      },
      paint: {
        "text-color": isLight ? "#2c3e50" : "#e0e0e0",
        "text-halo-color": isLight ? "#ffffff" : "#1a1d23",
        "text-halo-width": 2,
        "text-halo-blur": 1,
        "text-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          13, 0.7,
          15, 0.9,
          18, 1
        ]
      }
    },
    // Названия второстепенных дорог
    {
      id: "road-label-secondary",
      type: "symbol",
      source: "local-tiles",
      "source-layer": "transportation_name",
      filter: ["in", "class", "secondary", "tertiary"],
      minzoom: 14,
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Noto Sans Regular"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          14, 10,
          16, 12,
          18, 14
        ],
        "symbol-placement": "line",
        "text-rotation-alignment": "map",
        "text-pitch-alignment": "viewport",
        "text-max-angle": 30
      },
      paint: {
        "text-color": isLight ? "#4a5568" : "#cbd5e0",
        "text-halo-color": isLight ? "#ffffff" : "#1a1d23",
        "text-halo-width": 1.5,
        "text-halo-blur": 0.8,
        "text-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          14, 0.6,
          16, 0.8,
          18, 1
        ]
      }
    },
    // Названия мелких дорог
    {
      id: "road-label-minor",
      type: "symbol",
      source: "local-tiles",
      "source-layer": "transportation_name",
      filter: ["in", "class", "minor", "service"],
      minzoom: 15,
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Noto Sans Regular"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15, 9,
          17, 11,
          19, 13
        ],
        "symbol-placement": "line",
        "text-rotation-alignment": "map",
        "text-pitch-alignment": "viewport",
        "text-max-angle": 30
      },
      paint: {
        "text-color": isLight ? "#718096" : "#a0aec0",
        "text-halo-color": isLight ? "#ffffff" : "#1a1d23",
        "text-halo-width": 1.2,
        "text-halo-blur": 0.6,
        "text-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15, 0.5,
          17, 0.7,
          19, 0.9
        ]
      }
    },
    // Названия районов и важных мест
    {
      id: "place-label",
      type: "symbol",
      source: "local-tiles",
      "source-layer": "place",
      filter: ["in", "class", "neighbourhood", "suburb"],
      minzoom: 12,
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Noto Sans Bold"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          12, 12,
          14, 14,
          16, 16
        ],
        "text-transform": "uppercase",
        "text-letter-spacing": 0.1,
        "text-max-width": 10
      },
      paint: {
        "text-color": isLight ? "#1a202c" : "#f7fafc",
        "text-halo-color": isLight ? "#ffffff" : "#1a1d23",
        "text-halo-width": 2.5,
        "text-halo-blur": 1.5,
        "text-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          12, 0.4,
          14, 0.6,
          16, 0.8
        ]
      }
    }
  ]
});

