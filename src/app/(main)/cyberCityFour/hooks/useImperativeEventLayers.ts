import { useEffect } from 'react';
import { CATEGORY_COLORS } from '../constants/categories';

// Функция загрузки SVG иконок (параллельная загрузка)
const loadEventIcons = async (mapRef: any, isLight: boolean) => {
  const iconColor = isLight ? "#1f2937" : "#ffffff";
  
  const icons: Record<string, string> = {
    "icon-music": `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M12 24V8l12-2v16" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="9" cy="24" r="3" fill="${iconColor}"/><circle cx="21" cy="22" r="3" fill="${iconColor}"/></svg>`,
    "icon-art": `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="10" stroke="${iconColor}" stroke-width="2.5" fill="none"/><path d="M16 6v10l7 7" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="16" r="1.5" fill="${iconColor}"/><circle cx="24" cy="16" r="1.5" fill="${iconColor}"/></svg>`,
    "icon-education": `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M6 12l10-4 10 4-10 4-10-4z" fill="${iconColor}"/><path d="M10 15v6c0 1.5 2.5 3.5 6 3.5s6-2 6-3.5v-6" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="26" y1="13" x2="26" y2="19" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round"/></svg>`,
    "icon-business": `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="10" width="20" height="16" rx="2" stroke="${iconColor}" stroke-width="2.5" fill="none"/><path d="M12 10V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round"/><line x1="6" y1="16" x2="26" y2="16" stroke="${iconColor}" stroke-width="2.5"/></svg>`,
    "icon-sport": `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="8" stroke="${iconColor}" stroke-width="2.5" fill="none"/><path d="M16 8v16M8 16h16" stroke="${iconColor}" stroke-width="2"/></svg>`,
    "icon-humor": `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="10" stroke="${iconColor}" stroke-width="2.5" fill="none"/><circle cx="12" cy="14" r="1.5" fill="${iconColor}"/><circle cx="20" cy="14" r="1.5" fill="${iconColor}"/><path d="M11 19c1 2 3 3 5 3s4-1 5-3" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round"/></svg>`,
    "icon-gastro": `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M10 6v8a4 4 0 0 0 4 4v8" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round"/><path d="M18 6v20" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round"/><line x1="8" y1="6" x2="8" y2="12" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round"/><line x1="12" y1="6" x2="12" y2="12" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round"/></svg>`,
    "icon-family": `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M8 26V13l8-7 8 7v13" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><rect x="12" y="18" width="8" height="8" stroke="${iconColor}" stroke-width="2.5" fill="none"/></svg>`,
    "icon-city": `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="12" width="8" height="14" stroke="${iconColor}" stroke-width="2.5" fill="none"/><rect x="18" y="8" width="8" height="18" stroke="${iconColor}" stroke-width="2.5" fill="none"/><line x1="8" y1="16" x2="12" y2="16" stroke="${iconColor}" stroke-width="1.5"/><line x1="8" y1="20" x2="12" y2="20" stroke="${iconColor}" stroke-width="1.5"/><line x1="20" y1="12" x2="24" y2="12" stroke="${iconColor}" stroke-width="1.5"/><line x1="20" y1="16" x2="24" y2="16" stroke="${iconColor}" stroke-width="1.5"/></svg>`,
    "icon-default": `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M24 13c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0z" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="16" cy="13" r="3" fill="${iconColor}"/></svg>`
  };
  
  // Загружаем все иконки параллельно для ускорения
  const loadPromises = Object.entries(icons).map(async ([id, svg]) => {
    try {
      if (mapRef.hasImage(id)) {
        mapRef.removeImage(id);
      }
      
      const img = new Image(32, 32);
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        const cleanSvg = svg.trim().replace(/\s+/g, ' ');
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanSvg)}`;
      });
      
      mapRef.addImage(id, img);
    } catch (e) {
      // Игнорируем ошибки загрузки отдельных иконок
    }
  });
  
  // Ждем загрузки всех иконок
  await Promise.all(loadPromises);
};

/**
 * Хук для императивного добавления слоев событий на карту
 * Используется вместо декларативных <Source> и <Layer> компонентов
 */
export const useImperativeEventLayers = (
  mapRef: any,
  eventGeoJSON: any,
  isLight: boolean,
  mapLoaded: boolean
) => {
  useEffect(() => {
    if (!mapRef || !mapLoaded) return;

    // Используем requestAnimationFrame для мгновенного добавления без задержки
    const addLayers = async () => {
      try {
        // Загружаем иконки
        await loadEventIcons(mapRef, isLight);
        
        // 1. Добавляем источник данных
        if (!mapRef.getSource('events')) {
          mapRef.addSource('events', {
            type: 'geojson',
            data: eventGeoJSON,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
          });
        }

        // 2. Добавляем слои (в правильном порядке: снизу вверх)
        
        // Кластеры - внешнее сильное свечение
        if (!mapRef.getLayer('clusters-glow-outer')) {
          mapRef.addLayer({
            id: 'clusters-glow-outer',
            type: 'circle',
            source: 'events',
            filter: ['has', 'point_count'],
            paint: {
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                32, 10, 42, 50, 52
              ],
              'circle-color': '#6a57e8',
              'circle-opacity': isLight ? 0.15 : 0.25,
              'circle-blur': 2.5
            }
          });
        } else {
          mapRef.setPaintProperty('clusters-glow-outer', 'circle-opacity', isLight ? 0.15 : 0.25);
        }

        // Кластеры - среднее свечение
        if (!mapRef.getLayer('clusters-glow')) {
          mapRef.addLayer({
            id: 'clusters-glow',
            type: 'circle',
            source: 'events',
            filter: ['has', 'point_count'],
            paint: {
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                28, 10, 38, 50, 48
              ],
              'circle-color': '#6a57e8',
              'circle-opacity': isLight ? 0.3 : 0.5,
              'circle-blur': 2
            }
          });
        } else {
          // Обновляем прозрачность при смене темы
          mapRef.setPaintProperty('clusters-glow', 'circle-opacity', isLight ? 0.3 : 0.5);
        }

        // Кластеры - основной круг
        if (!mapRef.getLayer('clusters')) {
          mapRef.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'events',
            filter: ['has', 'point_count'],
            paint: {
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                24, 10, 32, 50, 40
              ],
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#6a57e8', 10, '#7c68eb', 50, '#8b7aef'
              ],
              'circle-opacity': 1,
              'circle-stroke-width': [
                'step',
                ['get', 'point_count'],
                4, 10, 4.5, 50, 5
              ],
              'circle-stroke-color': '#ffffff',
              'circle-stroke-opacity': 1
            }
          });
        }

        // Кластеры - число
        if (!mapRef.getLayer('cluster-count')) {
          mapRef.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'events',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': ['get', 'point_count_abbreviated'],
              'text-size': [
                'step',
                ['get', 'point_count'],
                16, 10, 17, 50, 18
              ],
              'text-allow-overlap': true
            },
            paint: {
              'text-color': '#ffffff',
              'text-halo-color': 'rgba(0, 0, 0, 0.3)',
              'text-halo-width': 1.5,
              'text-halo-blur': 0.5
            }
          });
        }

        // Некластеризованные точки - внешнее свечение
        if (!mapRef.getLayer('event-pulse-outer')) {
          mapRef.addLayer({
            id: 'event-pulse-outer',
            type: 'circle',
            source: 'events',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 24, 15, 32, 18, 42
              ],
              'circle-color': [
                'match',
                ['get', 'category'],
                'music', CATEGORY_COLORS.music.pulseGlow,
                'art', CATEGORY_COLORS.art.pulseGlow,
                'education', CATEGORY_COLORS.education.pulseGlow,
                'business', CATEGORY_COLORS.business.pulseGlow,
                'sport', CATEGORY_COLORS.sport.pulseGlow,
                'humor', CATEGORY_COLORS.humor.pulseGlow,
                'gastro', CATEGORY_COLORS.gastro.pulseGlow,
                'family', CATEGORY_COLORS.family.pulseGlow,
                'city', CATEGORY_COLORS.city.pulseGlow,
                CATEGORY_COLORS.default.pulseGlow
              ],
              'circle-opacity': isLight ? 0.35 : 0.5,
              'circle-blur': 2.5
            }
          });
        } else {
          // Обновляем прозрачность при смене темы
          mapRef.setPaintProperty('event-pulse-outer', 'circle-opacity', isLight ? 0.35 : 0.5);
        }

        // Некластеризованные точки - среднее свечение
        if (!mapRef.getLayer('event-glow-middle')) {
          mapRef.addLayer({
            id: 'event-glow-middle',
            type: 'circle',
            source: 'events',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 16, 15, 22, 18, 28
              ],
              'circle-color': [
                'match',
                ['get', 'category'],
                'music', CATEGORY_COLORS.music.glow,
                'art', CATEGORY_COLORS.art.glow,
                'education', CATEGORY_COLORS.education.glow,
                'business', CATEGORY_COLORS.business.glow,
                'sport', CATEGORY_COLORS.sport.glow,
                'humor', CATEGORY_COLORS.humor.glow,
                'gastro', CATEGORY_COLORS.gastro.glow,
                'family', CATEGORY_COLORS.family.glow,
                'city', CATEGORY_COLORS.city.glow,
                CATEGORY_COLORS.default.glow
              ],
              'circle-opacity': isLight ? 0.6 : 0.8,
              'circle-blur': 2
            }
          });
        } else {
          // Обновляем прозрачность при смене темы
          mapRef.setPaintProperty('event-glow-middle', 'circle-opacity', isLight ? 0.6 : 0.8);
        }

        // Некластеризованные точки - интенсивное свечение (только темная тема)
        if (!isLight) {
          if (!mapRef.getLayer('event-glow')) {
            mapRef.addLayer({
              id: 'event-glow',
              type: 'circle',
              source: 'events',
              filter: ['!', ['has', 'point_count']],
              paint: {
                'circle-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  10, 14, 15, 19, 18, 24
                ],
                'circle-color': [
                  'match',
                  ['get', 'category'],
                  'music', CATEGORY_COLORS.music.glow,
                  'art', CATEGORY_COLORS.art.glow,
                  'education', CATEGORY_COLORS.education.glow,
                  'business', CATEGORY_COLORS.business.glow,
                  'sport', CATEGORY_COLORS.sport.glow,
                  'humor', CATEGORY_COLORS.humor.glow,
                  'gastro', CATEGORY_COLORS.gastro.glow,
                  'family', CATEGORY_COLORS.family.glow,
                  'city', CATEGORY_COLORS.city.glow,
                  CATEGORY_COLORS.default.glow
                ],
                'circle-opacity': 0.9,
                'circle-blur': 2.5
              }
            });
          }
        } else {
          // Удаляем слой при переходе на светлую тему
          if (mapRef.getLayer('event-glow')) {
            try {
              mapRef.removeLayer('event-glow');
            } catch (e) {
              // Игнорируем ошибки удаления
            }
          }
        }

        // Некластеризованные точки - центральный круг
        if (!mapRef.getLayer('event-border-circle')) {
          mapRef.addLayer({
            id: 'event-border-circle',
            type: 'circle',
            source: 'events',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 12, 15, 16, 18, 20
              ],
              'circle-color': isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.15)',
              'circle-opacity': 1,
              'circle-stroke-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 3.5, 15, 4.5, 18, 5.5
              ],
              'circle-stroke-color': [
                'match',
                ['get', 'category'],
                'music', isLight ? CATEGORY_COLORS.music.light : CATEGORY_COLORS.music.dark,
                'art', isLight ? CATEGORY_COLORS.art.light : CATEGORY_COLORS.art.dark,
                'education', isLight ? CATEGORY_COLORS.education.light : CATEGORY_COLORS.education.dark,
                'business', isLight ? CATEGORY_COLORS.business.light : CATEGORY_COLORS.business.dark,
                'sport', isLight ? CATEGORY_COLORS.sport.light : CATEGORY_COLORS.sport.dark,
                'humor', isLight ? CATEGORY_COLORS.humor.light : CATEGORY_COLORS.humor.dark,
                'gastro', isLight ? CATEGORY_COLORS.gastro.light : CATEGORY_COLORS.gastro.dark,
                'family', isLight ? CATEGORY_COLORS.family.light : CATEGORY_COLORS.family.dark,
                'city', isLight ? CATEGORY_COLORS.city.light : CATEGORY_COLORS.city.dark,
                isLight ? CATEGORY_COLORS.default.light : CATEGORY_COLORS.default.dark
              ],
              'circle-stroke-opacity': 1
            }
          });
        } else {
          // Обновляем цвета при смене темы
          mapRef.setPaintProperty('event-border-circle', 'circle-color', isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.15)');
          mapRef.setPaintProperty('event-border-circle', 'circle-stroke-color', [
            'match',
            ['get', 'category'],
            'music', isLight ? CATEGORY_COLORS.music.light : CATEGORY_COLORS.music.dark,
            'art', isLight ? CATEGORY_COLORS.art.light : CATEGORY_COLORS.art.dark,
            'education', isLight ? CATEGORY_COLORS.education.light : CATEGORY_COLORS.education.dark,
            'business', isLight ? CATEGORY_COLORS.business.light : CATEGORY_COLORS.business.dark,
            'sport', isLight ? CATEGORY_COLORS.sport.light : CATEGORY_COLORS.sport.dark,
            'humor', isLight ? CATEGORY_COLORS.humor.light : CATEGORY_COLORS.humor.dark,
            'gastro', isLight ? CATEGORY_COLORS.gastro.light : CATEGORY_COLORS.gastro.dark,
            'family', isLight ? CATEGORY_COLORS.family.light : CATEGORY_COLORS.family.dark,
            'city', isLight ? CATEGORY_COLORS.city.light : CATEGORY_COLORS.city.dark,
            isLight ? CATEGORY_COLORS.default.light : CATEGORY_COLORS.default.dark
          ]);
        }

        // SVG иконки категорий
        if (!mapRef.getLayer('event-icons')) {
          mapRef.addLayer({
            id: 'event-icons',
            type: 'symbol',
            source: 'events',
            filter: ['!', ['has', 'point_count']],
            layout: {
              'icon-image': [
                'match',
                ['get', 'category'],
                'music', 'icon-music',
                'art', 'icon-art',
                'education', 'icon-education',
                'business', 'icon-business',
                'sport', 'icon-sport',
                'humor', 'icon-humor',
                'gastro', 'icon-gastro',
                'family', 'icon-family',
                'city', 'icon-city',
                'icon-default'
              ],
              'icon-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 0.6, 15, 0.75, 18, 0.9
              ],
              'icon-allow-overlap': true,
              'icon-ignore-placement': true
            },
            paint: {
              'icon-opacity': 1
            }
          });
        }
        
        // Названия событий (подписи)
        if (!mapRef.getLayer('event-labels')) {
          mapRef.addLayer({
            id: 'event-labels',
            type: 'symbol',
            source: 'events',
            filter: ['!', ['has', 'point_count']],
            layout: {
              'text-field': ['get', 'name'],
              'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
              'text-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 10,
                13, 11,
                15, 12,
                18, 13
              ],
              'text-offset': [0, 2.5],
              'text-anchor': 'top',
              'text-max-width': 10,
              'text-allow-overlap': false,
              'text-optional': true
            },
            paint: {
              'text-color': isLight ? '#1f2937' : '#ffffff',
              'text-halo-color': isLight ? '#ffffff' : '#0a0a0a',
              'text-halo-width': 2,
              'text-halo-blur': 1,
              'text-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 0,
                12, 0.8,
                15, 1
              ]
            }
          });
        } else {
          // Обновляем цвета подписей при смене темы
          mapRef.setPaintProperty('event-labels', 'text-color', isLight ? '#1f2937' : '#ffffff');
          mapRef.setPaintProperty('event-labels', 'text-halo-color', isLight ? '#ffffff' : '#0a0a0a');
        }
        
        // Интерактивный слой для кликов
        if (!mapRef.getLayer('event-points')) {
          mapRef.addLayer({
            id: 'event-points',
            type: 'circle',
            source: 'events',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 20, 15, 26, 18, 32
              ],
              'circle-color': 'transparent',
              'circle-opacity': 0
            }
          });
        }

      } catch (err) {
        console.error('❌ Ошибка добавления слоев событий:', err);
      }
    };

    // Используем requestAnimationFrame для плавного добавления слоев
    const rafId = requestAnimationFrame(() => {
      addLayers();
    });

    // Cleanup при размонтировании
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [mapRef, eventGeoJSON, isLight, mapLoaded]);
};

