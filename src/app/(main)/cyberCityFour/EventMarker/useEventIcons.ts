import { useEffect } from 'react';

/**
 * Хук для загрузки SVG иконок событий в MapLibre
 */
// Флаг для предотвращения множественной загрузки
let iconsLoaded = false;
let lastTheme: boolean | null = null;

export const useEventIcons = (mapRef: any, isLight: boolean) => {
  useEffect(() => {
    if (!mapRef) {
      console.log('⚠️ mapRef отсутствует, иконки не загружены');
      return;
    }

    // Если тема изменилась, сбрасываем флаг
    if (lastTheme !== null && lastTheme !== isLight) {
      console.log('🔄 Тема изменилась, перезагружаем иконки');
      iconsLoaded = false;
    }
    lastTheme = isLight;

    // Проверяем, не загружены ли уже иконки
    if (iconsLoaded && mapRef.hasImage && mapRef.hasImage('icon-music')) {
      console.log('✅ Иконки уже загружены, пропускаем');
      return;
    }

    console.log('🎨 Начинаем загрузку иконок событий...');

    const loadIcons = async () => {
      // Небольшая задержка чтобы карта была готова
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Функция создания SVG иконки
      const createIcon = (svg: string, iconId: string) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image(32, 32);
          img.onload = () => resolve(img);
          img.onerror = reject;
          const cleanSvg = svg.trim().replace(/\s+/g, ' ');
          img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanSvg)}`;
        });
      };

      // Цвета для светлой/темной темы
      const iconColor = isLight ? "#1f2937" : "#ffffff";

      // SVG иконки для каждой категории
      const icons = {
        "icon-music": `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M12 24V8l12-2v16" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="9" cy="24" r="3" fill="${iconColor}"/><circle cx="21" cy="22" r="3" fill="${iconColor}"/></svg>`,
        
        "icon-art": `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="10" stroke="${iconColor}" stroke-width="2.5" fill="none"/><path d="M16 6v10l7 7" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="16" r="1.5" fill="${iconColor}"/><circle cx="24" cy="16" r="1.5" fill="${iconColor}"/></svg>`,
        
        "icon-education": `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M6 12l10-4 10 4-10 4-10-4z" fill="${iconColor}"/><path d="M10 15v6c0 1.5 2.5 3.5 6 3.5s6-2 6-3.5v-6" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="26" y1="13" x2="26" y2="19" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round"/></svg>`,
        
        "icon-business": `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="10" width="20" height="16" rx="2" stroke="${iconColor}" stroke-width="2.5" fill="none"/><path d="M12 10V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round"/><line x1="6" y1="16" x2="26" y2="16" stroke="${iconColor}" stroke-width="2.5"/></svg>`,
        
        "icon-sport": `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><text x="16" y="22" font-size="20" text-anchor="middle" fill="${iconColor}">🏆</text></svg>`,
        
        "icon-humor": `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="10" stroke="${iconColor}" stroke-width="2.5" fill="none"/><circle cx="12" cy="14" r="1.5" fill="${iconColor}"/><circle cx="20" cy="14" r="1.5" fill="${iconColor}"/><path d="M11 19c1 2 3 3 5 3s4-1 5-3" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round"/></svg>`,
        
        "icon-gastro": `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M10 6v8a4 4 0 0 0 4 4v8" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round"/><path d="M18 6v20" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round"/><line x1="8" y1="6" x2="8" y2="12" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round"/><line x1="12" y1="6" x2="12" y2="12" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round"/></svg>`,
        
        "icon-family": `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M8 26V13l8-7 8 7v13" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><rect x="12" y="18" width="8" height="8" stroke="${iconColor}" stroke-width="2.5" fill="none"/></svg>`,
        
        "icon-city": `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="12" width="8" height="14" stroke="${iconColor}" stroke-width="2.5" fill="none"/><rect x="18" y="8" width="8" height="18" stroke="${iconColor}" stroke-width="2.5" fill="none"/><line x1="8" y1="16" x2="12" y2="16" stroke="${iconColor}" stroke-width="1.5"/><line x1="8" y1="20" x2="12" y2="20" stroke="${iconColor}" stroke-width="1.5"/><line x1="20" y1="12" x2="24" y2="12" stroke="${iconColor}" stroke-width="1.5"/><line x1="20" y1="16" x2="24" y2="16" stroke="${iconColor}" stroke-width="1.5"/></svg>`,
        
        "icon-default": `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M24 13c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0z" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="16" cy="13" r="3" fill="${iconColor}"/></svg>`,
      };

      if (typeof mapRef.addImage !== 'function') return;

      // Загружаем каждую иконку
      for (const [id, svg] of Object.entries(icons)) {
        try {
          if (mapRef.hasImage && mapRef.hasImage(id)) {
            try {
              mapRef.removeImage(id);
            } catch (e) {
              // Игнорируем
            }
          }

          const img = await createIcon(svg, id);
          
          if (!mapRef.hasImage || !mapRef.hasImage(id)) {
            mapRef.addImage(id, img);
          }
        } catch (e) {
          // Игнорируем ошибки загрузки отдельных иконок
        }
      }
      
      // Устанавливаем флаг, что иконки загружены
      iconsLoaded = true;
    };

    loadIcons();
  }, [mapRef, isLight]);
};

