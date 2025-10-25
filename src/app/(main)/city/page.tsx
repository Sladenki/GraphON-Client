"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import styles from "./page.module.scss";
import "leaflet/dist/leaflet.css";

type ThemeMode = "light" | "dark";

type EventCategory = "concert" | "exhibit" | "lecture" | "festival" | "meetup";

interface CityEvent {
  id: string;
  name: string;
  place: string;
  description: string;
  category: EventCategory;
  lat: number;
  lng: number;
  eventDate: string; // ISO date
  isDateTbd: boolean;
  timeFrom?: string;
  timeTo?: string;
  regedUsers: number;
}

const KalCenter = { lat: 54.7104, lng: 20.4522 };

const mockEvents: CityEvent[] = [
  {
    id: "1",
    name: "Концерт камерной музыки",
    place: "Кафедральный собор",
    description: "Вечер органной и камерной музыки",
    category: "concert",
    lat: 54.7064,
    lng: 20.5146,
    eventDate: "2025-11-05",
    isDateTbd: false,
    timeFrom: "19:00",
    timeTo: "21:00",
    regedUsers: 134,
  },
  {
    id: "2",
    name: "Выставка современного искусства",
    place: "Музей изобразительных искусств",
    description: "Экспозиция молодых художников",
    category: "exhibit",
    lat: 54.7202,
    lng: 20.5065,
    eventDate: "2025-11-12",
    isDateTbd: false,
    timeFrom: "11:00",
    timeTo: "19:00",
    regedUsers: 89,
  },
  {
    id: "3",
    name: "Лекция по урбанистике",
    place: "КГТУ",
    description: "Публичная лекция о трансформации городских пространств",
    category: "lecture",
    lat: 54.7168,
    lng: 20.5069,
    eventDate: "2025-11-15",
    isDateTbd: false,
    timeFrom: "17:30",
    timeTo: "19:00",
    regedUsers: 57,
  },
  {
    id: "4",
    name: "Городской фестиваль еды",
    place: "Центральная площадь",
    description: "Фудкорты, музыка, мастер-классы",
    category: "festival",
    lat: 54.7072,
    lng: 20.5101,
    eventDate: "2025-11-20",
    isDateTbd: false,
    timeFrom: "12:00",
    timeTo: "22:00",
    regedUsers: 403,
  },
  {
    id: "5",
    name: "IT-митап",
    place: "Коворкинг " + "Kaliningrad Tech",
    description: "Встреча разработчиков: доклады и networking",
    category: "meetup",
    lat: 54.731,
    lng: 20.499,
    eventDate: "2025-11-09",
    isDateTbd: false,
    timeFrom: "18:30",
    timeTo: "21:00",
    regedUsers: 152,
  },
  {
    id: "6",
    name: "Арт-лекция: Кандинский",
    place: "Дом искусств",
    description: "О языках абстракции и композиции",
    category: "lecture",
    lat: 54.6985,
    lng: 20.4875,
    eventDate: "2025-11-17",
    isDateTbd: true,
    regedUsers: 61,
  },
];

const MapContainer = dynamic(async () => (await import("react-leaflet")).MapContainer, { ssr: false });
const TileLayer = dynamic(async () => (await import("react-leaflet")).TileLayer, { ssr: false });
const Marker = dynamic(async () => (await import("react-leaflet")).Marker, { ssr: false });
const Popup = dynamic(async () => (await import("react-leaflet")).Popup, { ssr: false });

// Leaflet icon fix: we'll use DivIcon for glow
import L from "leaflet";

function buildGlowIcon(category: EventCategory, hovered: boolean) {
  const colorClass =
    category === "concert" ? styles.c_concert :
    category === "exhibit" ? styles.c_exhibit :
    category === "lecture" ? styles.c_lecture :
    category === "festival" ? styles.c_festival :
    styles.c_meetup;

  const klass = `${styles.glowMarker} ${colorClass} ${hovered ? styles.markerHover : ""}`;
  const html = `<div class="${klass}"><div class="${styles.pulseRing}" style="color:inherit"></div></div>`;
  return L.divIcon({ className: "", html, iconSize: [18, 18], iconAnchor: [9, 9] });
}

export default function CityPage() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [active, setActive] = useState<Record<EventCategory, boolean>>({
    concert: true,
    exhibit: true,
    lecture: true,
    festival: true,
    meetup: true,
  });
  const [hoverId, setHoverId] = useState<string | null>(null);

  const filtered = useMemo(() =>
    mockEvents.filter(e => active[e.category])
  , [active]);

  const url = theme === "dark"
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div className={styles.title}>Карта событий — Калининград</div>
        <div className={styles.filters}>
          {(["concert","exhibit","lecture","festival","meetup"] as EventCategory[]).map(c => (
            <button
              key={c}
              type="button"
              className={styles.chip}
              data-active={active[c]}
              onClick={() => setActive(prev => ({ ...prev, [c]: !prev[c] }))}
              aria-pressed={active[c]}
            >
              {c === "concert" && "Концерты"}
              {c === "exhibit" && "Выставки"}
              {c === "lecture" && "Лекции"}
              {c === "festival" && "Фестивали"}
              {c === "meetup" && "Митапы"}
            </button>
          ))}
        </div>
        <div className={styles.filters}>
          <button
            type="button"
            className={styles.chip}
            data-active={theme === "light"}
            onClick={() => setTheme("light")}
          >Светлая</button>
          <button
            type="button"
            className={styles.chip}
            data-active={theme === "dark"}
            onClick={() => setTheme("dark")}
          >Тёмная</button>
        </div>
      </div>

      <div className={styles.mapWrap}>
        <MapContainer center={[KalCenter.lat, KalCenter.lng]} zoom={13} className={styles.map} preferCanvas>
          <TileLayer url={url} />
          {filtered.map(ev => (
            <Marker
              key={ev.id}
              position={[ev.lat, ev.lng]}
              icon={buildGlowIcon(ev.category, hoverId === ev.id)}
              eventHandlers={{
                mouseover: () => setHoverId(ev.id),
                mouseout: () => setHoverId(curr => (curr === ev.id ? null : curr)),
              }}
            >
              <Popup>
                <strong>{ev.name}</strong>
                <div>{ev.place}</div>
                <div>
                  {ev.isDateTbd ? "Дата уточняется" : ev.eventDate}
                  {ev.timeFrom ? ` • ${ev.timeFrom}${ev.timeTo ? "–" + ev.timeTo : ""}` : ""}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}


