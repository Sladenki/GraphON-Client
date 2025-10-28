"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import styles from "./page.module.scss";
import EventFilter from "./EventFilter/EventFilter";

const ReactMapGL = dynamic(() => import("react-map-gl/maplibre").then(m => m.Map), { ssr: false });

// Константы цветов
const COLORS = {
  light: {
    major: "#3f4a55",
    secondary: "#87909a",
    minor: "#9aa4ae",
    water: "#a0b3c8",
    waterOutline: "#7a9aba",
    park: "#a8c29a",
    parkOutline: "#7ba07a",
    boundary: "#94a3b8"
  },
  dark: {
    motorway: "#00eaff",
    highway: "#00eaff",
    primary: "#ff5cf4",
    main: "#ff5cf4",
    secondary: "#a47cff",
    street: "#a47cff",
    road: "#a47cff",
    minor: "#3effc3",
    water: "#1a2a3f",
    waterOutline: "#2a4a6f",
    park: "#3a6a5a",
    parkOutline: "#4a8a6a",
    boundary: "#3a4a5a"
  }
};

// Функция получения цвета
const getLayerColor = (id: string, isLight: boolean) => {
  const s = id.toLowerCase();
  if (isLight) {
    if (s.includes("motorway") || s.includes("highway") || s.includes("primary") || s.includes("main")) return COLORS.light.major;
    if (s.includes("secondary") || s.includes("street") || s.includes("road")) return COLORS.light.secondary;
    return COLORS.light.minor;
  }
  if (s.includes("motorway") || s.includes("highway")) return COLORS.dark.motorway;
  if (s.includes("primary") || s.includes("main")) return COLORS.dark.primary;
  if (s.includes("secondary") || s.includes("street") || s.includes("road")) return COLORS.dark.secondary;
  return COLORS.dark.minor;
};

// Типы для лучшей типизации
type RoadType = "major" | "secondary" | "minor";
type FillType = "admin" | "water" | "park" | "land";

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
  if (!map.getLayer(outlineId)) {
    try {
      const outlineDef = createOutlineLayer(layer, outlineId, paint);
      map.addLayer(outlineDef);
    } catch {}
  }
};

