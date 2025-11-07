"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo, useState, Suspense, useRef } from "react";
import { Filter, List } from "lucide-react";
import styles from "./page.module.scss";
import { mockEvents, type CityEvent } from "./mockEvents";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/providers/AuthProvider";
import { useImperativeEventLayers } from "./hooks/useImperativeEventLayers";
import { 
  type RoadType, 
  type FillType, 
  COLORS, 
  getLayerColor, 
  ROAD_STYLES, 
  FILL_STYLES, 
  HEAVY_ROAD_STYLES 
} from "./constants/mapStyles";
import { Protocol, PMTiles } from "pmtiles";

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

//

// Утилиты для работы с paint properties
const setPaintProperties = (map: any, layerId: string, properties: Record<string, any>) => {
  Object.entries(properties).forEach(([prop, value]) => {
    map.setPaintProperty(layerId, prop, value);
  });
};

// Создание интерполяции для зума
const createZoomInterpolation = (values: number[]) => [
  "interpolate", ["linear"], ["zoom"], 
  10, values[0], 12, values[1], 14, values[2], 16, values[3]
];

// Функция создания outline слоя
const createOutlineLayer = (baseLayer: any, id: string, paint: any) => {
  const def: any = {
    id, type: "line", source: baseLayer.source, layout: baseLayer.layout || {}, paint
  };
  if (baseLayer["source-layer"]) def["source-layer"] = baseLayer["source-layer"];
  if (baseLayer.filter) def.filter = baseLayer.filter;
  return def;
};

// Безопасное добавление outline слоя
const addOutlineIfNotExists = (map: any, layer: any, outlineId: string, paint: any) => {
  try {
    // Удаляем старый слой если существует
    if (map.getLayer(outlineId)) {
      try {
        map.removeLayer(outlineId);
      } catch (e) {
        // Игнорируем ошибку
      }
    }
    
    // Добавляем новый слой
    const outlineDef = createOutlineLayer(layer, outlineId, paint);
    
    // ВАЖНО: Ищем следующий слой после основного слоя дороги
    const allLayers = map.getStyle().layers;
    const currentIndex = allLayers.findIndex((l: any) => l.id === layer.id);
    
    if (currentIndex !== -1 && currentIndex + 1 < allLayers.length) {
      // Добавляем outline слой СРАЗУ ПОСЛЕ основного слоя
      const nextLayerId = allLayers[currentIndex + 1].id;
      map.addLayer(outlineDef, nextLayerId);
    } else {
      // Если не нашли следующий слой, добавляем в конец
      map.addLayer(outlineDef);
    }
  } catch (e) {
    // Игнорируем ошибки добавления outline
  }
};

// Функции классификации слоев
const classifyRoad = (id: string): RoadType => {
  const s = id.toLowerCase();
  // ВАЖНО: проверяем "major" и "road-major" в первую очередь!
  if (s.includes("major") || s.includes("motorway") || s.includes("highway") || s.includes("primary") || s.includes("main") || s.includes("trunk")) return "major";
  if (s.includes("secondary") || s.includes("street") || s.includes("road") || s.includes("tertiary")) return "secondary";
  return "minor";
};

const classifyFill = (id: string): FillType => {
  const s = id.toLowerCase();
  if (s.includes("admin") || s.includes("boundary")) return "admin";
  if (s.includes("water") || s.includes("marine") || s.includes("river")) return "water";
  if (s.includes("park") || s.includes("garden") || s.includes("forest") || s.includes("grass")) return "park";
  return "land";
};

// Создание локального стиля карты для PMTiles
const createLocalMapStyle = (isLight: boolean) => ({
  version: 8 as const,
  sources: {
    "local-tiles": {
      type: "vector" as const,
      url: "pmtiles:///tiles/kaliningrad.pmtiles",
      attribution: "© OpenStreetMap contributors"
    }
  },
  // Используем бесплатный источник шрифтов от Mapbox
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
    }
  ]
});


// ===== КОМПОНЕНТ =====

