/**
 * База известных мест Калининграда с координатами
 * Используется для локального геокодирования без API
 */

export interface PlaceCoordinates {
  lat: number;
  lng: number;
  name: string;
  aliases?: string[]; // Альтернативные названия
}

/**
 * База известных мест Калининграда
 */
export const KALININGRAD_PLACES: PlaceCoordinates[] = [
  // Основные площади и улицы
  { lat: 54.7072, lng: 20.5101, name: "Площадь Победы", aliases: ["пл. Победы", "площадь победы"] },
  { lat: 54.7064, lng: 20.5146, name: "Кафедральный собор", aliases: ["собор", "кафедральный"] },
  { lat: 54.7202, lng: 20.5065, name: "Музей изобразительных искусств", aliases: ["музей", "художественный музей"] },
  { lat: 54.7168, lng: 20.5069, name: "КГТУ", aliases: ["кгту", "калининградский технический", "технический университет"] },
  { lat: 54.7310, lng: 20.4990, name: "Kaliningrad Tech", aliases: ["калининград тех", "тех"] },
  { lat: 54.6985, lng: 20.4875, name: "Дом искусств", aliases: ["дом искусств"] },
  { lat: 54.7050, lng: 20.4988, name: "Галерея", aliases: ["галерея на ленинском", "галерея"] },
  { lat: 54.7112, lng: 20.5220, name: "Набережная", aliases: ["набережная", "преголя"] },
  { lat: 54.7110, lng: 20.5150, name: "Рыбная деревня", aliases: ["рыбная деревня", "деревня"] },
  { lat: 54.7100, lng: 20.5080, name: "Остров Канта", aliases: ["остров", "остров канта"] },
  
  // Улицы
  { lat: 54.7070, lng: 20.5120, name: "улица Канта", aliases: ["ул. канта", "канта"] },
  { lat: 54.7080, lng: 20.5050, name: "проспект Мира", aliases: ["пр. мира", "проспект мира", "пр мир"] },
  { lat: 54.7150, lng: 20.5100, name: "проспект Ленинский", aliases: ["пр. ленинский", "ленинский", "ленинский проспект"] },
  { lat: 54.7120, lng: 20.5000, name: "проспект Московский", aliases: ["пр. московский", "московский"] },
  { lat: 54.7090, lng: 20.5200, name: "улица Багратиона", aliases: ["ул. багратиона", "багратиона"] },
  { lat: 54.7130, lng: 20.4950, name: "улица Октябрьская", aliases: ["ул. октябрьская", "октябрьская"] },
  { lat: 54.7140, lng: 20.5030, name: "улица Фрунзе", aliases: ["ул. фрунзе", "фрунзе"] },
  { lat: 54.7100, lng: 20.5020, name: "улица Профессора Баранова", aliases: ["ул. профессора баранова", "профессора баранова", "баранова"] },
  { lat: 54.7080, lng: 20.5150, name: "улица Портовая", aliases: ["ул. портовая", "портовая"] },
  { lat: 54.7060, lng: 20.5080, name: "улица Тельмана", aliases: ["ул. тельмана", "тельмана"] },
  { lat: 54.7120, lng: 20.5050, name: "улица Шевченко", aliases: ["ул. шевченко", "шевченко"] },
  { lat: 54.7090, lng: 20.5100, name: "улица Красная", aliases: ["ул. красная", "красная"] },
  { lat: 54.7110, lng: 20.4970, name: "улица Комсомольская", aliases: ["ул. комсомольская", "комсомольская"] },
  { lat: 54.7070, lng: 20.5180, name: "улица Генерала Галицкого", aliases: ["ул. генерала галицкого", "генерала галицкого", "галицкого"] },
  
  // Парки и скверы
  { lat: 54.7080, lng: 20.5000, name: "Центральный парк", aliases: ["центральный парк", "парк"] },
  { lat: 54.7100, lng: 20.4950, name: "Парк Юности", aliases: ["парк юности", "юности"] },
  { lat: 54.7120, lng: 20.5100, name: "Парк культуры", aliases: ["парк культуры", "культуры"] },
  { lat: 54.7050, lng: 20.5200, name: "Парк скульптур", aliases: ["парк скульптур", "скульптур"] },
  
  // Культурные объекты
  { lat: 54.7040, lng: 20.5000, name: "Драмтеатр", aliases: ["драмтеатр", "драматический театр", "театр"] },
  { lat: 54.7070, lng: 20.5050, name: "Дворец культуры", aliases: ["дворец культуры", "дк"] },
  { lat: 54.7060, lng: 20.5120, name: "Кинотеатр Заря", aliases: ["кинотеатр заря", "заря"] },
  { lat: 54.7080, lng: 20.5080, name: "Библиотека им. Чехова", aliases: ["библиотека", "библиотека чехова", "чехова"] },
  { lat: 54.7100, lng: 20.5030, name: "Выставочный зал", aliases: ["выставочный зал", "выставка"] },
  { lat: 54.7110, lng: 20.5000, name: "Культурный центр", aliases: ["культурный центр", "кц"] },
  { lat: 54.7090, lng: 20.5150, name: "Музей Мирового океана", aliases: ["музей мирового океана", "океан", "мировой океан"] },
  { lat: 54.7050, lng: 20.5180, name: "Бункер", aliases: ["бункер", "музей бункер"] },
  
  // Спортивные объекты
  { lat: 54.7130, lng: 20.5080, name: "Спорткомплекс", aliases: ["спорткомплекс", "спорт", "спортивный комплекс"] },
  { lat: 54.7140, lng: 20.5120, name: "Дворец спорта Янтарный", aliases: ["дворец спорта", "янтарный", "дворец янтарный"] },
  
  // Торговые центры
  { lat: 54.7070, lng: 20.5100, name: "ТЦ Европа", aliases: ["тц европа", "европа", "торговый центр европа"] },
  { lat: 54.7080, lng: 20.5070, name: "Торговый центр", aliases: ["торговый центр", "тц"] },
  
  // Вокзалы и транспорт
  { lat: 54.7090, lng: 20.5020, name: "Железнодорожный вокзал", aliases: ["вокзал", "ж/д вокзал", "железнодорожный"] },
  { lat: 54.7100, lng: 20.5000, name: "Автовокзал", aliases: ["автовокзал", "автостанция"] },
  
  // Районы
  { lat: 54.7150, lng: 20.5050, name: "Центральный район", aliases: ["центр", "центральный"] },
  { lat: 54.7000, lng: 20.5200, name: "Ленинградский район", aliases: ["ленинградский"] },
  { lat: 54.7200, lng: 20.4950, name: "Московский район", aliases: ["московский район"] },
];

