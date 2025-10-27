"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.scss";

const ReactMapGL = dynamic(() => import("react-map-gl/maplibre").then(m => m.Map), { ssr: false });

export default function CyberCityTwo() {
  const [isLight, setIsLight] = useState(false);
  const [mapRef, setMapRef] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [suggests, setSuggests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<number | null>(null);

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

  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <div className={styles.mapHost}>
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
          />

          {/* Неоновый пост-обработка для темной темы */}
          {!isLight && <div className={styles.neonBoost} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />}

          {/* Поиск по адресам */}
          <div className={styles.searchBox}>
            <input
              className={styles.searchInput}
              placeholder="Поиск адреса/места"
              value={search}
              onChange={(ev) => {
                const q = ev.target.value; setSearch(q);
                if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
                if (!q.trim()) { setSuggests([]); return; }
                debounceTimer.current = window.setTimeout(async () => {
                  try {
                    setLoading(true);
                    const url = new URL("https://nominatim.openstreetmap.org/search");
                    url.searchParams.set("format", "jsonv2"); url.searchParams.set("q", q);
                    url.searchParams.set("viewbox", "20.36,54.78,20.58,54.62"); url.searchParams.set("bounded", "1");
                    url.searchParams.set("addressdetails", "1"); url.searchParams.set("limit", "6");
                    const res = await fetch(url.toString(), { headers: { "Accept-Language": "ru" } });
                    const data = await res.json(); setSuggests(Array.isArray(data) ? data : []);
                  } finally { setLoading(false); }
                }, 320) as unknown as number;
              }}
              onKeyDown={async (ev) => {
                if (ev.key === "Enter" && suggests[0] && mapRef) {
                  const s = suggests[0]; const lat = parseFloat(s.lat); const lon = parseFloat(s.lon);
                  try { mapRef.flyTo({ center: [lon, lat], zoom: 15, speed: 1.2 }); } catch {}
                }
              }}
            />
            {Boolean(suggests.length) && (
              <div className={styles.suggests}>
                {suggests.map((s, i) => (
                  <button key={i} className={styles.suggestItem} onClick={() => {
                    if (!mapRef) return; const lat = parseFloat(s.lat); const lon = parseFloat(s.lon);
                    try { mapRef.flyTo({ center: [lon, lat], zoom: 15, speed: 1.2 }); } catch {}
                    setSuggests([]); setSearch(s.display_name || "");
                  }}>{s.display_name}</button>
                ))}
                {loading && <div className={styles.suggestLoading}>Поиск…</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


