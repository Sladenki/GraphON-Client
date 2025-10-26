"use client";

import dynamic from "next/dynamic";
import styles from "./page.module.scss";

// MapLibre GL JS is open-source (BSD), не требует токенов при использовании открытых стилей/тайлов (например, Carto/OSM).
// Для настоящего наклона (pitch) и вращения (bearing) будем использовать react-map-gl с MapLibre backend.
// Вы можете использовать бесплатные источники, но важно соблюдать атрибуцию источника стилей/данных.

const ReactMapGL = dynamic(() => import("react-map-gl/maplibre").then(m => m.Map), { ssr: false });

export default function CyberCityPage() {
  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div className={styles.title}>Киберпанк‑карта — Калининград (MapLibre, 3D pitch)</div>
      </div>
      <div className={styles.content}>
        <div className={styles.mapHost}>
          <div className={styles.tiltInner}>
            <ReactMapGL
              initialViewState={{ longitude: 20.5147, latitude: 54.7064, zoom: 13.5, pitch: 52, bearing: -15 }}
              style={{ width: "100%", height: "100%" }}
              mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
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
                    "building", "extrusion", "poi", "amenity", "icon", "landuse",
                    "transit", "rail", "railway", "aeroway", "ferry"
                  ];
                  const hideMinorRoadBelowZoom = 16;

                  // Спрячем лишние детали и упростим подписи
                  layers.forEach((ly: any) => {
                    const id = (ly.id || "").toLowerCase();
                    if (hideIfIdIncludes.some(s => id.includes(s))) {
                      try { map.setLayoutProperty(ly.id, "visibility", "none"); } catch {}
                      return;
                    }
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
                  const neonFor = (id: string) => {
                    const s = (id || "").toLowerCase();
                    if (s.includes("motorway") || s.includes("highway")) return "#00eaff";
                    if (s.includes("primary") || s.includes("main")) return "#ff5cf4";
                    if (s.includes("secondary") || s.includes("street") || s.includes("road")) return "#a47cff";
                    return "#3effc3";
                  };

                  layers.forEach((ly: any) => {
                    if (ly.type === "line") {
                      const color = neonFor(ly.id);
                      const sid = (ly.id || "").toLowerCase();
                      map.setPaintProperty(ly.id, "line-color", color);
                      map.setPaintProperty(ly.id, "line-opacity", 0.95);
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
                              "line-opacity": 0.35,
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
        </div>
      </div>
    </section>
  );
}


