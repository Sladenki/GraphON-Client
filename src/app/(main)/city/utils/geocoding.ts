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
  
  console.log(`📦 Local DB: ${foundCount} found, ${notFoundCount} using default coords`);
  console.log(`✅ Geocoded ${eventsWithCoords.length} events`);
  return eventsWithCoords;
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

