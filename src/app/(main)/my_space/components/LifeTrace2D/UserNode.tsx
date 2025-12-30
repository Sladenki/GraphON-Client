'use client';

import React, { useState } from 'react';
import styles from './LifeTrace2D.module.scss';

interface UserNodeProps {
  x: number;
  y: number;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export function UserNode({ x, y, isHovered, onHover, avatarUrl, firstName, lastName, username }: UserNodeProps) {
  const [imageError, setImageError] = useState(false);
  const radius = isHovered ? 35 : 30;
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : username || 'Вы';
  const initials = (firstName?.[0] || lastName?.[0] || username?.[0] || 'Я').toUpperCase();

  const imageUrl = avatarUrl?.startsWith('http') 
    ? avatarUrl 
    : avatarUrl 
      ? `${process.env.NEXT_PUBLIC_S3_URL}/${avatarUrl}`
      : null;

  return (
    <g
      className={styles.userNode}
      transform={`translate(${x}, ${y})`}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Градиент для fallback */}
      <defs>
        <clipPath id="userAvatarClip">
          <circle r={radius} />
        </clipPath>
        <linearGradient id="userGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" />
        </linearGradient>
      </defs>

      {/* Внешнее свечение (как солнце) */}
      <circle
        r={radius + 15}
        fill="rgba(255, 215, 0, 0.15)"
        className={styles.glow}
      />
      <circle
        r={radius + 8}
        fill="rgba(255, 215, 0, 0.25)"
        className={styles.glow}
      />
      
      {/* Обводка */}
      <circle
        r={radius + 3}
        fill="none"
        stroke="rgba(255, 215, 0, 0.5)"
        strokeWidth={2}
      />

      {/* Аватар или fallback */}
      {imageUrl && !imageError ? (
        <image
          href={imageUrl}
          x={-radius}
          y={-radius}
          width={radius * 2}
          height={radius * 2}
          clipPath="url(#userAvatarClip)"
          onError={() => setImageError(true)}
          className={styles.avatarImage}
        />
      ) : (
        <>
          <circle
            r={radius}
            fill="url(#userGradient)"
            stroke="#FFD700"
            strokeWidth={3}
            className={styles.node}
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className={styles.userInitials}
            fill="#000000"
            fontSize={radius * 0.6}
            fontWeight="800"
          >
            {initials}
          </text>
        </>
      )}

      {/* Подпись при наведении */}
      {isHovered && (
        <g>
          <rect
            x={-60}
            y={-radius - 35}
            width={120}
            height={28}
            rx={14}
            fill="rgba(0, 0, 0, 0.85)"
            stroke="#FFD700"
            strokeWidth={2}
          />
          <text
            y={-radius - 18}
            textAnchor="middle"
            className={styles.label}
            fill="#FFD700"
            fontSize="14"
            fontWeight="700"
          >
            {displayName}
          </text>
        </g>
      )}
    </g>
  );
}
