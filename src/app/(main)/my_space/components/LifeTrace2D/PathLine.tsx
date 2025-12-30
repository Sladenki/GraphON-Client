'use client';

import React, { useMemo } from 'react';
import { EventNode, CATEGORY_COLORS } from './types';
import styles from './LifeTrace2D.module.scss';

interface PathLineProps {
  points: Array<{ x: number; y: number; category?: string }>;
  events?: EventNode[];
}

export function PathLine({ points, events = [] }: PathLineProps) {
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

  // Создаем градиенты для каждого сегмента пути
  const gradients = useMemo(() => {
    const gradientElements: JSX.Element[] = [];
    
    for (let i = 0; i < points.length - 1; i++) {
      const startCategory = points[i].category || 'general';
      const endCategory = points[i + 1].category || 'general';
      const startColor = CATEGORY_COLORS[startCategory as keyof typeof CATEGORY_COLORS];
      const endColor = CATEGORY_COLORS[endCategory as keyof typeof CATEGORY_COLORS];
      
      // Создаем уникальный ID для градиента
      const gradientId = `pathGradient-${i}`;
      
      gradientElements.push(
        <linearGradient key={gradientId} id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={startColor} />
          <stop offset="100%" stopColor={endColor} />
        </linearGradient>
      );
    }
    
    return gradientElements;
  }, [points]);

  // Создаем отдельные сегменты пути с градиентами (плавные кривые)
  const pathSegments = useMemo(() => {
    const segments: JSX.Element[] = [];
    
    for (let i = 0; i < points.length - 1; i++) {
      const startPoint = points[i];
      const endPoint = points[i + 1];
      
      // Плавные кривые Безье для каждого сегмента
      const cp1x = startPoint.x + (endPoint.x - startPoint.x) * 0.5;
      const cp1y = startPoint.y;
      const cp2x = endPoint.x - (endPoint.x - startPoint.x) * 0.5;
      const cp2y = endPoint.y;
      
      const segmentPath = `M ${startPoint.x} ${startPoint.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endPoint.x} ${endPoint.y}`;
      
      const gradientId = `pathGradient-${i}`;
      
      segments.push(
        <path
          key={`segment-${i}`}
          d={segmentPath}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={3}
          opacity={0.7}
          className={styles.pathLine}
          filter="url(#glow)"
        />
      );
    }
    
    return segments;
  }, [points]);

  return (
    <>
      <defs>
        {gradients}
      </defs>
      {pathSegments}
    </>
  );
}

