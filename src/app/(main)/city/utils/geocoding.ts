/**
 * Утилиты для геокодирования адресов
 * 
 * Преобразует адрес в координаты для отображения на карте
 */

import type { CityEventAPI, CityEvent } from "../mockEvents";

/**
 * Кеш координат для адресов
 * Чтобы не делать повторные запросы к API геокодирования
 */
const geocodeCache = new Map<string, { lat: number; lng: number }>();

/**
 * Геокодирование одного адреса через Яндекс.Карты API
 * 
 * TODO: Заменить на реальный API ключ перед продакшеном
 * 
 * @param address - Адрес для геокодирования
 * @returns Координаты {lat, lng} или null если не найдено
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  // Проверяем кеш
  if (geocodeCache.has(address)) {
    console.log('📍 Geocode from cache:', address);
    return geocodeCache.get(address)!;
  }

  try {
    // TODO: Добавить реальный API ключ Яндекс.Карт
    const API_KEY = 'YOUR_YANDEX_GEOCODING_API_KEY';
    
    // Добавляем "Калининград" к адресу для точности
    const fullAddress = `${address}, Калининград, Россия`;
    
    const response = await fetch(
      `https://geocode-maps.yandex.ru/1.x/?geocode=${encodeURIComponent(fullAddress)}&format=json&apikey=${API_KEY}`
    );

    if (!response.ok) {
      console.error('❌ Geocoding API error:', response.status);
      return null;
    }

    const data = await response.json();
    const geoObject = data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;

    if (!geoObject) {
      console.warn('⚠️ Address not found:', address);
      return null;
    }

    // Парсим координаты (формат: "lng lat")
    const [lng, lat] = geoObject.Point.pos.split(' ').map(parseFloat);

    const coords = { lat, lng };
    
    // Сохраняем в кеш
    geocodeCache.set(address, coords);
    
    console.log('✅ Geocoded:', address, '→', coords);
    return coords;

  } catch (error) {
    console.error('❌ Geocoding error for', address, ':', error);
    return null;
  }
}

/**
 * Геокодирование массива событий
 * 
 * @param events - События из API (без координат)
 * @returns События с координатами
 */
export async function geocodeEvents(events: CityEventAPI[]): Promise<CityEvent[]> {
  console.log(`🗺️ Geocoding ${events.length} events...`);
  
  const eventsWithCoords: CityEvent[] = [];

  for (const event of events) {
    const coords = await geocodeAddress(event.place);
    
    if (coords) {
      // Добавляем координаты к событию
      eventsWithCoords.push({
        ...event,
        lat: coords.lat,
        lng: coords.lng,
      });
    } else {
      // Если геокодирование не удалось, используем координаты центра Калининграда
      console.warn('⚠️ Using default coords for:', event.place);
      eventsWithCoords.push({
        ...event,
        lat: 54.7068,
        lng: 20.5103,
      });
    }
  }

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

