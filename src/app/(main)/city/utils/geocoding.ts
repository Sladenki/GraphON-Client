/**
 * Утилиты для геокодирования адресов
 * 
 * Преобразует адрес в координаты для отображения на карте
 * Использует только локальную базу известных мест Калининграда
 */

import type { CityEventAPI, CityEvent } from "../mockEvents";
import { findPlaceInDatabase, geocodeByParsing } from "./kaliningradPlaces";

/**
 * Кеш координат для адресов
 * Для ускорения повторных поисков
 */
const geocodeCache = new Map<string, { lat: number; lng: number }>();

/**
 * Синхронное геокодирование через локальную базу известных мест
 * 
 * @param address - Адрес для геокодирования
 * @returns Координаты {lat, lng} или null если не найдено
 */
export function geocodeAddressSync(address: string): { lat: number; lng: number } | null {
  // Проверяем кеш
  if (geocodeCache.has(address)) {
    return geocodeCache.get(address)!;
  }

  // 1. Пробуем найти в локальной базе известных мест (синхронно, мгновенно)
  const placeFromDB = findPlaceInDatabase(address);
  if (placeFromDB) {
    const coords = { lat: placeFromDB.lat, lng: placeFromDB.lng };
    geocodeCache.set(address, coords);
    return coords;
  }

  // 2. Пробуем парсинг адреса (синхронно, мгновенно)
  const parsedCoords = geocodeByParsing(address);
  if (parsedCoords) {
    geocodeCache.set(address, parsedCoords);
    return parsedCoords;
  }

  return null;
}

/**
 * Асинхронная обертка для синхронного геокодирования (для совместимости)
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  return geocodeAddressSync(address);
}

/**
 * Нормализация названия места для группировки
 */
function normalizePlaceName(place: string): string {
  return place
    .toLowerCase()
    .trim()
    .replace(/["«»„“]/g, '') // Удаляем кавычки
    .replace(/\s+/g, ' '); // Нормализуем пробелы
}

/**
 * Разброс событий с одинаковым местом, чтобы они не наслаивались
 * 
 * @param events - События с координатами
 * @returns События с разбросанными координатами
 */
function spreadEventsAtSameLocation(events: CityEvent[]): CityEvent[] {
  // Группируем события по месту (нормализованному) и координатам
  const eventsByLocation = new Map<string, CityEvent[]>();
  
  for (const event of events) {
    // Используем комбинацию нормализованного места и округленных координат
    // Это позволяет группировать события, которые находятся очень близко друг к другу
    const normalizedPlace = normalizePlaceName(event.place);
    const roundedLat = Math.round(event.lat * 10000) / 10000; // Округляем до ~11 метров
    const roundedLng = Math.round(event.lng * 10000) / 10000;
    const locationKey = `${normalizedPlace}_${roundedLat}_${roundedLng}`;
    
    if (!eventsByLocation.has(locationKey)) {
      eventsByLocation.set(locationKey, []);
    }
    eventsByLocation.get(locationKey)!.push(event);
  }
  
  const spreadEvents: CityEvent[] = [];
  
  // Для каждой группы мест добавляем смещение
  for (const [locationKey, locationEvents] of eventsByLocation.entries()) {
    if (locationEvents.length === 1) {
      // Если только одно событие, оставляем координаты как есть
      spreadEvents.push(locationEvents[0]);
    } else {
      // Если несколько событий в одном месте, разбрасываем их по кругу
      const baseEvent = locationEvents[0];
      const baseLat = baseEvent.lat;
      const baseLng = baseEvent.lng;
      
      // Радиус разброса зависит от количества событий
      // Для 2-3 событий: ~100м, для 4-6: ~150м, для больше: ~200м
      const count = locationEvents.length;
      const baseRadius = count <= 3 ? 0.001 : count <= 6 ? 0.0015 : 0.002;
      
      locationEvents.forEach((event, index) => {
        // Распределяем события по кругу равномерно
        const angle = (index * 2 * Math.PI) / count;
        const offsetLat = Math.cos(angle) * baseRadius;
        const offsetLng = Math.sin(angle) * baseRadius;
        
        spreadEvents.push({
          ...event,
          lat: baseLat + offsetLat,
          lng: baseLng + offsetLng,
        });
      });
    }
  }
  
  return spreadEvents;
}

/**
 * Геокодирование массива событий
 * 
 * Использует только локальную базу известных мест (синхронно, мгновенно)
 * 
 * @param events - События из API (без координат)
 * @returns События с координатами
 */
export async function geocodeEvents(events: CityEventAPI[]): Promise<CityEvent[]> {
  console.log(`🗺️ Geocoding ${events.length} events using local database...`);
  
  const eventsWithCoords: CityEvent[] = [];
  let foundCount = 0;
  let notFoundCount = 0;
  
  // Обрабатываем все события локально (синхронно, мгновенно)
  for (const event of events) {
    const coords = geocodeAddressSync(event.place);
    
    if (coords) {
      foundCount++;
      eventsWithCoords.push({
        ...event,
        lat: coords.lat,
        lng: coords.lng,
      });
    } else {
      notFoundCount++;
      // Если не найдено локально, используем дефолтные координаты центра Калининграда
      eventsWithCoords.push({
        ...event,
        lat: 54.7068,
        lng: 20.5103,
      });
    }
  }
  
  // Разбрасываем события с одинаковым местом
  const spreadEvents = spreadEventsAtSameLocation(eventsWithCoords);
  
  console.log(`📦 Local DB: ${foundCount} found, ${notFoundCount} using default coords`);
  console.log(`✅ Geocoded ${spreadEvents.length} events`);
  return spreadEvents;
}

/**
 * Очистить кеш геокодирования
 */
export function clearGeocodeCache() {
  geocodeCache.clear();
  console.log('🗑️ Geocode cache cleared');
}

/**
 * Получить размер кеша
 */
export function getGeocodeStatistics() {
  return {
    cached: geocodeCache.size,
    entries: Array.from(geocodeCache.entries()),
  };
}

