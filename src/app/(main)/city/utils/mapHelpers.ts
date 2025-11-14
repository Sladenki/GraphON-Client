/**
 * Утилиты для работы с картой
 * Вынесены из page.tsx для переиспользования
 */

import type { RoadType, FillType } from "../constants/mapStyles";

/**
 * Применить несколько paint properties к слою карты
 */
export const setPaintProperties = (map: any, layerId: string, properties: Record<string, any>) => {
  Object.entries(properties).forEach(([prop, value]) => {
    map.setPaintProperty(layerId, prop, value);
  });
};

/**
 * Создать интерполяцию для зума карты
 * @param values - значения для zoom уровней [10, 12, 14, 16]
 */
export const createZoomInterpolation = (values: number[]) => [
  "interpolate", ["linear"], ["zoom"], 
  10, values[0], 12, values[1], 14, values[2], 16, values[3]
];

/**
 * Создать определение outline слоя на основе базового
 */
export const createOutlineLayer = (baseLayer: any, id: string, paint: any) => {
  const def: any = {
    id, 
    type: "line", 
    source: baseLayer.source, 
    layout: baseLayer.layout || {}, 
    paint
  };
  
  if (baseLayer["source-layer"]) {
    def["source-layer"] = baseLayer["source-layer"];
  }
  
  if (baseLayer.filter) {
    def.filter = baseLayer.filter;
  }
  
  return def;
};

/**
 * Безопасно добавить outline слой к карте
 * Автоматически удаляет старый слой если существует
 */
export const addOutlineIfNotExists = (map: any, layer: any, outlineId: string, paint: any) => {
  try {
    // Удаляем старый слой если существует
    if (map.getLayer(outlineId)) {
      try {
        map.removeLayer(outlineId);
      } catch (e) {
        // Игнорируем ошибку
      }
    }
    
    // Добавляем новый слой
    const outlineDef = createOutlineLayer(layer, outlineId, paint);
    
    // ВАЖНО: Ищем следующий слой после основного слоя дороги
    const allLayers = map.getStyle().layers;
    const currentIndex = allLayers.findIndex((l: any) => l.id === layer.id);
    
    if (currentIndex !== -1 && currentIndex + 1 < allLayers.length) {
      // Добавляем outline слой СРАЗУ ПОСЛЕ основного слоя
      const nextLayerId = allLayers[currentIndex + 1].id;
      map.addLayer(outlineDef, nextLayerId);
    } else {
      // Если не нашли следующий слой, добавляем в конец
      map.addLayer(outlineDef);
    }
  } catch (e) {
    // Игнорируем ошибки добавления outline
  }
};

/**
 * Классифицировать дорогу по её ID
 */
export const classifyRoad = (id: string): RoadType => {
  const s = id.toLowerCase();
  
  // Проверяем "major" и "road-major" в первую очередь
  if (
    s.includes("major") || 
    s.includes("motorway") || 
    s.includes("highway") || 
    s.includes("primary") || 
    s.includes("main") || 
    s.includes("trunk")
  ) {
    return "major";
  }
  
  if (
    s.includes("secondary") || 
    s.includes("street") || 
    s.includes("road") || 
    s.includes("tertiary")
  ) {
    return "secondary";
  }
  
  return "minor";
};

/**
 * Классифицировать fill слой по его ID
 */
export const classifyFill = (id: string): FillType => {
  const s = id.toLowerCase();
  
  if (s.includes("admin") || s.includes("boundary")) return "admin";
  if (s.includes("water") || s.includes("marine") || s.includes("river")) return "water";
  if (s.includes("park") || s.includes("garden") || s.includes("forest") || s.includes("grass")) return "park";
  
  return "land";
};

