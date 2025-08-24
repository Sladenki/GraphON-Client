'use client';

import { useEffect, useState } from 'react';

interface ResourcePreloaderProps {
  resources: string[];
  onLoadComplete?: () => void;
  priority?: 'high' | 'low';
}

export const ResourcePreloader = ({ 
  resources, 
  onLoadComplete, 
  priority = 'low' 
}: ResourcePreloaderProps) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (resources.length === 0) {
      setIsComplete(true);
      onLoadComplete?.();
      return;
    }

    let mounted = true;
    let loaded = 0;

    const preloadResource = (url: string): Promise<void> => {
      return new Promise((resolve) => {
        // Для изображений
        if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          const img = new Image();
          img.onload = () => {
            if (mounted) {
              loaded++;
              setLoadedCount(loaded);
              if (loaded === resources.length) {
                setIsComplete(true);
                onLoadComplete?.();
              }
            }
            resolve();
          };
          img.onerror = () => {
            if (mounted) {
              loaded++;
              setLoadedCount(loaded);
              if (loaded === resources.length) {
                setIsComplete(true);
                onLoadComplete?.();
              }
            }
            resolve();
          };
          img.src = url;
        } 
        // Для других ресурсов (CSS, JS)
        else {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = url.match(/\.css$/i) ? 'style' : 'script';
          link.href = url;
          link.onload = () => {
            if (mounted) {
              loaded++;
              setLoadedCount(loaded);
              if (loaded === resources.length) {
                setIsComplete(true);
                onLoadComplete?.();
              }
            }
            resolve();
          };
          link.onerror = () => {
            if (mounted) {
              loaded++;
              setLoadedCount(loaded);
              if (loaded === resources.length) {
                setIsComplete(true);
                onLoadComplete?.();
              }
            }
            resolve();
          };
          document.head.appendChild(link);
        }
      });
    };

    // Предзагружаем ресурсы с приоритетом
    if (priority === 'high') {
      // Загружаем все сразу для высокого приоритета
      Promise.all(resources.map(preloadResource));
    } else {
      // Загружаем последовательно для низкого приоритета
      const loadSequentially = async () => {
        for (const resource of resources) {
          if (!mounted) break;
          await preloadResource(resource);
        }
      };
      loadSequentially();
    }

    return () => {
      mounted = false;
    };
  }, [resources, onLoadComplete, priority]);

  // Не рендерим ничего, так как это утилитарный компонент
  return null;
};

// Хук для отслеживания прогресса загрузки
export const useResourcePreloader = (resources: string[]) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (resources.length === 0) {
      setProgress(100);
      setIsComplete(true);
      return;
    }

    let loaded = 0;
    let mounted = true;

    const updateProgress = () => {
      if (mounted) {
        const newProgress = (loaded / resources.length) * 100;
        setProgress(newProgress);
        
        if (loaded === resources.length) {
          setIsComplete(true);
        }
      }
    };

    resources.forEach((resource) => {
      if (resource.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        const img = new Image();
        img.onload = () => {
          loaded++;
          updateProgress();
        };
        img.onerror = () => {
          loaded++;
          updateProgress();
        };
        img.src = resource;
      }
    });

    return () => {
      mounted = false;
    };
  }, [resources]);

  return { progress, isComplete };
}; 