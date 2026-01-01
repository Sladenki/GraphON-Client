'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ThemeName } from '@/components/shared/EventCard/pastelTheme';
import styles from './BackgroundParticles.module.scss';

interface ParticleConfig {
  id: string;
  size: number;
  initialX: number; // percentage
  initialY: number; // percentage
  color: string;
  animation: {
    type: 'float' | 'pulse' | 'drift';
    duration: number;
    delay: number;
    x?: number; // movement range in %
    y?: number; // movement range in %
    scale?: [number, number]; // pulse range
  };
}

interface BackgroundParticlesProps {
  gradientColors?: string[]; // Optional - for future use
  theme: ThemeName; // Theme name for color variations
}

// Generate subtle particles based on gradient colors
// Using deterministic seed-based generation for consistent particles per theme
function generateParticles(theme: ThemeName): ParticleConfig[] {
  const particles: ParticleConfig[] = [];
  const particleCount = 5; // Increased for better visibility

  // Extract base colors (simplified - using theme-based colors)
  const baseColors = getThemeColors(theme);

  // Deterministic seed from theme name for consistent positioning
  const seed = theme.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  for (let i = 0; i < particleCount; i++) {
    // Deterministic "random" based on seed and index
    const pseudoRandom = (multiplier: number) => {
      return ((seed + i * multiplier) % 100) / 100;
    };

    const size = 150 + pseudoRandom(23) * 150; // 150-300px for better visibility
    const x = 5 + pseudoRandom(17) * 90; // 5-95% - wider distribution
    const y = 5 + pseudoRandom(31) * 90; // 5-95%

    // Cycle through colors
    const colorIndex = i % baseColors.length;
    const baseColor = baseColors[colorIndex];

    // Animation type distribution
    const animType = i % 3 === 0 ? 'float' : i % 3 === 1 ? 'pulse' : 'drift';

    particles.push({
      id: `particle-${theme}-${i}`,
      size,
      initialX: x,
      initialY: y,
      color: baseColor,
      animation: {
        type: animType,
        duration: 18 + pseudoRandom(7) * 15, // 18-33 seconds - very slow
        delay: pseudoRandom(11) * 4,
        ...(animType === 'float' && {
          y: -6 + pseudoRandom(13) * 12, // -6% to +6% vertical drift
          x: -4 + pseudoRandom(19) * 8, // -4% to +4% horizontal drift
        }),
        ...(animType === 'pulse' && {
          scale: [0.96, 1.04], // Very subtle scale pulse
        }),
        ...(animType === 'drift' && {
          x: -5 + pseudoRandom(29) * 10, // Slow horizontal drift
          y: -3 + pseudoRandom(37) * 6, // Slow vertical drift
        }),
      },
    });
  }

  return particles;
}

// Get theme-appropriate colors for particles (derived from gradient)
function getThemeColors(theme: ThemeName): string[] {
  // Return low-opacity colors that match common gradient themes
  // These will blend naturally with the gradient background
  const themeColorMap: Record<string, string[]> = {
    'Бизнес': ['rgba(251, 191, 36, 0.25)', 'rgba(245, 158, 11, 0.20)'],
    'Вечеринки': ['rgba(217, 70, 239, 0.25)', 'rgba(168, 85, 247, 0.20)'],
    'Встречи': ['rgba(56, 189, 248, 0.25)', 'rgba(99, 102, 241, 0.20)'],
    'Гастро': ['rgba(251, 191, 36, 0.25)', 'rgba(244, 63, 94, 0.20)'],
    'Город': ['rgba(148, 163, 184, 0.25)', 'rgba(56, 189, 248, 0.20)'],
    'Искусство': ['rgba(236, 72, 153, 0.25)', 'rgba(249, 115, 22, 0.20)'],
    'Кино': ['rgba(99, 102, 241, 0.25)', 'rgba(148, 163, 184, 0.20)'],
    'Музыка': ['rgba(139, 92, 246, 0.25)', 'rgba(244, 63, 94, 0.20)'],
    'Образование': ['rgba(56, 189, 248, 0.25)', 'rgba(16, 185, 129, 0.20)'],
    'Семья': ['rgba(244, 63, 94, 0.25)', 'rgba(251, 191, 36, 0.20)'],
    'Театр': ['rgba(168, 85, 247, 0.25)', 'rgba(244, 63, 94, 0.20)'],
    'Фестивали, праздники': ['rgba(251, 191, 36, 0.25)', 'rgba(217, 70, 239, 0.20)'],
    'Юмор': ['rgba(250, 204, 21, 0.25)', 'rgba(132, 204, 22, 0.20)'],
    'Волонтерство': ['rgba(16, 185, 129, 0.25)', 'rgba(34, 197, 94, 0.20)'],
    'Медиа': ['rgba(139, 92, 246, 0.25)', 'rgba(59, 130, 246, 0.20)'],
    'Наука': ['rgba(56, 189, 248, 0.25)', 'rgba(34, 211, 238, 0.20)'],
    'Отряды': ['rgba(249, 115, 22, 0.25)', 'rgba(244, 63, 94, 0.20)'],
    'Самоуправление': ['rgba(37, 99, 235, 0.25)', 'rgba(148, 163, 184, 0.20)'],
    'Спорт': ['rgba(16, 185, 129, 0.25)', 'rgba(244, 63, 94, 0.20)'],
    'Творчество': ['rgba(236, 72, 153, 0.25)', 'rgba(217, 70, 239, 0.20)'],
  };

  return themeColorMap[theme] || ['rgba(148, 163, 184, 0.25)', 'rgba(100, 116, 139, 0.20)'];
}

export default function BackgroundParticles({ theme }: BackgroundParticlesProps) {
  const particles = useMemo(() => generateParticles(theme), [theme]);

  return (
    <div className={styles.particlesContainer}>
      {particles.map((particle) => {
        const animationProps =
          particle.animation.type === 'pulse'
            ? {
                scale: particle.animation.scale || [0.96, 1.04],
              }
            : {
                x: particle.animation.x ? `${particle.animation.x}%` : 0,
                y: particle.animation.y ? `${particle.animation.y}%` : 0,
              };

        return (
          <motion.div
            key={particle.id}
            className={styles.particle}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.initialX}%`,
              top: `${particle.initialY}%`,
              backgroundColor: particle.color,
            }}
            animate={animationProps}
            transition={{
              duration: particle.animation.duration,
              delay: particle.animation.delay,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}

