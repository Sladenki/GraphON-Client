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

// Функция создания outline слоя
const createOutlineLayer = (baseLayer: any, id: string, paint: any) => {
  const def: any = {
    id, type: "line", source: baseLayer.source, layout: baseLayer.layout || {}, paint
  };
  if (baseLayer["source-layer"]) def["source-layer"] = baseLayer["source-layer"];
  if (baseLayer.filter) def.filter = baseLayer.filter;
  return def;
};

// Функции стилизации слоев
const applyLineStyles = (map: any, layer: any, isLight: boolean) => {
  const color = getLayerColor(layer.id, isLight);
  const sid = layer.id.toLowerCase();
  
  const isMajorRoad = sid.includes("motorway") || sid.includes("highway") || sid.includes("primary") || sid.includes("main");
  const isSecondaryRoad = sid.includes("secondary") || sid.includes("street") || sid.includes("road");
  
  map.setPaintProperty(layer.id, "line-color", color);
  
  if (isMajorRoad) {
    map.setPaintProperty(layer.id, "line-opacity", isLight ? [
      "interpolate", ["linear"], ["zoom"], 10, 0.5, 12, 0.7, 14, 0.85, 16, 0.95
    ] : [
      "interpolate", ["linear"], ["zoom"], 10, 0.45, 12, 0.65, 14, 0.85, 16, 1.0
    ]);
    map.setPaintProperty(layer.id, "line-width", [
      "interpolate", ["linear"], ["zoom"], 10, 1.0, 12, 2.0, 14, 3.2, 16, 5.0
    ]);
    map.setPaintProperty(layer.id, "line-blur", isLight ? 0.15 : 0.4);
  } else if (isSecondaryRoad) {
    map.setPaintProperty(layer.id, "line-opacity", isLight ? [
      "interpolate", ["linear"], ["zoom"], 10, 0.25, 12, 0.35, 14, 0.45, 16, 0.55
    ] : [
      "interpolate", ["linear"], ["zoom"], 10, 0.20, 12, 0.30, 14, 0.45, 16, 0.60
    ]);
    map.setPaintProperty(layer.id, "line-width", [
      "interpolate", ["linear"], ["zoom"], 10, 0.3, 12, 0.6, 14, 1.0, 16, 1.6
    ]);
    map.setPaintProperty(layer.id, "line-blur", isLight ? 0.1 : 0.2);
  } else {
    map.setPaintProperty(layer.id, "line-opacity", isLight ? [
      "interpolate", ["linear"], ["zoom"], 10, 0.12, 12, 0.18, 14, 0.25, 16, 0.30
    ] : [
      "interpolate", ["linear"], ["zoom"], 10, 0.10, 12, 0.15, 14, 0.22, 16, 0.30
    ]);
    map.setPaintProperty(layer.id, "line-width", [
      "interpolate", ["linear"], ["zoom"], 10, 0.2, 12, 0.4, 14, 0.6, 16, 1.0
    ]);
    map.setPaintProperty(layer.id, "line-blur", isLight ? 0.05 : 0.1);
  }

  // Неоновый эффект для главных дорог в темной теме
  if (!isLight && layer.source && isMajorRoad) {
    const glowId = `${layer.id}-neon-glow`;
    if (!map.getLayer(glowId)) {
      try {
        const glowDef = createOutlineLayer(layer, glowId, {
          "line-color": color,
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0.08, 12, 0.14, 14, 0.22, 16, 0.30],
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 1.6, 12, 2.6, 14, 4.2, 16, 6.0],
          "line-blur": 1.4
        });
        map.addLayer(glowDef, layer.id);
      } catch {}
    }
  }
};

