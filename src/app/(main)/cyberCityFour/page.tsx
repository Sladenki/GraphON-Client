"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import styles from "./page.module.scss";
import EventFilter from "./EventFilter/EventFilter";
import { useDebounce } from "@/hooks/useDebounce";
import { 
  type RoadType, 
  type FillType, 
  COLORS, 
  getLayerColor, 
  ROAD_STYLES, 
  FILL_STYLES, 
  HEAVY_ROAD_STYLES 
} from "./mapStyles";

const ReactMapGL = dynamic(() => import("react-map-gl/maplibre").then(m => m.Map), { ssr: false });

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


// ===== КОМПОНЕНТ =====

export default function CyberCityFour() {
  const [isLight, setIsLight] = useState(false);
  const [mapRef, setMapRef] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Состояние для фильтра
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  // Неоновый эффект для главных дорог в темной теме
  if (!isLight && layer.source && roadType === "major") {
    addOutlineIfNotExists(map, layer, `${layer.id}-neon-glow`, {
      "line-color": color,
      "line-opacity": createZoomInterpolation([0.08, 0.14, 0.22, 0.30]),
      "line-width": createZoomInterpolation([1.6, 2.6, 4.2, 6.0]),
      "line-blur": 1.4
    });
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


  const baseStyleUrl = useMemo(() => (
    isLight
      ? "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      : "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
  ), [isLight]);

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
      const layers = map.getStyle()?.layers || [];
      layers.forEach((layer: any) => {
        if (layer.type === "line") {
          applyLineStyles(map, layer, isLight);
        } else if (layer.type === "fill" && layer.source) {
          applyFillStyles(map, layer, isLight);
        }
      });
    } catch {}
  }, [applyLineStyles, applyFillStyles, isLight]);

  // Мемоизированный обработчик открытия фильтра
  const handleFilterOpen = useCallback(() => {
    setIsFilterOpen(true);
  }, []);

  // Мемоизированный обработчик закрытия фильтра
  const handleFilterClose = useCallback(() => {
    setIsFilterOpen(false);
  }, []);

  // Эффект для обновления стилей карты при изменении темы (оптимизированный)
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
  }, [mapRef, mapLoaded, isLight, updateRoadStyles, applyFillStyles]); // Добавлены мемоизированные функции в зависимости

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
          <div className={styles.map}>
          <ReactMapGL
            key={isLight ? "light" : "dark"}
            initialViewState={{ 
              longitude: 20.5103, 
              latitude: 54.7068, 
                zoom: isVerySmallScreen ? 13.0 : (isMobile ? 14.0 : 15.0), 
                pitch: isVerySmallScreen ? 20 : (isMobile ? 25 : 40), 
              bearing: isMobile ? 0 : -10 
            }}
            mapStyle={baseStyleUrl}
            attributionControl={false}
            dragRotate={!isMobile}
            maxBounds={[[20.36, 54.62], [20.58, 54.78]]}
              onLoad={handleMapLoad}
            />
          </div>

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
            
            {/* Кнопка фильтра */}
            <button 
              className={styles.filterButton}
              onClick={handleFilterOpen}
              aria-label="Открыть фильтры"
            >
              <Filter size={20} />
            </button>

          {/* Pop-up фильтра */}
          <EventFilter isOpen={isFilterOpen} onClose={handleFilterClose} />
        </div>
      </div>
    </section>
  );
}


