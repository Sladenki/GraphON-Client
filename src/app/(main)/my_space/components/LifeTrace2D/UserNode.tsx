'use client';

import React from 'react';
import styles from './LifeTrace2D.module.scss';

interface UserNodeProps {
  x: number;
  y: number;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
}

export function UserNode({ x, y, isHovered, onHover }: UserNodeProps) {
  const radius = isHovered ? 20 : 15;

  return (
    <g
      className={styles.userNode}
      transform={`translate(${x}, ${y})`}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Внешнее свечение */}
      <circle
        r={radius + 5}
        fill="rgba(124, 106, 239, 0.2)"
        className={styles.glow}
      />
      
      {/* Основной круг */}
      <circle
        r={radius}
        fill="#7C6AEF"
        stroke="#9D8DF5"
        strokeWidth={2}
        className={styles.node}
      />
      
      {/* Внутренний круг */}
      <circle
        r={radius * 0.6}
        fill="#B5A9F7"
        opacity={0.8}
      />

      {/* Подпись при наведении */}
      {isHovered && (
        <text
          y={-radius - 10}
          textAnchor="middle"
          className={styles.label}
          fill="#ffffff"
          fontSize="14"
          fontWeight="600"
        >
          Вы
        </text>
      )}
    </g>
  );
}

