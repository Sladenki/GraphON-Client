'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getPastelTheme, ThemeName } from '@/components/shared/EventCard/pastelTheme';
import AnimatedObjects from './AnimatedObjects';
import styles from './DynamicBackground.module.scss';

interface DynamicBackgroundProps {
  theme: ThemeName;
  isDark?: boolean;
}

// Функция для генерации дополнительных градиентных цветов на основе темы
function getThemeGradients(theme: ThemeName): string[] {
  switch (theme) {
    case 'Музыка':
      return [
        'radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.4) 0%, transparent 60%)',
        'radial-gradient(circle at 80% 70%, rgba(217, 70, 239, 0.3) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 50%, rgba(244, 63, 94, 0.25) 0%, transparent 70%)',
      ];
    case 'Бизнес':
      return [
        'radial-gradient(circle at 25% 40%, rgba(251, 191, 36, 0.35) 0%, transparent 60%)',
        'radial-gradient(circle at 75% 60%, rgba(245, 158, 11, 0.3) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 20%, rgba(217, 119, 6, 0.25) 0%, transparent 70%)',
      ];
    case 'Искусство':
    case 'Творчество':
      return [
        'radial-gradient(circle at 30% 35%, rgba(236, 72, 153, 0.4) 0%, transparent 60%)',
        'radial-gradient(circle at 70% 65%, rgba(249, 115, 22, 0.3) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 80%, rgba(217, 70, 239, 0.25) 0%, transparent 70%)',
      ];
    case 'Образование':
    case 'Наука':
      return [
        'radial-gradient(circle at 20% 50%, rgba(56, 189, 248, 0.35) 0%, transparent 60%)',
        'radial-gradient(circle at 80% 25%, rgba(16, 185, 129, 0.3) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 75%, rgba(34, 211, 238, 0.25) 0%, transparent 70%)',
      ];
    case 'Спорт':
      return [
        'radial-gradient(circle at 30% 45%, rgba(132, 204, 22, 0.35) 0%, transparent 60%)',
        'radial-gradient(circle at 70% 55%, rgba(244, 63, 94, 0.3) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 30%, rgba(251, 191, 36, 0.25) 0%, transparent 70%)',
      ];
    case 'Кино':
      return [
        'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.35) 0%, transparent 60%)',
        'radial-gradient(circle at 80% 70%, rgba(148, 163, 184, 0.3) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.25) 0%, transparent 70%)',
      ];
    case 'Театр':
      return [
        'radial-gradient(circle at 15% 50%, rgba(168, 85, 247, 0.4) 0%, transparent 60%)',
        'radial-gradient(circle at 85% 30%, rgba(244, 63, 94, 0.3) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 80%, rgba(217, 70, 239, 0.25) 0%, transparent 70%)',
      ];
    case 'Гастро':
      return [
        'radial-gradient(circle at 30% 50%, rgba(251, 191, 36, 0.35) 0%, transparent 60%)',
        'radial-gradient(circle at 70% 40%, rgba(244, 63, 94, 0.3) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 70%, rgba(249, 115, 22, 0.25) 0%, transparent 70%)',
      ];
    case 'Вечеринки':
    case 'Фестивали, праздники':
      return [
        'radial-gradient(circle at 25% 30%, rgba(251, 191, 36, 0.35) 0%, transparent 60%)',
        'radial-gradient(circle at 75% 70%, rgba(217, 70, 239, 0.3) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.25) 0%, transparent 70%)',
      ];
    case 'Юмор':
      return [
        'radial-gradient(circle at 30% 40%, rgba(250, 204, 21, 0.35) 0%, transparent 60%)',
        'radial-gradient(circle at 70% 60%, rgba(132, 204, 22, 0.3) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 25%, rgba(251, 191, 36, 0.25) 0%, transparent 70%)',
      ];
    case 'Семья':
      return [
        'radial-gradient(circle at 20% 35%, rgba(244, 63, 94, 0.35) 0%, transparent 60%)',
        'radial-gradient(circle at 80% 65%, rgba(251, 191, 36, 0.3) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 80%, rgba(249, 115, 22, 0.25) 0%, transparent 70%)',
      ];
    case 'Город':
    case 'Самоуправление':
      return [
        'radial-gradient(circle at 15% 45%, rgba(148, 163, 184, 0.35) 0%, transparent 60%)',
        'radial-gradient(circle at 85% 55%, rgba(56, 189, 248, 0.3) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 30%, rgba(71, 85, 105, 0.25) 0%, transparent 70%)',
      ];
    case 'Волонтерство':
      return [
        'radial-gradient(circle at 20% 40%, rgba(132, 204, 22, 0.35) 0%, transparent 60%)',
        'radial-gradient(circle at 80% 60%, rgba(16, 185, 129, 0.3) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 75%, rgba(34, 211, 238, 0.25) 0%, transparent 70%)',
      ];
    default:
      return [
        'radial-gradient(circle at 25% 40%, rgba(148, 163, 184, 0.3) 0%, transparent 60%)',
        'radial-gradient(circle at 75% 60%, rgba(113, 113, 122, 0.25) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 50%, rgba(71, 85, 105, 0.2) 0%, transparent 70%)',
      ];
  }
}

export default function DynamicBackground({ theme, isDark = false }: DynamicBackgroundProps) {
  const themeData = getPastelTheme(theme);
  const backgroundStyle = isDark ? themeData.headerBgDark : themeData.headerBgLight;
  const gradientLayers = useMemo(() => getThemeGradients(theme), [theme]);

  return (
    <motion.div
      className={styles.background}
      style={{
        background: backgroundStyle,
      }}
      animate={{
        background: backgroundStyle,
      }}
      transition={{
        duration: 0.8,
        ease: 'easeInOut',
      }}>
      {/* Дополнительные градиентные слои для динамичности */}
      <div className={styles.gradientLayer1} style={{ background: gradientLayers[0] }} />
      <div className={styles.gradientLayer2} style={{ background: gradientLayers[1] }} />
      <div className={styles.gradientLayer3} style={{ background: gradientLayers[2] }} />
      
      <AnimatedObjects theme={theme} />
    </motion.div>
  );
}

