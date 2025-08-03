'use client';

import { useEffect, useRef } from 'react';
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

export const SpaceBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    const createStars = () => {
      const rect = canvas.getBoundingClientRect();
      stars.length = 0;
      
      for (let i = 0; i < 200; i++) {
        stars.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          size: Math.random() * 2 + 0.5,
          brightness: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.5 + 0.1,
          twinkle: Math.random() * Math.PI * 2
        });
      }
    };

    const createNebulae = () => {
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
      
      nebulae.push({
        x: rect.width * 0.5,
        y: rect.height * 0.8,
        radius: 100,
        opacity: 0.06,
        color: '#4b0082',
        pulse: Math.PI * 0.5
      });
    };

    const createPlanets = () => {
      const rect = canvas.getBoundingClientRect();
      planets.length = 0;
      
      // Создаем несколько планет
      planets.push({
        x: rect.width * 0.1,
        y: rect.height * 0.2,
        radius: 8,
        color: '#ff6b6b',
        orbitRadius: 60,
        orbitSpeed: 0.005,
        orbitAngle: 0
      });
      
      planets.push({
        x: rect.width * 0.9,
        y: rect.height * 0.1,
        radius: 12,
        color: '#4ecdc4',
        orbitRadius: 80,
        orbitSpeed: 0.003,
        orbitAngle: Math.PI
      });
      
      planets.push({
        x: rect.width * 0.7,
        y: rect.height * 0.9,
        radius: 6,
        color: '#45b7d1',
        orbitRadius: 40,
        orbitSpeed: 0.008,
        orbitAngle: Math.PI * 1.5
      });
    };

    const drawStars = () => {
      const rect = canvas.getBoundingClientRect();
      
             stars.forEach(star => {
         const twinkle = Math.sin(time * star.speed + star.twinkle) * 0.3 + 0.7;
         const brightness = Math.max(0, Math.min(1, star.brightness * twinkle)); // Ограничиваем brightness от 0 до 1
         
         ctx.beginPath();
         ctx.arc(star.x, star.y, Math.max(0.1, star.size), 0, Math.PI * 2); // Минимальный радиус 0.1
         ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
         ctx.fill();
         
         // Добавляем свечение для ярких звезд
         if (brightness > 0.5) {
           ctx.beginPath();
           ctx.arc(star.x, star.y, Math.max(0.3, star.size * 3), 0, Math.PI * 2); // Минимальный радиус 0.3
           ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.1})`;
           ctx.fill();
         }
       });
    };

    const drawNebulae = () => {
      const rect = canvas.getBoundingClientRect();
      
             nebulae.forEach(nebula => {
         const pulse = Math.sin(time * 0.5 + nebula.pulse) * 0.2 + 0.8;
         const opacity = Math.max(0, Math.min(1, nebula.opacity * pulse)); // Ограничиваем opacity от 0 до 1
         
         // Создаем радиальный градиент для туманности
         const gradient = ctx.createRadialGradient(
           nebula.x, nebula.y, 0,
           nebula.x, nebula.y, Math.max(1, nebula.radius) // Минимальный радиус 1
         );
         gradient.addColorStop(0, `${nebula.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
         gradient.addColorStop(0.5, `${nebula.color}${Math.floor(opacity * 0.5 * 255).toString(16).padStart(2, '0')}`);
         gradient.addColorStop(1, 'transparent');
         
         ctx.beginPath();
         ctx.arc(nebula.x, nebula.y, Math.max(1, nebula.radius), 0, Math.PI * 2); // Минимальный радиус 1
         ctx.fillStyle = gradient;
         ctx.fill();
       });
    };

    const drawPlanets = () => {
      const rect = canvas.getBoundingClientRect();
      
      planets.forEach(planet => {
        // Обновляем орбиту
        planet.orbitAngle += planet.orbitSpeed;
        const orbitX = rect.width * 0.5 + Math.cos(planet.orbitAngle) * planet.orbitRadius;
        const orbitY = rect.height * 0.5 + Math.sin(planet.orbitAngle) * planet.orbitRadius;
        
                 // Рисуем орбиту
         ctx.beginPath();
         ctx.arc(rect.width * 0.5, rect.height * 0.5, Math.max(1, planet.orbitRadius), 0, Math.PI * 2);
         ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
         ctx.lineWidth = 1;
         ctx.stroke();
         
         // Рисуем планету
         ctx.beginPath();
         ctx.arc(orbitX, orbitY, Math.max(0.5, planet.radius), 0, Math.PI * 2);
         ctx.fillStyle = planet.color;
         ctx.fill();
         
         // Добавляем свечение
         ctx.beginPath();
         ctx.arc(orbitX, orbitY, Math.max(1, planet.radius * 2), 0, Math.PI * 2);
         ctx.fillStyle = `${planet.color}20`;
         ctx.fill();
      });
    };

    const drawCosmicParticles = () => {
      const rect = canvas.getBoundingClientRect();
      
      // Рисуем космические частицы
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(time * 0.1 + i) * rect.width * 0.5) + rect.width * 0.5;
        const y = (Math.cos(time * 0.15 + i * 0.5) * rect.height * 0.5) + rect.height * 0.5;
        const size = Math.abs(Math.sin(time + i) * 2 + 1); // Используем Math.abs для предотвращения отрицательного радиуса
        const opacity = Math.abs(Math.sin(time * 0.5 + i) * 0.3 + 0.2); // Также используем Math.abs для opacity
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(138, 43, 226, ${opacity})`;
        ctx.fill();
      }
    };

    const drawSpaceGrid = () => {
      const rect = canvas.getBoundingClientRect();
      const gridSize = 100;
      const opacity = 0.03;
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.lineWidth = 1;
      
      // Вертикальные линии
      for (let x = 0; x <= rect.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, rect.height);
        ctx.stroke();
      }
      
      // Горизонтальные линии
      for (let y = 0; y <= rect.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(rect.width, y);
        ctx.stroke();
      }
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      // Создаем космический градиент
      const gradient = ctx.createRadialGradient(
        rect.width * 0.5, rect.height * 0.5, 0,
        rect.width * 0.5, rect.height * 0.5, Math.max(rect.width, rect.height) * 0.8
      );
      gradient.addColorStop(0, 'rgba(15, 15, 35, 1)');
      gradient.addColorStop(0.5, 'rgba(25, 25, 45, 1)');
      gradient.addColorStop(1, 'rgba(10, 10, 25, 1)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      drawSpaceGrid();
      drawNebulae();
      drawPlanets();
      drawCosmicParticles();
      drawStars();
      
      time += 0.016;
      animationId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createStars();
    createNebulae();
    createPlanets();
    animate();

    window.addEventListener('resize', () => {
      resizeCanvas();
      createStars();
      createNebulae();
      createPlanets();
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className={styles.spaceBackground}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.overlay} />
    </div>
  );
}; 