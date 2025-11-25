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
  { lat: 54.7201, lng: 20.4999, name: "Площадь Победы", aliases: ["пл. Победы", "площадь победы", "площадь победы 1"] },
  { lat: 54.7068, lng: 20.5146, name: "Кафедральный собор", aliases: ["собор", "кафедральный", "кафедральный собор", "кёнигсбергский собор"] },
  { lat: 54.7045, lng: 20.5120, name: "Историко-художественный музей", aliases: ["историко-художественный музей", "исторический музей", "художественный музей", "музей изобразительных искусств", "коихм"] },
  { lat: 54.7168, lng: 20.5069, name: "КГТУ", aliases: ["кгту", "калининградский технический", "технический университет", "калининградский государственный технический университет", "советский проспект 1"] },
  { lat: 54.7220, lng: 20.5000, name: "Калининградский зоопарк", aliases: ["зоопарк", "калининградский зоопарк"] },
  { lat: 54.6985, lng: 20.4875, name: "Дом искусств", aliases: ["дом искусств"] },
  { lat: 54.7050, lng: 20.4988, name: "Галерея", aliases: ["галерея на ленинском", "галерея"] },
  { lat: 54.7090, lng: 20.4900, name: "Набережная Петра Великого", aliases: ["набережная", "преголя", "набережная петра великого"] },
  { lat: 54.7075, lng: 20.5083, name: "Рыбная деревня", aliases: ["рыбная деревня", "деревня", "октябрьская 2"] },
  { lat: 54.7068, lng: 20.5146, name: "Остров Канта", aliases: ["остров", "остров канта", "остров иммануила канта"] },
  
  // Улицы
  { lat: 54.7075, lng: 20.5130, name: "улица Канта", aliases: ["ул. канта", "канта", "ул канта 1"] },
  { lat: 54.7080, lng: 20.5050, name: "проспект Мира", aliases: ["пр. мира", "проспект мира", "пр мир"] },
  { lat: 54.7150, lng: 20.5100, name: "проспект Ленинский", aliases: ["пр. ленинский", "ленинский", "ленинский проспект"] },
  { lat: 54.7120, lng: 20.5000, name: "проспект Московский", aliases: ["пр. московский", "московский", "московский проспект"] },
  { lat: 54.6986, lng: 20.4972, name: "улица Багратиона", aliases: ["ул. багратиона", "багратиона", "ул багратиона 137"] },
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
  { lat: 54.7068, lng: 20.5146, name: "Парк скульптур", aliases: ["парк скульптур", "скульптур", "парк скульптуры на острове канта"] },
  
  // Культурные объекты
  { lat: 54.7040, lng: 20.5000, name: "Драмтеатр", aliases: ["драмтеатр", "драматический театр", "театр"] },
  { lat: 54.7070, lng: 20.5050, name: "Дворец культуры", aliases: ["дворец культуры", "дк"] },
  { lat: 54.7060, lng: 20.5120, name: "Кинотеатр Заря", aliases: ["кинотеатр заря", "заря", "кинотеатр"] },
  { lat: 54.7080, lng: 20.5080, name: "Библиотека им. Чехова", aliases: ["библиотека", "библиотека чехова", "чехова"] },
  { lat: 54.7100, lng: 20.5030, name: "Выставочный зал", aliases: ["выставочный зал", "выставка"] },
  { lat: 54.7110, lng: 20.5000, name: "Культурный центр", aliases: ["культурный центр", "кц"] },
  { lat: 54.7090, lng: 20.4900, name: "Музей Мирового океана", aliases: ["музей мирового океана", "океан", "мировой океан", "набережная петра великого 1"] },
  { lat: 54.7070, lng: 20.5100, name: "Бункер", aliases: ["бункер", "музей бункер", "бункер генерала ляша", "ул университетская 2а"] },
  { lat: 54.7181, lng: 20.5012, name: "Музей янтаря", aliases: ["музей янтаря", "янтарь", "пл маршала василевского 1"] },
  { lat: 54.6983, lng: 20.5294, name: "Фридландские ворота", aliases: ["фридландские ворота", "ул дзержинского 30"] },
  { lat: 54.6986, lng: 20.4972, name: "Бранденбургские ворота", aliases: ["бранденбургские ворота", "ул багратиона 137"] },
  { lat: 54.7050, lng: 20.4875, name: "Фридрихсбургские ворота", aliases: ["фридрихсбургские ворота", "ул портовая 39"] },
  { lat: 54.7190, lng: 20.5005, name: "Башня Врангеля", aliases: ["башня врангеля", "ул литовский вал 1"] },
  { lat: 54.7195, lng: 20.5078, name: "Бастион Грольман", aliases: ["бастион грольман", "бастион", "ул литовский вал 21"] },
  { lat: 54.7105, lng: 20.5143, name: "Дом Советов", aliases: ["дом советов", "центральная площадь 2"] },
  { lat: 54.7201, lng: 20.4995, name: "Собор Христа Спасителя", aliases: ["собор христа спасителя", "пл победы 1"] },
  { lat: 54.6950, lng: 20.4880, name: "Филармония", aliases: ["филармония", "калининградская филармония", "ул богдана хмельницкого 61а"] },
  { lat: 54.7020, lng: 20.4950, name: "Музыкальный театр", aliases: ["музыкальный театр", "музтеатр"] },
  { lat: 54.7030, lng: 20.4980, name: "Театр Николая Захарова", aliases: ["театр николая захарова", "театр захарова", "захарова"] },
  { lat: 54.7085, lng: 20.5090, name: "Дом книжного наследия XX века имени Н. С. Гумилёва", aliases: ["дом книжного наследия", "гумилёва", "дом гумилёва", "книжное наследие"] },
  { lat: 54.7120, lng: 20.5000, name: "Центр культуры молодёжи на Московском пр-кте", aliases: ["центр культуры молодёжи", "цкм", "московский проспект", "центр культуры"] },
  { lat: 54.6985, lng: 20.5123, name: "ДК железнодорожников", aliases: ["дк железнодорожников", "дворец культуры железнодорожников", "ж/д дк", "ул железнодорожная 2", "железнодорожная 2"] },
  
  // Спортивные объекты
  { lat: 54.7130, lng: 20.5080, name: "Спорткомплекс", aliases: ["спорткомплекс", "спорт", "спортивный комплекс"] },
  { lat: 54.7150, lng: 20.5200, name: "Дворец спорта Янтарный", aliases: ["дворец спорта", "янтарный", "дворец янтарный", "дс янтарный", "дс \"янтарный\"", "ул маршала баграмяна 167"] },
  { lat: 54.7150, lng: 20.5150, name: "Ростех Арена", aliases: ["ростех арена", "арена", "ростех"] },
  
  // Торговые центры
  { lat: 54.7085, lng: 20.5095, name: "ТЦ Европа", aliases: ["тц европа", "европа", "торговый центр европа", "пл победы"] },
  { lat: 54.7080, lng: 20.5070, name: "Торговый центр", aliases: ["торговый центр", "тц"] },
  
  // Вокзалы и транспорт
  { lat: 54.7090, lng: 20.5020, name: "Железнодорожный вокзал", aliases: ["вокзал", "ж/д вокзал", "железнодорожный"] },
  { lat: 54.7100, lng: 20.5000, name: "Автовокзал", aliases: ["автовокзал", "автостанция"] },
  
  // Районы
  { lat: 54.7150, lng: 20.5050, name: "Центральный район", aliases: ["центр", "центральный"] },
  { lat: 54.7000, lng: 20.5200, name: "Ленинградский район", aliases: ["ленинградский"] },
  { lat: 54.7200, lng: 20.4950, name: "Московский район", aliases: ["московский район"] },
  
  // Концертные залы и клубы
  { lat: 54.7000, lng: 20.4900, name: "Янтарь-Холл", aliases: ["янтарь-холл", "янтарь холл", "холл"] },
  { lat: 54.7050, lng: 20.4950, name: "Резиденция Королей", aliases: ["резиденция королей", "резиденция", "королей"] },
  { lat: 54.7070, lng: 20.5030, name: "Бастион", aliases: ["бастион", "клуб бастион"] },
  { lat: 54.7040, lng: 20.4970, name: "Yalta Club", aliases: ["yalta club", "yalta", "клуб yalta"] },
  { lat: 54.7060, lng: 20.5010, name: "Клуб Fiji", aliases: ["клуб fiji", "fiji", "fiji club"] },
  { lat: 54.7080, lng: 20.5040, name: "Лаунж-бар «Pravda»", aliases: ["лаунж-бар pravda", "pravda", "лаунж бар", "правда"] },
  { lat: 54.722514, lng: 20.46594, name: "Бар Советов", aliases: ["бар советов", "советов", "бар", "проспект мира 118", "пр мира 118", "пр. мира 118"] },
  { lat: 54.7117, lng: 20.4533, name: "Вагонка", aliases: ["вагонка", "клуб вагонка", "ул станочная 12", "станочная 12"] },
  
  // Кафе и рестораны
  { lat: 54.7055, lng: 20.4995, name: "Кафе «Солёная ворона»", aliases: ["кафе солёная ворона", "солёная ворона", "солевая ворона", "ворона"] },
];

