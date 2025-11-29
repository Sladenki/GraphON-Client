/**
 * Хук для инициализации карты и PMTiles протокола
 * Объединяет логику определения темы, мобильности и настройки PMTiles
 */

import { useEffect, useState } from 'react';
import { Protocol, PMTiles } from 'pmtiles';
import { useDebounce } from '@/hooks/useDebounce';

interface MapSetupResult {
  isLight: boolean;
  isMobile: boolean;
  isVerySmallScreen: boolean;
}

/**
 * Инициализирует PMTiles протокол, определяет тему и адаптивность
 */
export function useMapSetup(): MapSetupResult {
  const [isLight, setIsLight] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVerySmallScreen, setIsVerySmallScreen] = useState(false);
  
  // Viewport для адаптивности с дебаунсом
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const debouncedViewport = useDebounce(viewport, 300);

  // Инициализация PMTiles протокола
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    let protocol: Protocol | null = null;
    
    const initProtocol = async () => {
      try {
        // Динамически импортируем maplibre
        const maplibregl = (await import('maplibre-gl')).default;
        
        // Создаём PMTiles источник
        const pmtiles = new PMTiles('/tiles/kaliningrad.pmtiles');
        
        // Создаём экземпляр протокола и добавляем источник
        protocol = new Protocol();
        protocol.add(pmtiles);
        
        // Проверяем, не зарегистрирован ли уже протокол
        try {
          (maplibregl as any).removeProtocol?.('pmtiles');
        } catch (e) {
          // Игнорируем если протокол не был зарегистрирован
        }
        
        // Регистрируем протокол
        (maplibregl as any).addProtocol('pmtiles', (request: any, callback: any) => {
          return protocol!.tile(request, callback);
        });
      } catch (e) {
        console.error("❌ Ошибка регистрации PMTiles протокола:", e);
      }
    };
    
    initProtocol();
    
    return () => {
      const cleanup = async () => {
        try {
          const maplibregl = (await import('maplibre-gl')).default;
          (maplibregl as any).removeProtocol?.('pmtiles');
        } catch (e) {
          // Игнорируем ошибки при очистке
        }
      };
      cleanup();
    };
  }, []);

  // Определение темы (светлая/темная)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const media = window.matchMedia("(prefers-color-scheme: light)");
    
    const readDomTheme = (): "light" | "dark" | null => {
      const el = document.documentElement;
      const attr = (el.getAttribute("data-theme") || "").toLowerCase();
      
      if (attr === "light") return "light";
      if (attr === "dark") return "dark";
      if (el.classList.contains("dark") || el.classList.contains("theme-dark")) return "dark";
      if (el.classList.contains("light") || el.classList.contains("theme-light")) return "light";
      
      return null;
    };
    
    const apply = () => {
      const dom = readDomTheme();
      if (dom) { 
        setIsLight(dom === "light"); 
        return; 
      }
      setIsLight(media.matches);
    };
    
    apply();
    media.addEventListener("change", apply);
    
    const obs = new MutationObserver(apply);
    obs.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ["class", "data-theme"] 
    });
    
    return () => { 
      media.removeEventListener("change", apply); 
      obs.disconnect(); 
    };
  }, []);

  // Отслеживание изменения размера окна
  useEffect(() => {
    const update = () => {
      setViewport({ 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
    };

    update();
    window.addEventListener("resize", update);
    
    return () => {
      window.removeEventListener("resize", update);
    };
  }, []);

  // Обновление состояния адаптивности на основе viewport
  useEffect(() => {
    const { width, height } = debouncedViewport;
    
    setIsVerySmallScreen(
      width <= 350 || (width <= 380 && height <= 700)
    );
    
    setIsMobile(
      width <= 400 ||
      (width <= 480 && height <= 800) ||
      width <= 350
    );
  }, [debouncedViewport]);

  // Блокировка скролла для мобильных
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const body = document.body;
    const prevOverflow = body.style.overflow;
    
    if (isMobile) {
      body.style.overflow = "hidden";
    } else {
      body.style.overflow = prevOverflow || "";
    }
    
    return () => {
      body.style.overflow = prevOverflow;
    };
  }, [isMobile]);

  return { isLight, isMobile, isVerySmallScreen };
}

