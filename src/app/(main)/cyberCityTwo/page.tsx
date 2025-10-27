"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import styles from "./page.module.scss";
import EventFilter from "./EventFilter/EventFilter";

const ReactMapGL = dynamic(() => import("react-map-gl/maplibre").then(m => m.Map), { ssr: false });

export default function CyberCityTwo() {
  const [isLight, setIsLight] = useState(false);
  const [mapRef, setMapRef] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Состояние для фильтра
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  // useEffect(() => {
  //   // Создаем данные о трех основных районах Калининграда с кривыми контурами
  //   const loadDistricts = () => {
  //      const kaliningradDistricts = [
  //       {
  //         id: 1,
  //         name: "Ленинградский район",
  //         geometry: [[
  //           [20.3600, 54.7400],
  //           [20.3750, 54.7480],
  //           [20.3950, 54.7550],
  //           [20.4200, 54.7585],
  //           [20.4450, 54.7600],
  //           [20.4700, 54.7570],
  //           [20.4950, 54.7500],
  //           [20.5100, 54.7400],
  //           [20.5200, 54.7250],
  //           [20.5250, 54.7100],
  //           [20.5200, 54.6950],
  //           [20.5050, 54.6880],
  //           [20.4850, 54.6885],
  //           [20.4600, 54.6930],
  //           [20.4400, 54.7000],
  //           [20.4250, 54.7120],
  //           [20.4100, 54.7250],
  //           [20.3900, 54.7320],
  //           [20.3700, 54.7370],
  //           [20.3600, 54.7400]
  //         ]],
  //         color: "#00eaff"
  //       },
  //       {
  //         id: 2,
  //         name: "Центральный район",
  //         geometry: [[
  //           [20.4550, 54.7100],
  //           [20.4680, 54.7050],
  //           [20.4850, 54.7020],
  //           [20.5000, 54.7005],
  //           [20.5170, 54.7020],
  //           [20.5320, 54.7065],
  //           [20.5450, 54.7140],
  //           [20.5520, 54.7240],
  //           [20.5500, 54.7350],
  //           [20.5400, 54.7440],
  //           [20.5250, 54.7480],
  //           [20.5050, 54.7470],
  //           [20.4900, 54.7420],
  //           [20.4780, 54.7340],
  //           [20.4720, 54.7240],
  //           [20.4680, 54.7160],
  //           [20.4600, 54.7130],
  //           [20.4550, 54.7100]
  //         ]],
  //         color: "#a47cff"
  //       },
  //       {
  //         id: 3,
  //         name: "Балтийский район",
  //         geometry: [[
  //           [20.3350, 54.6900],
  //           [20.3500, 54.6820],
  //           [20.3700, 54.6780],
  //           [20.3900, 54.6740],
  //           [20.4100, 54.6720],
  //           [20.4300, 54.6705],
  //           [20.4500, 54.6710],
  //           [20.4700, 54.6750],
  //           [20.4880, 54.6820],
  //           [20.4950, 54.6920],
  //           [20.4930, 54.7040],
  //           [20.4850, 54.7130],
  //           [20.4700, 54.7180],
  //           [20.4500, 54.7180],
  //           [20.4300, 54.7140],
  //           [20.4100, 54.7060],
  //           [20.3950, 54.7000],
  //           [20.3750, 54.6950],
  //           [20.3550, 54.6920],
  //           [20.3350, 54.6900]
  //         ]],
  //         color: "#3effc3"
  //       }
  //     ];
  //     
  //     
  //     console.log("Loading districts:", kaliningradDistricts);
  //     setDistricts(kaliningradDistricts as any);
  //   };
  //   loadDistricts();
  // }, []);

  // // Эффект для добавления границ районов на карту
  // useEffect(() => {
  //   if (!mapRef || districts.length === 0) return;
  //   
  //   console.log("Adding districts to map:", districts);
  //   
  //   districts.forEach((district: any) => {
  //     try {
  //       const geoJson = {
  //         type: "Feature",
  //         geometry: {
  //           type: "Polygon",
  //           coordinates: district.geometry
  //         },
  //         properties: { name: district.name }
  //       };
  //       
  //       const sourceId = `district-${district.id}`;
  //       
  //       if (!mapRef.getSource(sourceId)) {
  //         console.log("Adding source:", sourceId);
  //         mapRef.addSource(sourceId, {
  //           type: "geojson",
  //           data: geoJson as any
  //         });
  //         
  //         mapRef.addLayer({
  //           id: `district-fill-${district.id}`,
  //           type: "fill",
  //           source: sourceId,
  //           paint: {
  //             "fill-color": district.color,
  //             "fill-opacity": 0.15
  //           }
  //         } as any);
  //         
  //         mapRef.addLayer({
  //           id: `district-line-${district.id}`,
  //           type: "line",
  //           source: sourceId,
  //           paint: {
  //             "line-color": district.color,
  //             "line-width": 4,
  //             "line-opacity": isLight ? 0.7 : 0.9
  //           }
  //         } as any);
  //       } else {
  //         // Обновляем существующие слои
  //         const fillLayerId = `district-fill-${district.id}`;
  //         const lineLayerId = `district-line-${district.id}`;
  //         if (mapRef.getLayer(lineLayerId)) {
  //           mapRef.setPaintProperty(lineLayerId, "line-opacity", isLight ? 0.7 : 0.9);
  //         }
  //         if (mapRef.getLayer(fillLayerId)) {
  //           mapRef.setPaintProperty(fillLayerId, "fill-opacity", 0.15);
  //         }
  //       }
  //     } catch (err) {
  //       console.error("Error adding district:", district.name, err);
  //     }
  //   });
  // }, [mapRef, districts, isLight]);

  const baseStyleUrl = useMemo(() => (
    isLight
      ? "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      : "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
  ), [isLight]);

  return (
    <section className={styles.page}>
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
        <div className={`${styles.mapHost} ${mapLoaded ? styles.mapLoaded : ''}`}>
          <ReactMapGL
            key={isLight ? "light" : "dark"}
            initialViewState={{ longitude: 20.5147, latitude: 54.7064, zoom: 13.5, pitch: 40, bearing: -10 }}
            style={{ width: "100%", height: "100%", display: "block" }}
            mapStyle={baseStyleUrl}
            attributionControl={false}
            dragRotate={true}
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
                    map.setPaintProperty(ly.id, "line-color", color);
                    map.setPaintProperty(ly.id, "line-opacity", isLight ? [
                      "interpolate", ["linear"], ["zoom"], 10, 0.35, 12, 0.55, 14, 0.75, 16, 0.90
                    ] : [
                      "interpolate", ["linear"], ["zoom"], 10, 0.25, 12, 0.45, 14, 0.70, 16, 0.98
                    ]);
                    
                    if (sid.includes("motorway") || sid.includes("highway") || sid.includes("primary") || sid.includes("main")) {
                      map.setPaintProperty(ly.id, "line-width", [
                        "interpolate", ["linear"], ["zoom"],
                        10, 1.0, 12, 2.0, 14, 3.2, 16, 5.0
                      ]);
                      map.setPaintProperty(ly.id, "line-blur", isLight ? 0.15 : 0.4);
                    } else if (sid.includes("secondary") || sid.includes("street") || sid.includes("road")) {
                      map.setPaintProperty(ly.id, "line-width", [
                        "interpolate", ["linear"], ["zoom"],
                        10, 0.3, 12, 0.6, 14, 1.0, 16, 1.6
                      ]);
                      map.setPaintProperty(ly.id, "line-blur", isLight ? 0.1 : 0.2);
                    } else {
                      map.setPaintProperty(ly.id, "line-width", [
                        "interpolate", ["linear"], ["zoom"],
                        10, 0.2, 12, 0.4, 14, 0.6, 16, 1.0
                      ]);
                      map.setPaintProperty(ly.id, "line-blur", isLight ? 0.05 : 0.1);
                    }

                    // Неоновый эффект (glow) только для основных дорог в темной теме
                    if (!isLight && ly.source && (sid.includes("motorway") || sid.includes("highway") || sid.includes("primary"))) {
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
                });
              } catch {}
            }}
            onMove={(e: any) => {}}
          />

          {/* Неоновый пост-обработка для темной темы */}
          {!isLight && <div className={styles.neonBoost} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />}
          
          {/* Плавающая кнопка фильтра */}
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


