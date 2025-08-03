'use client';

import { useEffect, useRef } from 'react';
import styles from './WaveBackground.module.scss';

export const WaveBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    const drawWave = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Создаем градиент
      const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.1)');
      gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.1)');
      gradient.addColorStop(1, 'rgba(236, 72, 153, 0.1)');

      ctx.fillStyle = gradient;

      // Рисуем волны
      ctx.beginPath();
      ctx.moveTo(0, rect.height);

      for (let x = 0; x <= rect.width; x += 2) {
        const y1 = rect.height * 0.7 + Math.sin(x * 0.01 + time) * 50;
        const y2 = rect.height * 0.8 + Math.sin(x * 0.015 + time * 1.5) * 30;
        const y3 = rect.height * 0.9 + Math.sin(x * 0.02 + time * 2) * 20;

        const avgY = (y1 + y2 + y3) / 3;
        ctx.lineTo(x, avgY);
      }

      ctx.lineTo(rect.width, rect.height);
      ctx.closePath();
      ctx.fill();

      time += 0.02;
      animationId = requestAnimationFrame(drawWave);
    };

    resizeCanvas();
    drawWave();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className={styles.waveBackground}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.overlay} />
    </div>
  );
}; 