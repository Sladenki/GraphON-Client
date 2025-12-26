'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { getPastelTheme, ThemeName } from '@/components/shared/EventCard/pastelTheme';
import AnimatedObjects from './AnimatedObjects';
import styles from './DynamicBackground.module.scss';

interface DynamicBackgroundProps {
  theme: ThemeName;
  isDark?: boolean;
}

export default function DynamicBackground({ theme, isDark = false }: DynamicBackgroundProps) {
  const themeData = getPastelTheme(theme);

  const backgroundStyle = isDark ? themeData.headerBgDark : themeData.headerBgLight;

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
      <AnimatedObjects theme={theme} />
    </motion.div>
  );
}

