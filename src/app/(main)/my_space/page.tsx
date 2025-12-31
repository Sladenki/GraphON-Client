'use client';

import React from 'react';
import { VerticalTimeline } from './components/VerticalTimeline/VerticalTimeline';
import styles from './mySpace.module.scss';

export default function MySpacePage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Мой Путь</h1>
        <p className={styles.subtitle}>Ваша карта событий и друзей</p>
      </div>
      <div className={styles.canvasContainer}>
        <VerticalTimeline />
      </div>
    </div>
  );
}

