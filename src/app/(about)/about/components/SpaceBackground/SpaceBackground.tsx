'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './SpaceBackground.module.scss';

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  speed: number;
  twinkle: number;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  color: string;
  pulse: number;
}

interface Planet {
  x: number;
  y: number;
  radius: number;
  color: string;
  orbitRadius: number;
  orbitSpeed: number;
  orbitAngle: number;
}

interface SpaceBackgroundProps {
  isMobile?: boolean;
  isLowEndDevice?: boolean;
  shouldReduceMotion?: boolean;
  starCount?: number;
  animationSpeed?: number;
  quality?: 'low' | 'high';
}

export const SpaceBackground = ({ 
  isMobile = false, 
  isLowEndDevice = false, 
  shouldReduceMotion = false,
  starCount = 200,
  animationSpeed = 1,
  quality = 'high'
}: SpaceBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    const stars: Star[] = [];
    const nebulae: Nebula[] = [];
    const planets: Planet[] = [];

    // Оптимизированные настройки для мобильных
    const optimizedStarCount = isMobile ? Math.min(starCount, 100) : starCount;
    const optimizedAnimationSpeed = shouldReduceMotion ? 0.5 : animationSpeed;
    const useLowQuality = quality === 'low' || isLowEndDevice;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = useLowQuality ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    const createStars = () => {
      const rect = canvas.getBoundingClientRect();
      stars.length = 0;
      
      for (let i = 0; i < optimizedStarCount; i++) {
        stars.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          size: Math.random() * (isMobile ? 1.5 : 2) + 0.5,
          brightness: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.5 + 0.1,
          twinkle: Math.random() * Math.PI * 2
        });
      }
    };

    const createNebulae = () => {
      if (isMobile || useLowQuality) return; // Пропускаем туманности на мобильных
      
      const rect = canvas.getBoundingClientRect();
      nebulae.length = 0;
      
      // Создаем несколько туманностей
      nebulae.push({
        x: rect.width * 0.2,
        y: rect.height * 0.3,
        radius: 150,
        opacity: 0.1,
        color: '#8a2be2',
        pulse: 0
      });
      
      nebulae.push({
        x: rect.width * 0.8,
        y: rect.height * 0.7,
        radius: 120,
        opacity: 0.08,
        color: '#9370db',
        pulse: Math.PI
      });
    };

    const createPlanets = () => {
      if (isMobile || useLowQuality) return; // Пропускаем планеты на мобильных
      
      const rect = canvas.getBoundingClientRect();
      planets.length = 0;
      
      // Создаем несколько планет
      planets.push({
        x: rect.width * 0.3,
        y: rect.height * 0.2,
        radius: 20,
        color: '#ff6b6b',
        orbitRadius: 80,
        orbitSpeed: 0.002,
        orbitAngle: 0
      });
      
      planets.push({
        x: rect.width * 0.7,
        y: rect.height * 0.8,
        radius: 15,
        color: '#4ecdc4',
        orbitRadius: 60,
        orbitSpeed: 0.003,
        orbitAngle: Math.PI
      });
    };

    const drawStars = () => {
      ctx.save();
      
      stars.forEach(star => {
        const twinkle = shouldReduceMotion ? 1 : Math.sin(time * star.speed + star.twinkle) * 0.3 + 0.7;
        const alpha = star.brightness * twinkle;
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffffff';
        
        if (useLowQuality) {
          // Упрощенная отрисовка для мобильных
          ctx.fillRect(star.x, star.y, star.size, star.size);
        } else {
          // Полная отрисовка для десктопа
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      ctx.restore();
    };

    const drawNebulae = () => {
      if (isMobile || useLowQuality) return;
      
      ctx.save();
      
      nebulae.forEach(nebula => {
        const pulse = shouldReduceMotion ? 1 : Math.sin(time * 0.5 + nebula.pulse) * 0.2 + 0.8;
        const opacity = nebula.opacity * pulse;
        
        const gradient = ctx.createRadialGradient(
          nebula.x, nebula.y, 0,
          nebula.x, nebula.y, nebula.radius
        );
        
        gradient.addColorStop(0, `${nebula.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.restore();
    };

    const drawPlanets = () => {
      if (isMobile || useLowQuality) return;
      
      ctx.save();
      
      planets.forEach(planet => {
        // Обновляем орбиту
        planet.orbitAngle += planet.orbitSpeed * optimizedAnimationSpeed;
        planet.x = planet.x + Math.cos(planet.orbitAngle) * planet.orbitRadius * 0.01;
        planet.y = planet.y + Math.sin(planet.orbitAngle) * planet.orbitRadius * 0.01;
        
        // Отрисовка планеты
        ctx.fillStyle = planet.color;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Добавляем свечение
        const glow = ctx.createRadialGradient(
          planet.x, planet.y, 0,
          planet.x, planet.y, planet.radius * 2
        );
        glow.addColorStop(0, `${planet.color}40`);
        glow.addColorStop(1, 'transparent');
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius * 2, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.restore();
    };

    const drawCosmicParticles = () => {
      if (isMobile || useLowQuality) return;
      
      ctx.save();
      ctx.strokeStyle = '#667eea';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      
      for (let i = 0; i < 20; i++) {
        const x = Math.sin(time * 0.1 + i) * canvas.width * 0.5 + canvas.width * 0.5;
        const y = Math.cos(time * 0.15 + i) * canvas.height * 0.5 + canvas.height * 0.5;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.sin(time + i) * 20, y + Math.cos(time + i) * 20);
        ctx.stroke();
      }
      
      ctx.restore();
    };

    const drawSpaceGrid = () => {
      if (isMobile || useLowQuality) return;
      
      ctx.save();
      ctx.strokeStyle = '#667eea';
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.1;
      
      const gridSize = 100;
      const offset = time * 10;
      
      // Вертикальные линии
      for (let x = -offset; x < canvas.width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Горизонтальные линии
      for (let y = -offset; y < canvas.height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      ctx.restore();
    };

    const animate = () => {
      if (!isVisible) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Рисуем элементы только если они видны
      drawStars();
      drawNebulae();
      drawPlanets();
      drawCosmicParticles();
      drawSpaceGrid();
      
      time += optimizedAnimationSpeed;
      animationId = requestAnimationFrame(animate);
    };

    // Intersection Observer для оптимизации
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (canvas) {
      observer.observe(canvas);
    }

    // Инициализация
    const init = () => {
      resizeCanvas();
      createStars();
      createNebulae();
      createPlanets();
      setIsInitialized(true);
    };

    init();
    animate();

    // Обработчики событий
    const handleResize = () => {
      resizeCanvas();
      createStars();
      createNebulae();
      createPlanets();
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile, isLowEndDevice, shouldReduceMotion, starCount, animationSpeed, quality]);

  // Показываем упрощенный фон для мобильных
  if (isMobile && !isInitialized) {
    return (
      <div className={styles.mobileBackground}>
        <div className={styles.mobileStars}>
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className={styles.mobileStar}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={styles.spaceCanvas}
      style={{
        opacity: isInitialized ? 1 : 0,
        transition: 'opacity 0.5s ease'
      }}
    />
  );
}; 