"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import styles from "./page.module.scss";
import EventFilter from "./EventFilter/EventFilter";

const ReactMapGL = dynamic(() => import("react-map-gl/maplibre").then(m => m.Map), { ssr: false });

export default function CyberCityFour() {
  const [isLight, setIsLight] = useState(false);
  const [mapRef, setMapRef] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(13.5);
  
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
    
    // Обновляем стили дорог
    updateRoadStyles();
    
    try {
      const layers = mapRef.getStyle()?.layers || [];
      
      layers.forEach((ly: any) => {
        if (ly.type === "fill") {
          const fillId = (ly.id || "").toLowerCase();
          
          // Парки и зеленые зоны
          if (fillId.includes("park") || fillId.includes("garden") || fillId.includes("forest") || fillId.includes("grass")) {
            mapRef.setPaintProperty(ly.id, "fill-opacity", isLight ? 0.4 : 0.3);
            mapRef.setPaintProperty(ly.id, "fill-color", isLight ? "#a8c29a" : "#3a6a5a");
            
            // Обновляем обводку парков
            const parkOutlineId = `${ly.id}-outline`;
            if (mapRef.getLayer(parkOutlineId)) {
              mapRef.setPaintProperty(parkOutlineId, "line-color", isLight ? "#7ba07a" : "#4a8a6a");
              mapRef.setPaintProperty(parkOutlineId, "line-opacity", isLight ? 0.5 : 0.5);
              mapRef.setPaintProperty(parkOutlineId, "line-width", isLight ? 0.3 : 0.5);
            }
          }
          
          // Водные объекты
          if (fillId.includes("water") || fillId.includes("marine") || fillId.includes("river")) {
            mapRef.setPaintProperty(ly.id, "fill-opacity", isLight ? 0.5 : 0.3);
            mapRef.setPaintProperty(ly.id, "fill-color", isLight ? "#a0b3c8" : "#1a2a3f");
            
            const waterOutlineId = `${ly.id}-outline`;
            if (mapRef.getLayer(waterOutlineId)) {
              mapRef.setPaintProperty(waterOutlineId, "line-color", isLight ? "#7a9aba" : "#2a4a6f");
              mapRef.setPaintProperty(waterOutlineId, "line-opacity", isLight ? 0.6 : 0.5);
            }
          }
          
          // Земельные участки и острова
          const isLand = !fillId.includes("water") && !fillId.includes("marine") && !fillId.includes("park") && !fillId.includes("garden") && !fillId.includes("admin") && !fillId.includes("boundary");
          if (isLand && (fillId.includes("land") || fillId.includes("landcover") || fillId.includes("earth") || fillId === "")) {
            mapRef.setPaintProperty(ly.id, "fill-opacity", isLight ? undefined : 0.35);
            if (!isLight) {
              mapRef.setPaintProperty(ly.id, "fill-color", "#3a3f4a");
            }
          }
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
              const map = e?.target; if (!map) return; setMapRef(map);
              
              // Анимация загрузки завершена (минимальная задержка)
              setMapLoaded(true);
              
              try {
                const layers = map.getStyle()?.layers || [];
                const colorFor = (id: string) => {
                  const s = (id || "").toLowerCase();
                  if (isLight) {
                    if (s.includes("motorway") || s.includes("highway") || s.includes("primary") || s.includes("main")) return "#3f4a55";
                    if (s.includes("secondary") || s.includes("street") || s.includes("road")) return "#87909a";
                    return "#9aa4ae";
                  }
                  if (s.includes("motorway") || s.includes("highway")) return "#00eaff";
                  if (s.includes("primary") || s.includes("main")) return "#ff5cf4";
                  if (s.includes("secondary") || s.includes("street") || s.includes("road")) return "#a47cff";
                  return "#3effc3";
                };

                layers.forEach((ly: any) => {
                  if (ly.type === "line") {
                    const color = colorFor(ly.id);
                    const sid = (ly.id || "").toLowerCase();
                    
                    // Определяем тип дороги для визуальной иерархии
                    const isMajorRoad = sid.includes("motorway") || sid.includes("highway") || sid.includes("primary") || sid.includes("main");
                    const isSecondaryRoad = sid.includes("secondary") || sid.includes("street") || sid.includes("road");
                    const isMinorRoad = !isMajorRoad && !isSecondaryRoad;
                    
                    map.setPaintProperty(ly.id, "line-color", color);
                    
                    // Визуальная иерархия по типам дорог
                    if (isMajorRoad) {
                      // Главные магистрали - яркие и контрастные
                      map.setPaintProperty(ly.id, "line-opacity", isLight ? [
                        "interpolate", ["linear"], ["zoom"], 10, 0.5, 12, 0.7, 14, 0.85, 16, 0.95
                      ] : [
                        "interpolate", ["linear"], ["zoom"], 10, 0.45, 12, 0.65, 14, 0.85, 16, 1.0
                      ]);
                      map.setPaintProperty(ly.id, "line-width", [
                        "interpolate", ["linear"], ["zoom"],
                        10, 1.0, 12, 2.0, 14, 3.2, 16, 5.0
                      ]);
                      map.setPaintProperty(ly.id, "line-blur", isLight ? 0.15 : 0.4);
                    } else if (isSecondaryRoad) {
                      // Вторичные дороги - средняя яркость
                      map.setPaintProperty(ly.id, "line-opacity", isLight ? [
                        "interpolate", ["linear"], ["zoom"], 10, 0.25, 12, 0.35, 14, 0.45, 16, 0.55
                      ] : [
                        "interpolate", ["linear"], ["zoom"], 10, 0.20, 12, 0.30, 14, 0.45, 16, 0.60
                      ]);
                      map.setPaintProperty(ly.id, "line-width", [
                        "interpolate", ["linear"], ["zoom"],
                        10, 0.3, 12, 0.6, 14, 1.0, 16, 1.6
                      ]);
                      map.setPaintProperty(ly.id, "line-blur", isLight ? 0.1 : 0.2);
                    } else {
                      // Мелкие дороги - приглушенные
                      map.setPaintProperty(ly.id, "line-opacity", isLight ? [
                        "interpolate", ["linear"], ["zoom"], 10, 0.12, 12, 0.18, 14, 0.25, 16, 0.30
                      ] : [
                        "interpolate", ["linear"], ["zoom"], 10, 0.10, 12, 0.15, 14, 0.22, 16, 0.30
                      ]);
                      map.setPaintProperty(ly.id, "line-width", [
                        "interpolate", ["linear"], ["zoom"],
                        10, 0.2, 12, 0.4, 14, 0.6, 16, 1.0
                      ]);
                      map.setPaintProperty(ly.id, "line-blur", isLight ? 0.05 : 0.1);
                    }

                    // Неоновый эффект (glow) только для основных дорог в темной теме
                    if (!isLight && ly.source && isMajorRoad) {
                      const glowId = `${ly.id}-neon-glow`;
                      if (!layers.find((l: any) => l.id === glowId) && !map.getLayer(glowId)) {
                        const addDef: any = {
                          id: glowId,
                          type: "line",
                          source: ly.source,
                          layout: ly.layout || {},
                          paint: {
                            "line-color": color,
                            "line-opacity": [
                              "interpolate", ["linear"], ["zoom"],
                              10, 0.08, 12, 0.14, 14, 0.22, 16, 0.30
                            ],
                            "line-width": [
                              "interpolate", ["linear"], ["zoom"],
                              10, 1.6, 12, 2.6, 14, 4.2, 16, 6.0
                            ],
                            "line-blur": 1.4
                          }
                        };
                        if ((ly as any)["source-layer"]) addDef["source-layer"] = (ly as any)["source-layer"];
                        if (ly.filter) addDef.filter = ly.filter;
                        try { map.addLayer(addDef, ly.id); } catch {}
                      }
                    }
                  }
                  
                  // Улучшенные стили для водных объектов и парков
                  if (ly.type === "fill" && ly.source) {
                    const fillId = (ly.id || "").toLowerCase();
                    
                    // Границы районов и зоны с glow
                    if (fillId.includes("admin") || fillId.includes("boundary")) {
                      map.setPaintProperty(ly.id, "fill-opacity", 0.05);
                      
                      // Обводка с glow эффектом
                      const boundaryOutlineId = `${ly.id}-glow-outline`;
                      if (!map.getLayer(boundaryOutlineId)) {
                        try {
                          const boundaryOutlineDef: any = {
                            id: boundaryOutlineId,
                            type: "line",
                            source: ly.source,
                            layout: ly.layout || {},
                            paint: {
                              "line-color": isLight ? "#94a3b8" : "#3a4a5a",
                              "line-opacity": 0.2,
                              "line-width": 1,
                              "line-blur": 2
                            }
                          };
                          if ((ly as any)["source-layer"]) boundaryOutlineDef["source-layer"] = (ly as any)["source-layer"];
                          if (ly.filter) boundaryOutlineDef.filter = ly.filter;
                          map.addLayer(boundaryOutlineDef);
                        } catch {}
                      }
                    }
                    
                    // Земельные участки и острова
                    const isLand = !fillId.includes("water") && !fillId.includes("marine") && !fillId.includes("park") && !fillId.includes("garden") && !fillId.includes("admin") && !fillId.includes("boundary");
                    if (isLand) {
                      map.setPaintProperty(ly.id, "fill-opacity", isLight ? undefined : 0.35);
                      if (!isLight) {
                        map.setPaintProperty(ly.id, "fill-color", "#3a3f4a");
                      }
                    }
                    
                    // Водные объекты (реки, водоемы)
                    if (fillId.includes("water") || fillId.includes("marine") || fillId.includes("river")) {
                      map.setPaintProperty(ly.id, "fill-opacity", isLight ? 0.5 : 0.3);
                      map.setPaintProperty(ly.id, "fill-color", isLight ? "#a0b3c8" : "#1a2a3f");
                      
                      // Обводка для воды
                      const waterOutlineId = `${ly.id}-outline`;
                      if (!map.getLayer(waterOutlineId)) {
                        try {
                          const outlineDef: any = {
                            id: waterOutlineId,
                            type: "line",
                            source: ly.source,
                            layout: ly.layout || {},
                            paint: {
                              "line-color": isLight ? "#7a9aba" : "#2a4a6f",
                              "line-opacity": isLight ? 0.6 : 0.5,
                              "line-width": 0.5
                            }
                          };
                          if ((ly as any)["source-layer"]) outlineDef["source-layer"] = (ly as any)["source-layer"];
                          if (ly.filter) outlineDef.filter = ly.filter;
                          map.addLayer(outlineDef);
                        } catch {}
                      }
                    }
                    
                    // Парки и зеленые зоны
                    if (fillId.includes("park") || fillId.includes("garden") || fillId.includes("forest") || fillId.includes("grass")) {
                      map.setPaintProperty(ly.id, "fill-opacity", isLight ? 0.4 : 0.3);
                      map.setPaintProperty(ly.id, "fill-color", isLight ? "#a8c29a" : "#3a6a5a");
                      
                      // Обводка для парков
                      const parkOutlineId = `${ly.id}-outline`;
                      if (!map.getLayer(parkOutlineId)) {
                        try {
                          const parkOutlineDef: any = {
                            id: parkOutlineId,
                            type: "line",
                            source: ly.source,
                            layout: ly.layout || {},
                            paint: {
                              "line-color": isLight ? "#7ba07a" : "#4a8a6a",
                              "line-opacity": isLight ? 0.5 : 0.5,
                              "line-width": isLight ? 0.3 : 0.5
                            }
                          };
                          if ((ly as any)["source-layer"]) parkOutlineDef["source-layer"] = (ly as any)["source-layer"];
                          if (ly.filter) parkOutlineDef.filter = ly.filter;
                          map.addLayer(parkOutlineDef);
                        } catch {}
                      }
                    }
                  }
                });
              } catch {}
            }}
            onMove={(e: any) => {
              if (e.viewState) {
                setZoomLevel(e.viewState.zoom);
              }
            }}
          />

          {/* Неоновый пост-обработка для темной темы */}
          {!isLight && <div className={styles.neonBoost} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />}
          
          {/* Cyberpunk Effects - только для темной темы */}
          {!isLight && (
            <>
              {/* Анимированная сетка с адаптацией к зуму */}
              <div 
                className={styles.gridTexture}
                style={{
                  backgroundSize: `${Math.max(15, Math.min(30, zoomLevel * 2))}px ${Math.max(15, Math.min(30, zoomLevel * 2))}px`
                }}
              />
              
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


