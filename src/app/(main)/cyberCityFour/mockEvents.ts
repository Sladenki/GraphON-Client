export type EventCategory = "concert" | "exhibit" | "lecture" | "festival" | "meetup";

export interface CityEvent {
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

// Примерные координаты в пределах Калининграда
export const mockEvents: CityEvent[] = [
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


