export type EventCategory = "music" | "art" | "education" | "business" | "sport" | "humor" | "gastro" | "family" | "city" | "party" | "meetup" | "cinema" | "theater";

/**
 * Интерфейс события из API (БД)
 * ⚠️ НЕ содержит координат! Только адрес.
 */
export interface CityEventAPI {
  id: string;
  name: string;
  place: string; // АДРЕС из БД: "ул. Профессора Баранова 43 (актовый зал)"
  description: string;
  category: EventCategory;
  eventDate: string; // ISO date: "2025-11-05"
  isDateTbd: boolean;
  timeFrom?: string; // "19:00"
  timeTo?: string; // "21:00"
  regedUsers: number;
}

/**
 * Интерфейс события с координатами (для клиента)
 * Используется после геокодирования адреса
 */
export interface CityEvent extends CityEventAPI {
  lat: number; // Широта (получена через геокодирование)
  lng: number; // Долгота (получена через геокодирование)
}

// ===== ГЕНЕРАТОР СЛУЧАЙНЫХ МЕРОПРИЯТИЙ =====

const categories: EventCategory[] = ["music", "art", "education", "business", "sport", "humor", "gastro", "family", "city", "party", "meetup", "cinema", "theater"];

const places = [
  "ул. Канта 1 (Кафедральный собор)",
  "пр. Московский 60-62 (Дом искусств)",
  "пр. Мира 83 (Музей изобразительных искусств)",
  "пл. Победы (Центральная площадь)",
  "ул. Портовая (Набережная)",
  "ул. Профессора Баранова 43 (Kaliningrad Tech)",
  "Советский пр. 1 (КГТУ)",
  "пр. Ленинский 24 (Галерея)",
  "ул. Тельмана 3 (Парк Юности)",
  "пр. Мира 4 (Драмтеатр)",
  "ул. Фрунзе 5 (Библиотека им. Чехова)",
  "пр. Победы 1 (ТЦ Европа)",
  "ул. Октябрьская 3 (Кинотеатр Заря)",
  "ул. Багратиона 2 (Рыбная деревня)",
  "пр. Мира 26 (Центральный парк)",
  "ул. Ленинский проспект 30 (Спорткомплекс)",
  "ул. Генерала Галицкого 1 (Музей Мирового океана)",
  "пр. Мира 9 (Дворец культуры)",
  "ул. Шевченко 5 (Парк культуры)",
  "пр. Ленинский 65 (Торговый центр)",
  "ул. Красная 1 (Площадь Победы)",
  "ул. Комсомольская 4 (Культурный центр)",
  "пр. Мира 12 (Выставочный зал)",
  "ул. Багратиона 8 (Набережная Преголи)",
  "ул. Октябрьская 10 (Парк скульптур)",
];

const namesByCategory: Record<EventCategory, string[]> = {
  music: [
    "Концерт камерной музыки",
    "Джазовый вечер",
    "Органная симфония",
    "Рок-фест Балтика",
    "Музыкальная ночь",
  ],
  art: [
    "Выставка современного искусства",
    "Фотовыставка: Город и свет",
    "Инсталляции будущего",
    "Дизайн XXI века",
    "Скульптуры Калининграда",
  ],
  education: [
    "Арт-лекция: Кандинский",
    "Лекция по урбанистике",
    "Наука и культура города",
    "Как работает архитектура",
    "Город без пробок",
  ],
  business: [
    "IT-митап",
    "Frontend Meetup",
    "Product Night",
    "AI & Design Talk",
    "Startup Networking",
  ],
  sport: [
    "Городской марафон",
    "Турнир по футболу",
    "Йога в парке",
    "Велозаезд",
    "Мастер-класс по боксу",
  ],
  humor: [
    "Stand-Up вечер",
    "Импровизационный театр",
    "Комедийный концерт",
    "КВН",
    "Comedy Battle",
  ],
  gastro: [
    "Фестиваль уличной еды",
    "Дегустация вин",
    "Мастер-класс от шефа",
    "Кулинарный тур",
    "Вечер крафтового пива",
  ],
  family: [
    "Семейный квест",
    "Детский праздник",
    "Мастер-класс для детей",
    "Семейный пикник",
    "День открытых дверей",
  ],
  city: [
    "Субботник",
    "Городской форум",
    "Встреча с мэром",
    "Благоустройство парка",
    "Экскурсия по городу",
  ],
  party: [
    "Вечеринка на крыше",
    "Танцевальная ночь",
    "Электронная музыка",
    "Клубная вечеринка",
    "Open Air Party",
  ],
  meetup: [
    "Нетворкинг встреча",
    "Встреча выпускников",
    "Клуб по интересам",
    "Дискуссионный клуб",
    "Встреча единомышленников",
  ],
  cinema: [
    "Кинопоказ в музее",
    "Фестиваль короткого метра",
    "Ретроспектива классики",
    "Кинолекторий",
    "Ночь кино",
  ],
  theater: [
    "Спектакль на малой сцене",
    "Театральная премьера",
    "Экспериментальный театр",
    "Моноспектакль",
    "Драматическая постановка",
  ],
};

// Калининград (примерный диапазон координат)
const baseLat = 54.71;
const baseLng = 20.51;

function randomInRange(base: number, range = 0.08) {
  return +(base + (Math.random() - 0.5) * range).toFixed(5);
}

function randomDate() {
  const now = new Date("2025-11-01");
  const offsetDays = Math.floor(Math.random() * 30); // в пределах ноября
  const date = new Date(now);
  date.setDate(now.getDate() + offsetDays);
  return date.toISOString().split("T")[0];
}

export const mockEvents: CityEvent[] = Array.from({ length: 30 }, (_, i) => {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const name =
    namesByCategory[category][
      Math.floor(Math.random() * namesByCategory[category].length)
    ];

  return {
    id: `e${i + 1}`,
    name,
    place: places[Math.floor(Math.random() * places.length)],
    description: `Описание события "${name}". Интересные спикеры, приятная атмосфера и новые впечатления.`,
    category,
    lat: randomInRange(baseLat),
    lng: randomInRange(baseLng),
    eventDate: randomDate(),
    isDateTbd: Math.random() < 0.1,
    timeFrom: ["10:00", "11:00", "14:00", "17:00", "19:00"][Math.floor(Math.random() * 5)],
    timeTo: ["18:00", "20:00", "21:00", "22:00"][Math.floor(Math.random() * 4)],
    regedUsers: Math.floor(Math.random() * 400) + 10,
  };
});
