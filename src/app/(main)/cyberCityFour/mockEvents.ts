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

function randomInRange(base: number, range = 0.03) {
  return +(base + (Math.random() - 0.5) * range).toFixed(5);
}

function randomDate() {
  const now = new Date("2025-11-01");
  const offsetDays = Math.floor(Math.random() * 30); // в пределах ноября
  const date = new Date(now);
  date.setDate(now.getDate() + offsetDays);
  return date.toISOString().split("T")[0];
}

export const mockEvents: CityEvent[] = Array.from({ length: 50 }, (_, i) => {
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

// Старые статичные данные (закомментированы для возможного использования)
/*
export const mockEventsStatic: CityEvent[] = [
  {
    id: "e1",
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
    id: "e2",
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
    id: "e3",
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
    id: "e4",
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
    id: "e5",
    name: "IT-митап",
    place: "Kaliningrad Tech",
    description: "Встреча разработчиков: доклады и networking",
    category: "meetup",
    lat: 54.7310,
    lng: 20.4990,
    eventDate: "2025-11-09",
    isDateTbd: false,
    timeFrom: "18:30",
    timeTo: "21:00",
    regedUsers: 152,
  },
  {
    id: "e6",
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
  {
    id: "e7",
    name: "Фестиваль уличной музыки",
    place: "Набережная",
    description: "Сеты локальных музыкантов на открытом воздухе",
    category: "festival",
    lat: 54.7112,
    lng: 20.5220,
    eventDate: "2025-11-23",
    isDateTbd: false,
    timeFrom: "14:00",
    timeTo: "20:00",
    regedUsers: 278,
  },
  {
    id: "e8",
    name: "Фотовыставка: Город и свет",
    place: "Галерея на Ленинском",
    description: "Ночная архитектура Калининграда в объективе",
    category: "exhibit",
    lat: 54.7050,
    lng: 20.4988,
    eventDate: "2025-11-03",
    isDateTbd: false,
    timeFrom: "10:00",
    timeTo: "18:00",
    regedUsers: 74,
  },
];
*/
