'use client';

import React, { useState } from 'react';
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
  const [imageError, setImageError] = useState(false);
  const radius = isHovered ? 18 : 14;
  const color = '#4ECDC4'; // Бирюзовый для друзей
  const displayName = `${friend.firstName} ${friend.lastName}`;
  const initials = (friend.firstName?.[0] || friend.lastName?.[0] || friend.username?.[0] || 'F').toUpperCase();

  const imageUrl = friend.avatarUrl?.startsWith('http') 
    ? friend.avatarUrl 
    : friend.avatarUrl 
      ? `${process.env.NEXT_PUBLIC_S3_URL}/${friend.avatarUrl}`
      : null;

  return (
    <g>
      {/* Линия к родительскому событию */}
      <line
        x1={parentX}
        y1={parentY}
        x2={x}
        y2={y}
        stroke={color}
        strokeWidth={1.5}
        opacity={0.4}
        className={styles.friendLine}
      />

      {/* Узел друга с аватаром */}
      <g
        className={styles.friendNode}
        transform={`translate(${x}, ${y})`}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        style={{ cursor: 'pointer' }}
      >
        {/* Внешнее свечение */}
        <circle
          r={radius + 3}
          fill={color}
          opacity={isHovered ? 0.3 : 0.15}
          className={styles.glow}
        />
        
        {/* Обводка */}
        <circle
          r={radius + 1}
          fill="none"
          stroke={color}
          strokeWidth={2}
          opacity={0.6}
        />

        {/* Маска для обрезки изображения */}
        <defs>
          <clipPath id={`friendAvatarClip-${friend.id}`}>
            <circle r={radius} />
          </clipPath>
        </defs>

        {/* Аватар или fallback */}
        {imageUrl && !imageError ? (
          <image
            href={imageUrl}
            x={-radius}
            y={-radius}
            width={radius * 2}
            height={radius * 2}
            clipPath={`url(#friendAvatarClip-${friend.id})`}
            onError={() => setImageError(true)}
            className={styles.avatarImage}
          />
        ) : (
          <circle
            r={radius}
            fill={color}
            stroke={color}
            strokeWidth={2}
            className={styles.node}
          />
        )}

        {/* Fallback с инициалами */}
        {(!imageUrl || imageError) && (
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className={styles.friendInitials}
            fill="#ffffff"
            fontSize={radius * 0.7}
            fontWeight="700"
          >
            {initials}
          </text>
        )}

        {/* Подпись при наведении */}
        {isHovered && (
          <g>
            <rect
              x={-60}
              y={-radius - 30}
              width={120}
              height={24}
              rx={12}
              fill="rgba(0, 0, 0, 0.85)"
              stroke={color}
              strokeWidth={1.5}
            />
            <text
              y={-radius - 15}
              textAnchor="middle"
              className={styles.label}
              fill="#ffffff"
              fontSize="12"
              fontWeight="600"
            >
              {displayName}
            </text>
          </g>
        )}
      </g>
    </g>
  );
}