/**
 * Нормализация текста для поиска
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ё]/g, 'е')
    .replace(/[ъь]/g, '')
    .replace(/[.,\-()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Поиск места в базе по адресу
 */
export function findPlaceInDatabase(address: string): PlaceCoordinates | null {
  const normalizedAddress = normalizeText(address);
  
  // Прямое совпадение
  for (const place of KALININGRAD_PLACES) {
    const normalizedName = normalizeText(place.name);
    if (normalizedAddress.includes(normalizedName) || normalizedName.includes(normalizedAddress)) {
      return place;
    }
    
    // Проверка алиасов
    if (place.aliases) {
      for (const alias of place.aliases) {
        const normalizedAlias = normalizeText(alias);
        if (normalizedAddress.includes(normalizedAlias) || normalizedAlias.includes(normalizedAddress)) {
          return place;
        }
      }
    }
  }
  
  // Поиск по ключевым словам в адресе
  const addressWords = normalizedAddress.split(' ');
  for (const word of addressWords) {
    if (word.length < 3) continue; // Пропускаем короткие слова
    
    for (const place of KALININGRAD_PLACES) {
      const normalizedName = normalizeText(place.name);
      if (normalizedName.includes(word)) {
        return place;
      }
      
      if (place.aliases) {
        for (const alias of place.aliases) {
          const normalizedAlias = normalizeText(alias);
          if (normalizedAlias.includes(word)) {
            return place;
          }
        }
      }
    }
  }
  
  return null;
}

/**
 * Парсинг адреса для извлечения улицы и номера
 */
function parseAddress(address: string): { street?: string; number?: string; building?: string } {
  const normalized = normalizeText(address);
  
  // Паттерны для улиц
  const streetPatterns = [
    /(?:ул|улица|проспект|пр|площадь|пл|переулок|пер|бульвар|б-р|набережная|наб)[\s.]+([а-яё\s]+?)(?:\s|$|,|\d)/i,
    /([а-яё\s]+?)\s+(?:ул|улица|проспект|пр|площадь|пл)/i,
  ];
  
  // Паттерны для номеров
  const numberPatterns = [
    /\d+[а-я]?/,
    /№\s*\d+/,
  ];
  
  let street: string | undefined;
  let number: string | undefined;
  
  for (const pattern of streetPatterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      street = match[1].trim();
      break;
    }
  }
  
  for (const pattern of numberPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      number = match[0].replace(/№\s*/, '').trim();
      break;
    }
  }
  
  return { street, number };
}

/**
 * Получить координаты на основе парсинга адреса
 */
export function geocodeByParsing(address: string): { lat: number; lng: number } | null {
  const parsed = parseAddress(address);
  
  if (parsed.street) {
    // Ищем улицу в базе
    const normalizedStreet = normalizeText(parsed.street);
    for (const place of KALININGRAD_PLACES) {
      const normalizedName = normalizeText(place.name);
      if (normalizedName.includes(normalizedStreet) || normalizedStreet.includes(normalizedName)) {
        // Если есть номер дома, немного смещаем координаты
        let lat = place.lat;
        let lng = place.lng;
        
        if (parsed.number) {
          const num = parseInt(parsed.number);
          if (!isNaN(num)) {
            // Смещение в зависимости от номера (примерно 0.001 градуса на 10 домов)
            const offset = (num % 100) * 0.0001;
            lat += offset * 0.5;
            lng += offset;
          }
        }
        
        return { lat, lng };
      }
    }
  }
  
  return null;
}

