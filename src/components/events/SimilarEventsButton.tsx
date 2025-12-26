'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ThemeName } from '@/components/shared/EventCard/pastelTheme';
import styles from './SimilarEventsButton.module.scss';

interface SimilarEventsButtonProps {
  currentTheme: ThemeName;
  isFiltered: boolean;
  onFilterChange: (theme: ThemeName | null) => void;
}

export default function SimilarEventsButton({
  currentTheme,
  isFiltered,
  onFilterChange,
}: SimilarEventsButtonProps) {
  const handleClick = () => {
    if (isFiltered) {
      // Сброс фильтра - показываем все события
      onFilterChange(null);
    } else {
      // Фильтруем по текущей тематике
      onFilterChange(currentTheme);
    }
  };

  // Не показываем кнопку для темы "Без тематики"
  if (currentTheme === 'Без тематики') {
    return null;
  }

  return (
    <motion.button
      className={styles.button}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-label={isFiltered ? 'Показать все события' : 'Показать похожие события'}>
      <span className={styles.text}>{isFiltered ? 'Показать все' : 'Показать похожее'}</span>
      {isFiltered && (
        <motion.span className={styles.badge} initial={{ scale: 0 }} animate={{ scale: 1 }}>
          {currentTheme}
        </motion.span>
      )}
    </motion.button>
  );
}

