import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          setText: (text: string) => void;
        };
        HeaderColor?: {
          setColor: (color: string) => void;
        };
        backgroundColor: string;
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        version: string;
        platform: string;
        initData: string;
        initDataUnsafe: any;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
      };
    };
  }
}

export const useTelegramWebApp = () => {
  const [isReady, setIsReady] = useState(false);
  const [webApp, setWebApp] = useState<Window['Telegram'] | null>(null);

  useEffect(() => {
    // Проверяем, что мы в Telegram WebApp
    if (typeof window === 'undefined') {
      return;
    }

    // Ждем загрузки Telegram WebApp скрипта
    let timeoutId: NodeJS.Timeout | null = null;
    let observer: MutationObserver | null = null;

    const initTelegramWebApp = () => {
      if (!window.Telegram?.WebApp) {
        // Если скрипт еще не загружен, ждем (максимум 5 секунд)
        timeoutId = setTimeout(initTelegramWebApp, 100);
        return;
      }

      const tg = window.Telegram.WebApp;
      setWebApp(window.Telegram);

      // ВАЖНО: Вызываем ready() для показа кастомной панели
      // Это превращает стандартную панель загрузки (фото 1) в расширенную панель (фото 2)
      tg.ready();
      
      // Расширяем приложение на весь экран
      tg.expand();

      setIsReady(true);

      // Настраиваем цвета панели в соответствии с темой приложения
      const updateHeaderColor = () => {
        // Проверяем наличие HeaderColor API (доступно не во всех версиях)
        if (!tg.HeaderColor?.setColor) {
          return;
        }

        // Используем цвет фона приложения
        const bgColor = getComputedStyle(document.documentElement)
          .getPropertyValue('--background-color')
          .trim();
        
        if (bgColor) {
          // Конвертируем CSS переменную в hex цвет
          const hexColor = cssVarToHex(bgColor);
          if (hexColor) {
            tg.HeaderColor.setColor(hexColor);
          }
        }
      };

      // Первоначальная настройка цвета
      updateHeaderColor();

      // Обновляем цвет при изменении темы
      observer = new MutationObserver(updateHeaderColor);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme', 'class'],
      });
    };

    // Запускаем инициализацию после небольшой задержки для гарантии загрузки скрипта
    const initTimeout = setTimeout(initTelegramWebApp, 50);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (initTimeout) clearTimeout(initTimeout);
      if (observer) observer.disconnect();
    };
  }, []);

  return {
    isReady,
    webApp: webApp?.WebApp || null,
    isTelegram: !!webApp,
  };
};

// Вспомогательная функция для конвертации CSS переменной в hex
function cssVarToHex(cssValue: string): string | null {
  // Если это уже hex цвет
  if (cssValue.startsWith('#')) {
    return cssValue;
  }

  // Если это rgb/rgba
  if (cssValue.startsWith('rgb')) {
    const matches = cssValue.match(/\d+/g);
    if (matches && matches.length >= 3) {
      const r = parseInt(matches[0]);
      const g = parseInt(matches[1]);
      const b = parseInt(matches[2]);
      return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
    }
  }

  // Если это CSS переменная, пытаемся получить её значение
  if (cssValue.startsWith('var(')) {
    const varName = cssValue.match(/var\(([^)]+)\)/)?.[1];
    if (varName) {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(varName.trim())
        .trim();
      return cssVarToHex(value);
    }
  }

  return null;
}