const applyFillStyles = (map: any, layer: any, isLight: boolean) => {
  const fillId = layer.id.toLowerCase();
  
  if (fillId.includes("admin") || fillId.includes("boundary")) {
    map.setPaintProperty(layer.id, "fill-opacity", 0.05);
    const outlineId = `${layer.id}-glow-outline`;
    if (!map.getLayer(outlineId)) {
      try {
        const outlineDef = createOutlineLayer(layer, outlineId, {
          "line-color": isLight ? COLORS.light.boundary : COLORS.dark.boundary,
          "line-opacity": 0.2,
          "line-width": 1,
          "line-blur": 2
        });
        map.addLayer(outlineDef);
      } catch {}
    }
  } else if (fillId.includes("water") || fillId.includes("marine") || fillId.includes("river")) {
    map.setPaintProperty(layer.id, "fill-opacity", isLight ? 0.5 : 0.3);
    map.setPaintProperty(layer.id, "fill-color", isLight ? COLORS.light.water : COLORS.dark.water);
    
    const outlineId = `${layer.id}-outline`;
    if (!map.getLayer(outlineId)) {
      try {
        const outlineDef = createOutlineLayer(layer, outlineId, {
          "line-color": isLight ? COLORS.light.waterOutline : COLORS.dark.waterOutline,
          "line-opacity": isLight ? 0.6 : 0.5,
          "line-width": 0.5
        });
        map.addLayer(outlineDef);
      } catch {}
    }
  } else if (fillId.includes("park") || fillId.includes("garden") || fillId.includes("forest") || fillId.includes("grass")) {
    map.setPaintProperty(layer.id, "fill-opacity", isLight ? 0.4 : 0.3);
    map.setPaintProperty(layer.id, "fill-color", isLight ? COLORS.light.park : COLORS.dark.park);
    
    const outlineId = `${layer.id}-outline`;
    if (!map.getLayer(outlineId)) {
      try {
        const outlineDef = createOutlineLayer(layer, outlineId, {
          "line-color": isLight ? COLORS.light.parkOutline : COLORS.dark.parkOutline,
          "line-opacity": 0.5,
          "line-width": isLight ? 0.3 : 0.5
        });
        map.addLayer(outlineDef);
      } catch {}
    }
  } else {
    const isLand = !fillId.includes("water") && !fillId.includes("marine") && !fillId.includes("park") && !fillId.includes("garden") && !fillId.includes("admin") && !fillId.includes("boundary");
    if (isLand) {
      map.setPaintProperty(layer.id, "fill-opacity", isLight ? undefined : 0.35);
      if (!isLight) {
        map.setPaintProperty(layer.id, "fill-color", "#3a3f4a");
      }
    }
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

  // Функция для принудительного обновления стилей дорог
  const updateRoadStyles = () => {
    if (!mapRef) return;
    
    try {
      const layers = mapRef.getStyle()?.layers || [];
      console.log("Обновляем стили дорог в CyberCityThree, найдено слоев:", layers.length);
      
      layers.forEach((ly: any) => {
        if (ly.type === "line") {
          const sid = (ly.id || "").toLowerCase();
          console.log("Обрабатываем слой:", ly.id, "source-layer:", (ly as any)["source-layer"]);
          
          // Проверяем по ID слоя более точно
          const isMajorRoad = sid.includes("motorway") || sid.includes("highway") || sid.includes("primary") || sid.includes("trunk");
          const isSecondaryRoad = sid.includes("secondary") || sid.includes("tertiary");
          const isMinorRoad = sid.includes("residential") || sid.includes("service") || sid.includes("unclassified") || sid.includes("minor");
          
          if (isMajorRoad) {
            console.log("Применяем стили главной дороги к:", ly.id);
            // Главные дороги - очень толстые и яркие
            mapRef.setPaintProperty(ly.id, "line-opacity", isLight ? 0.9 : 1.0);
            mapRef.setPaintProperty(ly.id, "line-width", [
              "interpolate", ["linear"], ["zoom"],
              10, 3.0, 12, 5.0, 14, 7.0, 16, 10.0
            ]);
            mapRef.setPaintProperty(ly.id, "line-blur", isLight ? 0.3 : 0.6);
          } else if (isSecondaryRoad) {
            console.log("Применяем стили вторичной дороги к:", ly.id);
            // Вторичные дороги - умеренные
            mapRef.setPaintProperty(ly.id, "line-opacity", isLight ? 0.4 : 0.5);
            mapRef.setPaintProperty(ly.id, "line-width", [
              "interpolate", ["linear"], ["zoom"],
              10, 0.5, 12, 1.0, 14, 1.5, 16, 2.0
            ]);
          } else if (isMinorRoad) {
            console.log("Применяем стили мелкой дороги к:", ly.id);
            // Мелкие дороги - очень приглушенные
            mapRef.setPaintProperty(ly.id, "line-opacity", isLight ? 0.15 : 0.2);
            mapRef.setPaintProperty(ly.id, "line-width", [
              "interpolate", ["linear"], ["zoom"],
              10, 0.2, 12, 0.3, 14, 0.5, 16, 0.8
            ]);
          } else {
            console.log("Применяем стили по умолчанию к:", ly.id);
            // Остальные дороги - средние
            mapRef.setPaintProperty(ly.id, "line-opacity", isLight ? 0.6 : 0.7);
            mapRef.setPaintProperty(ly.id, "line-width", [
              "interpolate", ["linear"], ["zoom"],
              10, 1.0, 12, 1.5, 14, 2.0, 16, 3.0
            ]);
          }
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


