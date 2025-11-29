/**
 * Хук для получения событий города с геокодированием
 * 
 * Автоматически преобразует адреса из API в координаты для карты
 */

import { useEffect, useState, useMemo, useRef } from 'react';
import type { CityEventAPI, CityEvent } from '../mockEvents';
import { geocodeEvents } from '../utils/geocoding';

/**
 * Хук для получения событий с автоматическим геокодированием
 * 
 * Процесс:
 * 1. Сразу показываем события с дефолтными координатами (для быстрого отображения)
 * 2. В фоне геокодируем адреса → обновляем координаты по мере готовности
 * 
 * @param eventsFromAPI - События из API (только адрес, без lat/lng)
 * @returns События с координатами + состояние загрузки
 */
export function useCityEventsWithGeocoding(eventsFromAPI: CityEventAPI[]) {
  const [events, setEvents] = useState<CityEvent[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processingRef = useRef(false);
  const lastProcessedKeyRef = useRef<string>('');

  // Создаем стабильный ключ для сравнения данных
  const eventsKey = useMemo(() => {
    if (!eventsFromAPI || eventsFromAPI.length === 0) return '';
    // Используем только id и place для создания ключа
    return eventsFromAPI.map(e => `${e.id}:${e.place}`).sort().join('|');
  }, [eventsFromAPI]);

  useEffect(() => {
    if (!eventsFromAPI || eventsFromAPI.length === 0) {
      setEvents([]);
      lastProcessedKeyRef.current = '';
      return;
    }

    // Проверяем, не обрабатываем ли мы уже эти данные
    if (lastProcessedKeyRef.current === eventsKey) {
      return;
    }

    // Предотвращаем параллельные запуски
    if (processingRef.current) {
      return;
    }

    // Сразу показываем события с дефолтными координатами для быстрого отображения
    const eventsWithDefaultCoords: CityEvent[] = eventsFromAPI.map(event => ({
      ...event,
      lat: 54.7068,
      lng: 20.5103,
    }));
    setEvents(eventsWithDefaultCoords);
    lastProcessedKeyRef.current = eventsKey;

    // Геокодируем в фоне и обновляем координаты по мере готовности
    const processEvents = async () => {
      processingRef.current = true;
      setIsGeocoding(true);
      setError(null);
      
      try {
        // Геокодируем адреса используя локальную базу известных мест
        const eventsWithCoords = await geocodeEvents(eventsFromAPI);
        
        // Проверяем, что ключ не изменился во время обработки
        if (lastProcessedKeyRef.current === eventsKey) {
          // Обновляем события с реальными координатами
          setEvents(eventsWithCoords);
        }
      } catch (err) {
        console.error('❌ Error geocoding events:', err);
        setError('Ошибка определения координат');
        // Оставляем дефолтные координаты, которые уже установлены
      } finally {
        setIsGeocoding(false);
        processingRef.current = false;
      }
    };

    // Запускаем геокодирование в фоне
    processEvents();
  }, [eventsKey, eventsFromAPI]);

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

