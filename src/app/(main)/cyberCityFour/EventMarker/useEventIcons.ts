import { useEffect } from 'react';

/**
 * Хук для загрузки SVG иконок событий в MapLibre
 */
export const useEventIcons = (mapRef: any, isLight: boolean) => {
  useEffect(() => {
    if (!mapRef) return;

    const loadIcons = async () => {
      // Небольшая задержка чтобы карта была готова
      await new Promise(resolve => setTimeout(resolve, 100));
      // Функция создания SVG иконки
      const createIcon = (svg: string) => {
        const img = new Image(32, 32);
        img.src = `data:image/svg+xml;base64,${btoa(svg)}`;
        return new Promise<HTMLImageElement>((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = reject;
        });
      };

      // Цвета для светлой/темной темы
      const iconColor = isLight ? "#1f2937" : "#ffffff";

      // SVG иконки для каждой категории
      const icons = {
        "icon-concert": `
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 24V8l12-2v16" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <circle cx="9" cy="24" r="3" fill="${iconColor}"/>
            <circle cx="21" cy="22" r="3" fill="${iconColor}"/>
          </svg>
        `,
        "icon-exhibit": `
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="6" width="20" height="20" rx="2" stroke="${iconColor}" stroke-width="2.5" fill="none"/>
            <circle cx="12" cy="12" r="2" fill="${iconColor}"/>
            <path d="M26 20l-6-6-8 8" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `,
        "icon-lecture": `
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12l10-4 10 4-10 4-10-4z" fill="${iconColor}"/>
            <path d="M10 15v6c0 1.5 2.5 3.5 6 3.5s6-2 6-3.5v-6" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <line x1="26" y1="13" x2="26" y2="19" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        `,
        "icon-festival": `
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 6l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" fill="${iconColor}"/>
            <circle cx="8" cy="8" r="1.5" fill="${iconColor}"/>
            <circle cx="24" cy="8" r="2" fill="${iconColor}"/>
            <circle cx="24" cy="24" r="1.5" fill="${iconColor}"/>
          </svg>
        `,
        "icon-meetup": `
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="10" r="3.5" stroke="${iconColor}" stroke-width="2.5" fill="none"/>
            <circle cx="20" cy="10" r="3.5" stroke="${iconColor}" stroke-width="2.5" fill="none"/>
            <path d="M6 26v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <path d="M18 26v-2a4 4 0 0 1 4-4h2" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          </svg>
        `,
        "icon-default": `
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 13c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0z" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <circle cx="16" cy="13" r="3" fill="${iconColor}"/>
          </svg>
        `,
      };

      // Загружаем каждую иконку
      for (const [id, svg] of Object.entries(icons)) {
        try {
          // Проверяем, существует ли иконка
          if (mapRef.hasImage(id)) {
            // Если существует, сначала удаляем
            try {
              mapRef.removeImage(id);
            } catch (e) {
              // Игнорируем ошибку удаления
            }
          }

          // Загружаем новую иконку
          const img = await createIcon(svg);
          
          // Проверяем еще раз перед добавлением
          if (!mapRef.hasImage(id)) {
            mapRef.addImage(id, img);
          }
        } catch (e) {
          console.error(`Ошибка загрузки иконки ${id}:`, e);
        }
      }
    };

    loadIcons();
  }, [mapRef, isLight]);
};

