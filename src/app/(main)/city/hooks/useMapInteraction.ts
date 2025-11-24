/**
 * Хук для обработки взаимодействия с картой
 * Управляет кликами по событиям и кластерам
 */

import { useCallback, useEffect } from 'react';
import type { CityEvent } from '../mockEvents';

interface UseMapInteractionParams {
  mapRef: any;
  selectedEvent: CityEvent | null;
  setSelectedEvent: (event: CityEvent | null) => void;
  setEventOpenedFromList: (opened: boolean) => void;
  allEvents: CityEvent[]; // Реальные события
}

interface UseMapInteractionResult {
  handleMapClick: (event: any) => void;
}

/**
 * Хук для обработки кликов по карте и навигации к событиям
 */
export function useMapInteraction({
  mapRef,
  selectedEvent,
  setSelectedEvent,
  setEventOpenedFromList,
  allEvents
}: UseMapInteractionParams): UseMapInteractionResult {
  
  // Обработчик клика по карте для открытия popup
  const handleMapClick = useCallback((event: any) => {
    if (!mapRef || !event.features || event.features.length === 0) {
      setSelectedEvent(null);
      return;
    }
    
    const feature = event.features[0];
    
    // Обработка клика по кластеру - увеличиваем масштаб
    if (feature.layer.id === 'clusters') {
      const clusterId = feature.properties.cluster_id;
      const source = mapRef.getSource('events');
      
      if (source && source.getClusterExpansionZoom) {
        source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err) return;
          
          mapRef.easeTo({
            center: feature.geometry.coordinates,
            zoom: zoom,
            duration: 500
          });
        });
      }
      setSelectedEvent(null);
      return;
    }
    
    // Обработка клика по отдельному событию
    // Проверяем все возможные слои событий
    const eventLayers = ['event-points', 'event-icons', 'event-labels', 'event-border-circle'];
    if (eventLayers.includes(feature.layer.id)) {
      const eventId = feature.properties.id;
      const clickedEvent = allEvents.find(ev => ev.id === eventId);
      if (clickedEvent) {
        setSelectedEvent(clickedEvent);
        setEventOpenedFromList(false); // Открыто с карты
      }
    } else {
      setSelectedEvent(null);
    }
  }, [mapRef, setSelectedEvent, setEventOpenedFromList, allEvents]);

  // Приближение камеры к выбранному событию
  useEffect(() => {
    if (!mapRef || !selectedEvent) return;
    
    // Анимированное перемещение камеры к событию
    mapRef.flyTo({
      center: [selectedEvent.lng, selectedEvent.lat],
      zoom: 16, // Увеличенный зум для детального просмотра
      duration: 1500, // Длительность анимации в мс
      essential: true, // Анимация будет выполнена даже если prefers-reduced-motion
      pitch: 45, // Угол наклона камеры
      bearing: mapRef.getBearing() // Сохраняем текущий поворот
    });
  }, [selectedEvent, mapRef]);

  return { handleMapClick };
}

