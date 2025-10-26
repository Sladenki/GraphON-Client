"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.scss";

// MapLibre GL JS is open-source (BSD), не требует токенов при использовании открытых стилей/тайлов (например, Carto/OSM).
// Для настоящего наклона (pitch) и вращения (bearing) будем использовать react-map-gl с MapLibre backend.
// Вы можете использовать бесплатные источники, но важно соблюдать атрибуцию источника стилей/данных.

const ReactMapGL = dynamic(() => import("react-map-gl/maplibre").then(m => m.Map), { ssr: false });

export default function CyberCityPage() {
  const [isLight, setIsLight] = useState(false);
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
      setIsLight(media.matches); // fallback на системную тему
    };
    apply();
    media.addEventListener("change", apply);
    const obs = new MutationObserver(apply);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => { media.removeEventListener("change", apply); obs.disconnect(); };
  }, []);

  const baseStyleUrl = useMemo(() => (
    isLight
      ? "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" // светлая основа
      : "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
  ), [isLight]);
  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div className={styles.title}>Киберпанк‑карта — Калининград (MapLibre, 3D pitch)</div>
      </div>
      <div className={styles.content}>
        <div className={styles.mapHost}>
          <div className={styles.tiltInner}>
            <ReactMapGL
              key={isLight ? "light" : "dark"}
              initialViewState={{ longitude: 20.5147, latitude: 54.7064, zoom: 13.5, pitch: 52, bearing: -15 }}
              style={{ width: "100%", height: "100%" }}
              mapStyle={baseStyleUrl}
              attributionControl={false}
              cooperativeGestures={false}
              dragRotate={true}
              maxBounds={[[20.36, 54.62], [20.58, 54.78]]}
              onLoad={(e: any) => {
                const map = e?.target;
                if (!map) return;
                try {
                  // Ограничим область — Калининград
                  try { map.setMaxBounds([[20.36, 54.62], [20.58, 54.78]]); } catch {}

                  const layers = map.getStyle()?.layers || [];
                  const hideIfIdIncludes = [
                    // requested categories and close variants
                    "poi", "amenity", "poi-label", "poi_label",
                    "landuse", "landcover", "park", "green", "greenspace", "forest",
                    "transit", "public_transport",
                    "rail", "railway", "rail-station",
                    "aeroway", "airport", "aerodrome", "runway", "taxiway",
                    "ferry", "harbour", "harbor", "maritime", "pier",
                    // also hide 3D/building extras/icons if present
                    "building", "extrusion", "icon"
                  ];
                  const hideMinorRoadBelowZoom = 17;

                  // Спрячем лишние детали и упростим подписи
                  layers.forEach((ly: any) => {
                    const id = (ly.id || "").toLowerCase();
                    const src = ((ly as any)["source-layer"] || "").toLowerCase();
                    if (hideIfIdIncludes.some(s => id.includes(s) || src.includes(s))) {
                      try { map.setLayoutProperty(ly.id, "visibility", "none"); } catch {}
                      return;
                    }
                    // Полностью скрываем пешеходные/внутрипарковые/внутриквартальные линии
                    const suppressLineKeywords = [
                      "footway", "path", "steps", "pedestrian", "cycle", "cycleway",
                      "track", "service", "bridleway", "living", "sidewalk", "trail"
                    ];
                    if (suppressLineKeywords.some(k => id.includes(k) || src.includes(k))) {
                      try { map.setLayoutProperty(ly.id, "visibility", "none"); } catch {}
                      return;
                    }
                    // Остальные минорные дороги показываем только с крупного масштаба
                    if (id.includes("residential") || id.includes("service") || id.includes("minor") || id.includes("track") || id.includes("footway") || id.includes("path")) {
                      try { map.setLayerZoomRange(ly.id, hideMinorRoadBelowZoom, 24); } catch {}
                    }
                    if (ly.type === "symbol") {
                      try {
                        map.setPaintProperty(ly.id, "text-halo-color", "#0c0f19");
                        map.setPaintProperty(ly.id, "text-halo-width", 1.2);
                        map.setPaintProperty(ly.id, "text-halo-blur", 0.3);
                        map.setLayoutProperty(ly.id, "text-size", [
                          "interpolate", ["linear"], ["zoom"],
                          10, 10,
                          16, 12
                        ]);
                        map.setPaintProperty(ly.id, "icon-opacity", 0);
                      } catch {}
                    }
                  });
                  const colorFor = (id: string) => {
                    const s = (id || "").toLowerCase();
                    if (isLight) {
                      if (s.includes("motorway") || s.includes("highway") || s.includes("primary") || s.includes("main")) return "#2a3a4a";
                      if (s.includes("secondary") || s.includes("street") || s.includes("road")) return "#5a6b7c";
                      return "#6b7c8d";
                    }
                    if (s.includes("motorway") || s.includes("highway")) return "#00eaff";
                    if (s.includes("primary") || s.includes("main")) return "#ff5cf4";
                    if (s.includes("secondary") || s.includes("street") || s.includes("road")) return "#a47cff";
                    return "#3effc3";
                  };

                  layers.forEach((ly: any) => {
                    if (ly.type === "line") {
                      // Жёсткий фильтр по классам транспортных линий в OpenMapTiles
                      try {
                        const sourceLayer = ((ly as any)["source-layer"] || "").toLowerCase();
                        if (sourceLayer === "transportation") {
                          const suppressed: string[] = [
                            "residential", "service", "minor", "track", "path", "footway",
                            "pedestrian", "living_street", "cycleway", "steps"
                          ];
                          // Используем legacy-формат фильтров (как в стилях Carto): ["!in", "class", ...]
                          const notInExpr: any = ["!in", "class", ...suppressed];
                          const current = map.getFilter(ly.id);
                          const combined = current ? ["all", current, notInExpr] : notInExpr;
                          map.setFilter(ly.id, combined as any);
                        }
                      } catch {}
                      const color = colorFor(ly.id);
                      const sid = (ly.id || "").toLowerCase();
                      map.setPaintProperty(ly.id, "line-color", color);
                      map.setPaintProperty(ly.id, "line-opacity", [
                        "interpolate", ["linear"], ["zoom"],
                        10, 0.25, 12, 0.45, 14, 0.70, 16, 0.98
                      ]);
                      if (sid.includes("motorway") || sid.includes("highway") || sid.includes("primary") || sid.includes("main")) {
                        map.setPaintProperty(ly.id, "line-width", [
                          "interpolate", ["linear"], ["zoom"],
                          10, 1.0, 12, 2.0, 14, 3.2, 16, 5.0
                        ]);
                        map.setPaintProperty(ly.id, "line-blur", 0.4);
                      } else if (sid.includes("secondary") || sid.includes("street") || sid.includes("road")) {
                        map.setPaintProperty(ly.id, "line-width", [
                          "interpolate", ["linear"], ["zoom"],
                          10, 0.3, 12, 0.6, 14, 1.0, 16, 1.6
                        ]);
                        map.setPaintProperty(ly.id, "line-blur", 0.2);
                      } else {
                        map.setPaintProperty(ly.id, "line-width", [
                          "interpolate", ["linear"], ["zoom"],
                          10, 0.2, 12, 0.4, 14, 0.6, 16, 1.0
                        ]);
                        map.setPaintProperty(ly.id, "line-blur", 0.1);
                      }

                      if (ly.source) {
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
                    } else if (ly.type === "symbol") {
                      map.setPaintProperty(ly.id, "text-color", "#8cf7ff");
                      map.setPaintProperty(ly.id, "text-halo-color", "#ff5cf4");
                      map.setPaintProperty(ly.id, "text-halo-width", 1.2);
                      map.setPaintProperty(ly.id, "text-halo-blur", 0.2);
                    } else if (ly.type === "fill" && (ly.id || "").toLowerCase().includes("water")) {
                      map.setPaintProperty(ly.id, "fill-color", "#081624");
                      map.setPaintProperty(ly.id, "fill-opacity", 0.95);
                    }
                  });
                } catch {}
              }}
            />
            {/* Небольшой post-process */}
            <div className={styles.neonBoost} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
            {/* Canvas для будущего glow‑лейблов/оверлеев */}
            <div className={styles.labelsGlow} />
          </div>
          {/* лёгкий depth fade поверх карты */}
          <div className={styles.depthFade} />
        </div>
      </div>
    </section>
  );
}


