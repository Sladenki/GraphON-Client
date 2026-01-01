'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { getPastelTheme, getPastelThemeTikTok, ThemeName } from '@/components/shared/EventCard/pastelTheme';
import AnimatedObjects from './AnimatedObjects';
import styles from './DynamicBackground.module.scss';

interface DynamicBackgroundProps {
  theme: ThemeName;
  isDark?: boolean;
}

// Функция для генерации дополнительных градиентных цветов на основе темы (TikTok версия - более насыщенные)
function getThemeGradientsTikTok(theme: ThemeName): string[] {
  switch (theme) {
    case 'Музыка':
      return [
        'radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.75) 0%, transparent 60%)',
        'radial-gradient(circle at 80% 70%, rgba(217, 70, 239, 0.65) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 50%, rgba(244, 63, 94, 0.6) 0%, transparent 70%)',
      ];
    case 'Бизнес':
      return [
        'radial-gradient(circle at 25% 40%, rgba(251, 191, 36, 0.7) 0%, transparent 60%)',
        'radial-gradient(circle at 75% 60%, rgba(245, 158, 11, 0.65) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 20%, rgba(217, 119, 6, 0.6) 0%, transparent 70%)',
      ];
    case 'Искусство':
    case 'Творчество':
      return [
        'radial-gradient(circle at 30% 35%, rgba(236, 72, 153, 0.75) 0%, transparent 60%)',
        'radial-gradient(circle at 70% 65%, rgba(249, 115, 22, 0.65) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 80%, rgba(217, 70, 239, 0.6) 0%, transparent 70%)',
      ];
    case 'Образование':
    case 'Наука':
      return [
        'radial-gradient(circle at 20% 50%, rgba(56, 189, 248, 0.7) 0%, transparent 60%)',
        'radial-gradient(circle at 80% 25%, rgba(16, 185, 129, 0.65) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 75%, rgba(34, 211, 238, 0.6) 0%, transparent 70%)',
      ];
    case 'Спорт':
      return [
        'radial-gradient(circle at 30% 45%, rgba(132, 204, 22, 0.7) 0%, transparent 60%)',
        'radial-gradient(circle at 70% 55%, rgba(244, 63, 94, 0.65) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 30%, rgba(251, 191, 36, 0.6) 0%, transparent 70%)',
      ];
    case 'Кино':
      return [
        'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.7) 0%, transparent 60%)',
        'radial-gradient(circle at 80% 70%, rgba(148, 163, 184, 0.65) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.6) 0%, transparent 70%)',
      ];
    case 'Театр':
      return [
        'radial-gradient(circle at 15% 50%, rgba(168, 85, 247, 0.75) 0%, transparent 60%)',
        'radial-gradient(circle at 85% 30%, rgba(244, 63, 94, 0.65) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 80%, rgba(217, 70, 239, 0.6) 0%, transparent 70%)',
      ];
    case 'Гастро':
      return [
        'radial-gradient(circle at 30% 50%, rgba(251, 191, 36, 0.65) 0%, transparent 60%)',
        'radial-gradient(circle at 70% 40%, rgba(244, 63, 94, 0.6) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 70%, rgba(249, 115, 22, 0.55) 0%, transparent 70%)',
      ];
    case 'Вечеринки':
    case 'Фестивали, праздники':
      return [
        'radial-gradient(circle at 25% 30%, rgba(251, 191, 36, 0.7) 0%, transparent 60%)',
        'radial-gradient(circle at 75% 70%, rgba(217, 70, 239, 0.65) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.6) 0%, transparent 70%)',
      ];
    case 'Юмор':
      return [
        'radial-gradient(circle at 30% 40%, rgba(250, 204, 21, 0.7) 0%, transparent 60%)',
        'radial-gradient(circle at 70% 60%, rgba(132, 204, 22, 0.65) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 25%, rgba(251, 191, 36, 0.6) 0%, transparent 70%)',
      ];
    case 'Семья':
      return [
        'radial-gradient(circle at 20% 35%, rgba(244, 63, 94, 0.7) 0%, transparent 60%)',
        'radial-gradient(circle at 80% 65%, rgba(251, 191, 36, 0.65) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 80%, rgba(249, 115, 22, 0.6) 0%, transparent 70%)',
      ];
    case 'Город':
    case 'Самоуправление':
      return [
        'radial-gradient(circle at 15% 45%, rgba(148, 163, 184, 0.7) 0%, transparent 60%)',
        'radial-gradient(circle at 85% 55%, rgba(56, 189, 248, 0.65) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 30%, rgba(71, 85, 105, 0.6) 0%, transparent 70%)',
      ];
    case 'Волонтерство':
      return [
        'radial-gradient(circle at 20% 40%, rgba(132, 204, 22, 0.7) 0%, transparent 60%)',
        'radial-gradient(circle at 80% 60%, rgba(16, 185, 129, 0.65) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 75%, rgba(34, 211, 238, 0.6) 0%, transparent 70%)',
      ];
    default:
      return [
        'radial-gradient(circle at 25% 40%, rgba(148, 163, 184, 0.65) 0%, transparent 60%)',
        'radial-gradient(circle at 75% 60%, rgba(113, 113, 122, 0.6) 0%, transparent 60%)',
        'radial-gradient(circle at 50% 50%, rgba(71, 85, 105, 0.55) 0%, transparent 70%)',
      ];
  }
}

export default function DynamicBackground({ theme, isDark = false }: DynamicBackgroundProps) {
  const { theme: appTheme } = useTheme();
  
  // Определяем, активна ли темная тема приложения
  const isDarkTheme = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const html = document.documentElement;
    const dataTheme = html.getAttribute('data-theme');
    return appTheme === 'dark' || dataTheme === 'dark' || html.classList.contains('dark') || isDark;
  }, [appTheme, isDark]);
  
  // Используем более насыщенные цвета для TikTok версии
  const themeData = getPastelThemeTikTok(theme);
  const backgroundStyle = isDarkTheme ? themeData.headerBgDark : themeData.headerBgLight;
  const gradientLayers = useMemo(() => getThemeGradientsTikTok(theme), [theme]);

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