export default function CyberCityFour() {
  const [isLight, setIsLight] = useState(false);
  const [mapRef, setMapRef] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isLoggedIn } = useAuth();
  
  // Состояние для фильтра
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  
  // Состояние для выбранного события (для popup)
  const [selectedEvent, setSelectedEvent] = useState<CityEvent | null>(null);
  // Отслеживаем откуда был открыт EventPopup (для навигации назад)
  const [eventOpenedFromList, setEventOpenedFromList] = useState(false);
  
  // Преобразование mockEvents в GeoJSON для WebGL-слоя
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
  
  // Обработчик клика по карте для открытия popup
  const handleMapClick = useCallback((event: any) => {
    if (!mapRef || !event.features || event.features.length === 0) {
      setSelectedEvent(null);
      return;
    }
    
    const feature = event.features[0];
    
    // Обработка клика по кластеру - увеличиваем масштаб
    if (feature.layer.id === 'clusters') {
      const clusterId = feature.properties.cluster_id;
      const source = mapRef.getSource('events');
      
      if (source && source.getClusterExpansionZoom) {
        source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err) return;
          
          mapRef.easeTo({
            center: feature.geometry.coordinates,
            zoom: zoom,
            duration: 500
          });
        });
      }
      setSelectedEvent(null);
      return;
    }
    
    // Обработка клика по отдельному событию
    if (feature.layer.id === 'event-points') {
      const eventId = feature.properties.id;
      const clickedEvent = mockEvents.find(ev => ev.id === eventId);
      if (clickedEvent) {
        setSelectedEvent(clickedEvent);
        setEventOpenedFromList(false); // Открыто с карты
      }
    } else {
      setSelectedEvent(null);
    }
  }, [mapRef]);

  // ===== МЕМОИЗИРОВАННЫЕ ФУНКЦИИ СТИЛИЗАЦИИ =====
  
  const applyLineStyles = useCallback((map: any, layer: any, isLight: boolean) => {
  const roadType = classifyRoad(layer.id);
  const color = getLayerColor(layer.id, isLight);
  const style = ROAD_STYLES[roadType];
  
  // Применяем основные стили дороги
  setPaintProperties(map, layer.id, {
    "line-color": color,
    "line-opacity": createZoomInterpolation(isLight ? style.opacity.light : style.opacity.dark),
    "line-width": createZoomInterpolation(style.width),
    "line-blur": isLight ? style.blur.light : style.blur.dark
  });

  // Неоновый эффект для главных дорог
  if (layer.source && roadType === "major") {
    if (isLight) {
      // Мягкое свечение для светлой темы
      addOutlineIfNotExists(map, layer, `${layer.id}-neon-glow`, {
        "line-color": color,
        "line-opacity": createZoomInterpolation([0.10, 0.16, 0.22, 0.30]),
        "line-width": createZoomInterpolation([1.8, 3.0, 4.5, 6.5]),
        "line-blur": 1.8
      });
    } else {
      // Яркое свечение для темной темы
      addOutlineIfNotExists(map, layer, `${layer.id}-neon-glow`, {
        "line-color": color,
        "line-opacity": createZoomInterpolation([0.08, 0.14, 0.22, 0.30]),
        "line-width": createZoomInterpolation([1.6, 2.6, 4.2, 6.0]),
        "line-blur": 1.4
      });
    }
  }
  }, []); // Пустые зависимости, так как функция не зависит от состояния

  const applyFillStyles = useCallback((map: any, layer: any, isLight: boolean) => {
  const fillType = classifyFill(layer.id);
  const style = FILL_STYLES[fillType];
  
  switch (fillType) {
    case "admin":
      setPaintProperties(map, layer.id, { "fill-opacity": style.opacity });
      addOutlineIfNotExists(map, layer, `${layer.id}-glow-outline`, {
        "line-color": isLight ? COLORS.light.boundary : COLORS.dark.boundary,
        "line-opacity": style.outline.opacity,
        "line-width": style.outline.width,
        "line-blur": style.outline.blur
      });
      break;
      
    case "water":
      setPaintProperties(map, layer.id, {
        "fill-opacity": isLight ? style.opacity.light : style.opacity.dark,
        "fill-color": isLight ? COLORS.light.water : COLORS.dark.water
      });
      addOutlineIfNotExists(map, layer, `${layer.id}-outline`, {
        "line-color": isLight ? COLORS.light.waterOutline : COLORS.dark.waterOutline,
        "line-opacity": isLight ? style.outline.opacity.light : style.outline.opacity.dark,
        "line-width": style.outline.width
      });
      break;
      
    case "park":
      setPaintProperties(map, layer.id, {
        "fill-opacity": isLight ? style.opacity.light : style.opacity.dark,
        "fill-color": isLight ? COLORS.light.park : COLORS.dark.park
      });
      addOutlineIfNotExists(map, layer, `${layer.id}-outline`, {
        "line-color": isLight ? COLORS.light.parkOutline : COLORS.dark.parkOutline,
        "line-opacity": style.outline.opacity,
        "line-width": isLight ? style.outline.width.light : style.outline.width.dark
      });
      break;
      
    case "land":
      if (!isLight && style.opacity.dark && style.color.dark) {
        setPaintProperties(map, layer.id, {
          "fill-opacity": style.opacity.dark,
          "fill-color": style.color.dark
        });
      }
      break;
  }
  }, []); // Пустые зависимости, так как функция не зависит от состояния

  // Состояния для разных размеров экрана
  const [isVerySmallScreen, setIsVerySmallScreen] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const debouncedViewport = useDebounce(viewport, 300);

  // Единый эффект адаптивности экрана с дебаунсом
  useEffect(() => {
    const update = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    update();
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const { width, height } = debouncedViewport;
    setIsVerySmallScreen(width <= 350 || (width <= 380 && height <= 700));
    setIsMobile(
      width <= 400 ||
      (width <= 480 && height <= 800) ||
      width <= 350
    );
  }, [debouncedViewport]);

  // Локальная блокировка скролла для мобильных без глобальных стилей
  useEffect(() => {
    if (typeof window === "undefined") return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    if (isMobile) {
      body.style.overflow = "hidden";
    } else {
      body.style.overflow = prevOverflow || "";
    }
    return () => {
      body.style.overflow = prevOverflow;
    };
  }, [isMobile]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const readDomTheme = (): "light" | "dark" | null => {
      const el = document.documentElement;
      const attr = (el.getAttribute("data-theme") || "").toLowerCase();
      if (attr === "light") return "light";
      if (attr === "dark") return "dark";
      if (el.classList.contains("dark") || el.classList.contains("theme-dark")) return "dark";
      if (el.classList.contains("light") || el.classList.contains("theme-light")) return "light";
      return null;
    };
    const apply = () => {
      const dom = readDomTheme();
      if (dom) { setIsLight(dom === "light"); return; }
      setIsLight(media.matches);
    };
    apply();
    media.addEventListener("change", apply);
    const obs = new MutationObserver(apply);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => { media.removeEventListener("change", apply); obs.disconnect(); };
  }, []);

  // Инициализация PMTiles протокола
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    let protocol: Protocol | null = null;
    
    const initProtocol = async () => {
      try {
        // Динамически импортируем maplibre
        const maplibregl = (await import('maplibre-gl')).default;
        
        // Создаём PMTiles источник
        const pmtiles = new PMTiles('/tiles/kaliningrad.pmtiles');
        
        // Создаём экземпляр протокола и добавляем источник
        protocol = new Protocol();
        protocol.add(pmtiles);
        
        // Проверяем, не зарегистрирован ли уже протокол
        try {
          (maplibregl as any).removeProtocol?.('pmtiles');
        } catch (e) {
          // Игнорируем если протокол не был зарегистрирован
        }
        
        // Регистрируем протокол
        (maplibregl as any).addProtocol('pmtiles', (request: any, callback: any) => {
          return protocol!.tile(request, callback);
        });
        
        console.log('PMTiles протокол успешно зарегистрирован');
      } catch (e) {
        console.error("Ошибка при регистрации PMTiles протокола:", e);
      }
    };
    
    initProtocol();
    
    return () => {
      const cleanup = async () => {
        try {
          const maplibregl = (await import('maplibre-gl')).default;
          (maplibregl as any).removeProtocol?.('pmtiles');
        } catch (e) {
          // Игнорируем ошибки при очистке
        }
      };
      cleanup();
    };
  }, []);

  const mapStyle = useMemo(() => {
    try {
      const style = createLocalMapStyle(isLight);
      return style as any;
    } catch (error) {
      console.error('❌ Ошибка при создании mapStyle:', error);
      return null;
    }
  }, [isLight]);
  
  // Используем императивное добавление событий вместо декларативных <Source> и <Layer>
  // Этот хук сам загружает иконки и добавляет все слои
  useImperativeEventLayers(mapRef, eventGeoJSON, isLight, mapLoaded);

  // Мемоизированная функция для принудительного обновления стилей дорог (делает дороги толще)
  const updateRoadStyles = useCallback(() => {
    if (!mapRef) return;
    
    try {
      const layers = mapRef.getStyle()?.layers || [];
      
      layers.forEach((layer: any) => {
        if (layer.type === "line") {
          const roadType = classifyRoad(layer.id);
          const sid = layer.id.toLowerCase();
          
          // Более точная классификация для специальных случаев
          let style = HEAVY_ROAD_STYLES[roadType];
          if (roadType === "minor" && (sid.includes("residential") || sid.includes("service") || sid.includes("unclassified"))) {
            style = HEAVY_ROAD_STYLES.minor;
          } else if (roadType === "minor") {
            // Для остальных мелких дорог используем default стиль
            style = HEAVY_ROAD_STYLES.default;
          }
          
          setPaintProperties(mapRef, layer.id, {
            "line-opacity": isLight ? style.opacity.light : style.opacity.dark,
            "line-width": createZoomInterpolation(style.width),
            "line-blur": isLight ? style.blur.light : style.blur.dark
          });
        }
      });
    } catch (e) {
      console.error("Ошибка при обновлении стилей дорог:", e);
    }
  }, [mapRef, isLight]); // Зависит от mapRef и isLight

  // Мемоизированный обработчик загрузки карты
  const handleMapLoad = useCallback((e: any) => {
    const map = e?.target; 
    if (!map) return;
    setMapRef(map);
    setMapLoaded(true);
    
    try {
      // Применяем неоновые эффекты дорог сразу после загрузки
      const layers = map.getStyle()?.layers || [];
      layers.forEach((layer: any) => {
        if (layer.type === "line") {
          applyLineStyles(map, layer, isLight);
        } else if (layer.type === "fill" && layer.source) {
          applyFillStyles(map, layer, isLight);
        }
      });
    } catch (e) {
      // Игнорируем ошибки стилизации
    }
  }, [applyLineStyles, applyFillStyles, isLight]);

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
  
  // Приближение камеры к выбранному событию
  useEffect(() => {
    if (!mapRef || !selectedEvent) return;
    
    // Анимированное перемещение камеры к событию
    mapRef.flyTo({
      center: [selectedEvent.lng, selectedEvent.lat],
      zoom: 16, // Увеличенный зум для детального просмотра
      duration: 1500, // Длительность анимации в мс
      essential: true, // Анимация будет выполнена даже если prefers-reduced-motion
      pitch: 45, // Угол наклона камеры
      bearing: mapRef.getBearing() // Сохраняем текущий поворот
    });
  }, [selectedEvent, mapRef]);

  // Эффект для обновления стилей карты при изменении темы
  // КРИТИЧНО: НЕ вызываем setStyle() - это удаляет events source!
  const prevIsLightRef = useRef<boolean | null>(null);
  
  useEffect(() => {
    if (!mapRef || !mapLoaded) return;
    
    // При первой загрузке просто сохраняем тему
    if (prevIsLightRef.current === null) {
      prevIsLightRef.current = isLight;
      return;
    }
    
    // Проверяем изменение темы
    if (prevIsLightRef.current === isLight) {
      return; // Тема не изменилась
    }
    
    prevIsLightRef.current = isLight;
    
    // ВАЖНО: НЕ используем setStyle() - он удаляет все динамические источники!
    // Вместо этого обновляем только цвета слоев
    try {
      // Обновляем фон
      if (mapRef.getLayer('background')) {
        mapRef.setPaintProperty('background', 'background-color', isLight ? '#f8f8f8' : '#1a1d23');
      }
      
      // Обновляем все слои дорог и fill
      const layers = mapRef.getStyle()?.layers || [];
      layers.forEach((layer: any) => {
        try {
          if (layer.type === "line" && layer.source === "local-tiles") {
            applyLineStyles(mapRef, layer, isLight);
          } else if (layer.type === "fill" && layer.source === "local-tiles") {
            applyFillStyles(mapRef, layer, isLight);
          }
        } catch (e) {
          // Игнорируем ошибки отдельных слоев
        }
      });
    } catch (e) {
      // Игнорируем ошибки обновления цветов
    }
  }, [mapRef, mapLoaded, isLight, applyFillStyles, applyLineStyles]);

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
            onLoad={handleMapLoad}
            onClick={handleMapClick}
            interactiveLayerIds={mapLoaded ? ['event-points', 'clusters'] : []}
            cursor="pointer"
          >
            {/* Маркеры событий добавляются императивно через useImperativeEventLayers */}
            {/* EventMarker больше не используется - декларативный подход не работает с PMTiles */}
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


