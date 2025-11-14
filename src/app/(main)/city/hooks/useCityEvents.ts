/**
 * Хук для получения событий города с геокодированием
 * 
 * Автоматически преобразует адреса из API в координаты для карты
 */

import { useEffect, useState, useMemo } from 'react';
import type { CityEventAPI, CityEvent } from '../mockEvents';
import { geocodeEvents } from '../utils/geocoding';

/**
 * Хук для получения событий с автоматическим геокодированием
 * 
 * Процесс:
 * 1. Получаем события из API (без координат)
 * 2. Геокодируем адреса → получаем координаты
 * 3. Возвращаем события с координатами для карты
 * 
 * @param eventsFromAPI - События из API (только адрес, без lat/lng)
 * @returns События с координатами + состояние загрузки
 * 
 * @example
 * // В будущем с реальным API:
 * const { data: eventsFromAPI } = await fetch('/api/city-events');
 * const { events, isGeocoding } = useCityEventsWithGeocoding(eventsFromAPI);
 */
export function useCityEventsWithGeocoding(eventsFromAPI: CityEventAPI[]) {
  const [events, setEvents] = useState<CityEvent[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventsFromAPI || eventsFromAPI.length === 0) {
      setEvents([]);
      return;
    }

    const processEvents = async () => {
      setIsGeocoding(true);
      setError(null);
      
      try {
        // Геокодируем адреса
        const eventsWithCoords = await geocodeEvents(eventsFromAPI);
        setEvents(eventsWithCoords);
      } catch (err) {
        console.error('❌ Error geocoding events:', err);
        setError('Ошибка определения координат');
        
        // Fallback: используем дефолтные координаты
        const eventsWithDefaultCoords = eventsFromAPI.map(event => ({
          ...event,
          lat: 54.7068,
          lng: 20.5103,
        }));
        setEvents(eventsWithDefaultCoords);
      } finally {
        setIsGeocoding(false);
      }
    };

    processEvents();
  }, [eventsFromAPI]);

  return { events, isGeocoding, error };
}

/**
 * Хук для работы с моковыми данными (для разработки)
 * Моки уже содержат координаты, поэтому геокодирование не нужно
 */
export function useMockEvents(mockEvents: CityEvent[]) {
  return useMemo(() => ({
    events: mockEvents,
    isGeocoding: false,
    error: null,
  }), [mockEvents]);
}