// Функции классификации слоев
const classifyRoad = (id: string): RoadType => {
  const s = id.toLowerCase();
  if (s.includes("motorway") || s.includes("highway") || s.includes("primary") || s.includes("main") || s.includes("trunk")) return "major";
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

// Константы стилей дорог
const ROAD_STYLES = {
  major: {
    opacity: { light: [0.5, 0.7, 0.85, 0.95], dark: [0.45, 0.65, 0.85, 1.0] },
    width: [1.0, 2.0, 3.2, 5.0],
    blur: { light: 0.15, dark: 0.4 }
  },
  secondary: {
    opacity: { light: [0.25, 0.35, 0.45, 0.55], dark: [0.20, 0.30, 0.45, 0.60] },
    width: [0.3, 0.6, 1.0, 1.6],
    blur: { light: 0.1, dark: 0.2 }
  },
  minor: {
    opacity: { light: [0.12, 0.18, 0.25, 0.30], dark: [0.10, 0.15, 0.22, 0.30] },
    width: [0.2, 0.4, 0.6, 1.0],
    blur: { light: 0.05, dark: 0.1 }
  }
};

// Константы стилей для fill слоев (убираем строгую типизацию для гибкости)
const FILL_STYLES: any = {
  admin: {
    opacity: 0.05,
    outline: { opacity: 0.2, width: 1, blur: 2 }
  },
  water: {
    opacity: { light: 0.5, dark: 0.3 },
    outline: { opacity: { light: 0.6, dark: 0.5 }, width: 0.5 }
  },
  park: {
    opacity: { light: 0.4, dark: 0.3 },
    outline: { opacity: 0.5, width: { light: 0.3, dark: 0.5 } }
  },
  land: {
    opacity: { dark: 0.35 },
    color: { dark: "#3a3f4a" }
  }
};

// Функции стилизации слоев
const applyLineStyles = (map: any, layer: any, isLight: boolean) => {
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

  // Неоновый эффект для главных дорог в темной теме
  if (!isLight && layer.source && roadType === "major") {
    addOutlineIfNotExists(map, layer, `${layer.id}-neon-glow`, {
      "line-color": color,
      "line-opacity": createZoomInterpolation([0.08, 0.14, 0.22, 0.30]),
      "line-width": createZoomInterpolation([1.6, 2.6, 4.2, 6.0]),
      "line-blur": 1.4
    });
  }
};

const applyFillStyles = (map: any, layer: any, isLight: boolean) => {
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
};

export default function CyberCityFour() {
  const [isLight, setIsLight] = useState(false);
  const [mapRef, setMapRef] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Состояние для фильтра
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 400);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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


  const baseStyleUrl = useMemo(() => (
    isLight
      ? "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      : "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
  ), [isLight]);

  // Константы для "тяжелых" стилей дорог (более толстые)
  const HEAVY_ROAD_STYLES = {
    major: {
      opacity: { light: 0.9, dark: 1.0 },
      width: [3.0, 5.0, 7.0, 10.0],
      blur: { light: 0.3, dark: 0.6 }
    },
    secondary: {
      opacity: { light: 0.4, dark: 0.5 },
      width: [0.5, 1.0, 1.5, 2.0],
      blur: { light: 0.1, dark: 0.2 }
    },
    minor: {
      opacity: { light: 0.15, dark: 0.2 },
      width: [0.2, 0.3, 0.5, 0.8],
      blur: { light: 0.05, dark: 0.1 }
    },
    default: {
      opacity: { light: 0.6, dark: 0.7 },
      width: [1.0, 1.5, 2.0, 3.0],
      blur: { light: 0.1, dark: 0.2 }
    }
  };

  // Функция для принудительного обновления стилей дорог (делает дороги толще)
  const updateRoadStyles = () => {
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
  };

  // Эффект для обновления стилей карты при изменении темы
  useEffect(() => {
    if (!mapRef || !mapLoaded) return;
    
    updateRoadStyles();
    
    try {
      const layers = mapRef.getStyle()?.layers || [];
      layers.forEach((layer: any) => {
        if (layer.type === "fill") {
          applyFillStyles(mapRef, layer, isLight);
        }
      });
    } catch {}
  }, [mapRef, mapLoaded, isLight]);

  return (
    <section className={`${styles.page} ${isMobile ? styles.mobile : ''}`}>
      {/* Индикатор загрузки */}
      {!mapLoaded && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinnerRing}></div>
            <div className={styles.spinnerText}>Загрузка карты...</div>
          </div>
        </div>
      )}
      <div className={styles.content}>
        <div className={`${styles.mapHost} ${mapLoaded ? styles.mapLoaded : ''} ${isMobile ? styles.mobileMap : ''}`}>
          <ReactMapGL
            key={isLight ? "light" : "dark"}
            initialViewState={{ 
              longitude: 20.5147, 
              latitude: 54.7064, 
              zoom: isMobile ? 12.5 : 13.5, 
              pitch: isMobile ? 25 : 40, 
              bearing: isMobile ? 0 : -10 
            }}
            style={{ width: "100%", height: "100%", display: "block" }}
            mapStyle={baseStyleUrl}
            attributionControl={false}
            dragRotate={!isMobile}
            maxBounds={[[20.36, 54.62], [20.58, 54.78]]}
            onLoad={(e: any) => {
              const map = e?.target; 
              if (!map) return; 
              setMapRef(map);
              setMapLoaded(true);
              
              try {
                const layers = map.getStyle()?.layers || [];
                layers.forEach((layer: any) => {
                  if (layer.type === "line") {
                    applyLineStyles(map, layer, isLight);
                  } else if (layer.type === "fill" && layer.source) {
                    applyFillStyles(map, layer, isLight);
                  }
                });
              } catch {}
            }}
          />

          {/* Неоновый пост-обработка для темной темы */}
          {!isLight && <div className={styles.neonBoost} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />}
          
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
            
            {/* Кнопка фильтра */}
            <button 
              className={styles.filterButton}
              onClick={() => setIsFilterOpen(true)}
              aria-label="Открыть фильтры"
            >
              <Filter size={20} />
            </button>

          {/* Pop-up фильтра */}
          <EventFilter isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
        </div>
      </div>
    </section>
  );
}


