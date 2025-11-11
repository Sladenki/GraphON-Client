/**
 * Хук для управления темой карты
 * Применяет стили к слоям карты в зависимости от темы
 */

import { useCallback, useEffect, useRef } from 'react';
import { 
  COLORS, 
  getLayerColor, 
  ROAD_STYLES, 
  FILL_STYLES 
} from '../constants/mapStyles';
import { 
  setPaintProperties, 
  createZoomInterpolation, 
  addOutlineIfNotExists,
  classifyRoad,
  classifyFill
} from '../utils/mapHelpers';

interface UseMapThemeParams {
  mapRef: any;
  mapLoaded: boolean;
  isLight: boolean;
}

/**
 * Хук для применения и обновления темы карты
 */
export function useMapTheme({ mapRef, mapLoaded, isLight }: UseMapThemeParams) {
  const prevIsLightRef = useRef<boolean | null>(null);

  // Функция применения стилей линий (мемоизирована)
  const applyLineStyles = useCallback((map: any, layer: any, isLight: boolean) => {
    const roadType = classifyRoad(layer.id);
    const color = getLayerColor(layer.id, isLight);
    const style = ROAD_STYLES[roadType];
    
    // Применяем основные стили дороги
    setPaintProperties(map, layer.id, {
      "line-color": color,
      "line-opacity": createZoomInterpolation(isLight ? style.opacity.light : style.opacity.dark),
      "line-width": createZoomInterpolation(style.width),
      "line-blur": isLight ? style.blur.light : style.blur.dark
    });

    // Неоновый эффект для главных дорог
    if (layer.source && roadType === "major") {
      if (isLight) {
        // Мягкое свечение для светлой темы
        addOutlineIfNotExists(map, layer, `${layer.id}-neon-glow`, {
          "line-color": color,
          "line-opacity": createZoomInterpolation([0.10, 0.16, 0.22, 0.30]),
          "line-width": createZoomInterpolation([1.8, 3.0, 4.5, 6.5]),
          "line-blur": 1.8
        });
      } else {
        // Яркое свечение для темной темы
        addOutlineIfNotExists(map, layer, `${layer.id}-neon-glow`, {
          "line-color": color,
          "line-opacity": createZoomInterpolation([0.08, 0.14, 0.22, 0.30]),
          "line-width": createZoomInterpolation([1.6, 2.6, 4.2, 6.0]),
          "line-blur": 1.4
        });
      }
    }
  }, []);

  // Функция применения стилей fill слоев (мемоизирована)
  const applyFillStyles = useCallback((map: any, layer: any, isLight: boolean) => {
    const fillType = classifyFill(layer.id);
    const style = FILL_STYLES[fillType];
    
    switch (fillType) {
      case "admin":
        setPaintProperties(map, layer.id, { "fill-opacity": style.opacity });
        addOutlineIfNotExists(map, layer, `${layer.id}-glow-outline`, {
          "line-color": isLight ? COLORS.light.boundary : COLORS.dark.boundary,
          "line-opacity": style.outline.opacity,
          "line-width": style.outline.width,
          "line-blur": style.outline.blur
        });
        break;
        
      case "water":
        setPaintProperties(map, layer.id, {
          "fill-opacity": isLight ? style.opacity.light : style.opacity.dark,
          "fill-color": isLight ? COLORS.light.water : COLORS.dark.water
        });
        addOutlineIfNotExists(map, layer, `${layer.id}-outline`, {
          "line-color": isLight ? COLORS.light.waterOutline : COLORS.dark.waterOutline,
          "line-opacity": isLight ? style.outline.opacity.light : style.outline.opacity.dark,
          "line-width": style.outline.width
        });
        break;
        
      case "park":
        setPaintProperties(map, layer.id, {
          "fill-opacity": isLight ? style.opacity.light : style.opacity.dark,
          "fill-color": isLight ? COLORS.light.park : COLORS.dark.park
        });
        addOutlineIfNotExists(map, layer, `${layer.id}-outline`, {
          "line-color": isLight ? COLORS.light.parkOutline : COLORS.dark.parkOutline,
          "line-opacity": style.outline.opacity,
          "line-width": isLight ? style.outline.width.light : style.outline.width.dark
        });
        break;
        
      case "land":
        if (!isLight && style.opacity.dark && style.color.dark) {
          setPaintProperties(map, layer.id, {
            "fill-opacity": style.opacity.dark,
            "fill-color": style.color.dark
          });
        }
        break;
    }
  }, []);

  // Обработчик загрузки карты
  const handleMapLoad = useCallback((e: any) => {
    const map = e?.target; 
    if (!map) return;
    
    try {
      // Применяем неоновые эффекты дорог сразу после загрузки
      const layers = map.getStyle()?.layers || [];
      layers.forEach((layer: any) => {
        if (layer.type === "line") {
          applyLineStyles(map, layer, isLight);
        } else if (layer.type === "fill" && layer.source) {
          applyFillStyles(map, layer, isLight);
        }
      });
    } catch (e) {
      // Игнорируем ошибки стилизации
    }
  }, [applyLineStyles, applyFillStyles, isLight]);

  // Обновление стилей карты при смене темы
  useEffect(() => {
    if (!mapRef || !mapLoaded) return;
    
    // При первой загрузке просто сохраняем тему
    if (prevIsLightRef.current === null) {
      prevIsLightRef.current = isLight;
      return;
    }
    
    // Проверяем изменение темы
    if (prevIsLightRef.current === isLight) {
      return; // Тема не изменилась
    }
    
    prevIsLightRef.current = isLight;
    
    // ВАЖНО: НЕ используем setStyle() - он удаляет все динамические источники!
    // Вместо этого обновляем только цвета слоев
    try {
      // Обновляем фон
      if (mapRef.getLayer('background')) {
        mapRef.setPaintProperty('background', 'background-color', isLight ? '#f8f8f8' : '#1a1d23');
      }
      
      // Обновляем все слои дорог и fill
      const layers = mapRef.getStyle()?.layers || [];
      layers.forEach((layer: any) => {
        try {
          if (layer.type === "line" && layer.source === "local-tiles") {
            applyLineStyles(mapRef, layer, isLight);
          } else if (layer.type === "fill" && layer.source === "local-tiles") {
            applyFillStyles(mapRef, layer, isLight);
          }
        } catch (e) {
          // Игнорируем ошибки отдельных слоев
        }
      });
    } catch (e) {
      // Игнорируем ошибки обновления цветов
    }
  }, [mapRef, mapLoaded, isLight, applyFillStyles, applyLineStyles]);

  return { handleMapLoad };
}