/**
 * Нормализация текста для поиска
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ё]/g, 'е')
    .replace(/[ъь]/g, '')
    .replace(/["«»„“]/g, '') // Удаляем кавычки
    .replace(/[.,\-()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Поиск места в базе по адресу
 */
export function findPlaceInDatabase(address: string): PlaceCoordinates | null {
  const normalizedAddress = normalizeText(address);
  
  // Прямое совпадение (приоритет)
  for (const place of KALININGRAD_PLACES) {
    const normalizedName = normalizeText(place.name);
    if (normalizedAddress === normalizedName || 
        normalizedAddress.includes(normalizedName) || 
        normalizedName.includes(normalizedAddress)) {
      return place;
    }
    
    // Проверка алиасов
    if (place.aliases) {
      for (const alias of place.aliases) {
        const normalizedAlias = normalizeText(alias);
        if (normalizedAddress === normalizedAlias ||
            normalizedAddress.includes(normalizedAlias) || 
            normalizedAlias.includes(normalizedAddress)) {
          return place;
        }
      }
    }
  }
  
  // Поиск по ключевым словам в адресе (вторичный поиск)
  const addressWords = normalizedAddress.split(' ').filter(word => word.length >= 3);
  
  // Сначала ищем по длинным фразам (2+ слова)
  for (let i = 0; i < addressWords.length - 1; i++) {
    const phrase = `${addressWords[i]} ${addressWords[i + 1]}`;
    for (const place of KALININGRAD_PLACES) {
      const normalizedName = normalizeText(place.name);
      if (normalizedName.includes(phrase)) {
        return place;
      }
      if (place.aliases) {
        for (const alias of place.aliases) {
          const normalizedAlias = normalizeText(alias);
          if (normalizedAlias.includes(phrase)) {
            return place;
          }
        }
      }
    }
  }
  
  // Затем ищем по отдельным словам
  for (const word of addressWords) {
    for (const place of KALININGRAD_PLACES) {
      const normalizedName = normalizeText(place.name);
      if (normalizedName.includes(word) && word.length >= 4) { // Только для слов длиной >= 4
        return place;
      }
      
      if (place.aliases) {
        for (const alias of place.aliases) {
          const normalizedAlias = normalizeText(alias);
          if (normalizedAlias.includes(word) && word.length >= 4) {
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

