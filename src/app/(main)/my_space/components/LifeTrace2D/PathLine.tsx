'use client';

import React from 'react';
import styles from './LifeTrace2D.module.scss';

interface PathLineProps {
  points: Array<{ x: number; y: number }>;
}

export function PathLine({ points }: PathLineProps) {
  if (points.length < 2) return null;

  // Создаем путь через все точки
  const pathData = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    // Используем плавные кривые Безье
    const prevPoint = points[index - 1];
    const cp1x = prevPoint.x + (point.x - prevPoint.x) * 0.5;
    const cp1y = prevPoint.y;
    const cp2x = point.x - (point.x - prevPoint.x) * 0.5;
    const cp2y = point.y;
    return `${path} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`;
  }, '');

  return (
    <path
      d={pathData}
      fill="none"
      stroke="#7C6AEF"
      strokeWidth={2}
      opacity={0.6}
      className={styles.pathLine}
      filter="url(#glow)"
    />
  );
}

