'use client';

import React from 'react';
import { EventNode, CATEGORY_COLORS } from './types';
import styles from './LifeTrace2D.module.scss';

interface EventNodeProps {
  event: EventNode;
  x: number;
  y: number;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
}

export function EventNodeComponent({
  event,
  x,
  y,
  isHovered,
  isSelected,
  onHover,
  onClick,
}: EventNodeProps) {
  const radius = isHovered || isSelected ? 12 : 8;
  const color = CATEGORY_COLORS[event.category];

  return (
    <g
      className={styles.eventNode}
      transform={`translate(${x}, ${y})`}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Внешнее свечение */}
      <circle
        r={radius + 4}
        fill={color}
        opacity={isHovered || isSelected ? 0.3 : 0.15}
        className={styles.glow}
      />
      
      {/* Основной круг */}
      <circle
        r={radius}
        fill={color}
        stroke={color}
        strokeWidth={isSelected ? 3 : 2}
        className={styles.node}
        opacity={isSelected ? 1 : 0.9}
      />
      
      {/* Внутренний круг */}
      <circle
        r={radius * 0.5}
        fill="#ffffff"
        opacity={0.6}
      />

      {/* Подпись при наведении */}
      {(isHovered || isSelected) && (
        <g>
          <rect
            x={-60}
            y={-radius - 30}
            width={120}
            height={24}
            rx={12}
            fill="rgba(0, 0, 0, 0.8)"
            stroke={color}
            strokeWidth={1}
          />
          <text
            y={-radius - 14}
            textAnchor="middle"
            className={styles.label}
            fill="#ffffff"
            fontSize="12"
            fontWeight="600"
          >
            {event.name.length > 18 ? `${event.name.substring(0, 18)}...` : event.name}
          </text>
        </g>
      )}
    </g>
  );
}

