'use client';

import React from 'react';
import { FriendNode } from './types';
import styles from './LifeTrace2D.module.scss';

interface FriendNodeProps {
  friend: FriendNode;
  x: number;
  y: number;
  parentX: number;
  parentY: number;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
}

export function FriendNodeComponent({
  friend,
  x,
  y,
  parentX,
  parentY,
  isHovered,
  onHover,
}: FriendNodeProps) {
  const radius = isHovered ? 6 : 4;
  const color = '#4ECDC4'; // Бирюзовый для друзей

  return (
    <g>
      {/* Линия к родительскому событию */}
      <line
        x1={parentX}
        y1={parentY}
        x2={x}
        y2={y}
        stroke={color}
        strokeWidth={1}
        opacity={0.3}
        className={styles.friendLine}
      />

      {/* Узел друга */}
      <g
        className={styles.friendNode}
        transform={`translate(${x}, ${y})`}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        style={{ cursor: 'pointer' }}
      >
        {/* Внешнее свечение */}
        <circle
          r={radius + 2}
          fill={color}
          opacity={isHovered ? 0.3 : 0.15}
          className={styles.glow}
        />
        
        {/* Основной круг */}
        <circle
          r={radius}
          fill={color}
          stroke={color}
          strokeWidth={1.5}
          className={styles.node}
        />

        {/* Подпись при наведении */}
        {isHovered && (
          <g>
            <rect
              x={-50}
              y={-radius - 25}
              width={100}
              height={20}
              rx={10}
              fill="rgba(0, 0, 0, 0.8)"
              stroke={color}
              strokeWidth={1}
            />
            <text
              y={-radius - 11}
              textAnchor="middle"
              className={styles.label}
              fill="#ffffff"
              fontSize="11"
              fontWeight="500"
            >
              {friend.firstName} {friend.lastName}
            </text>
          </g>
        )}
      </g>
    </g>
  );
}

