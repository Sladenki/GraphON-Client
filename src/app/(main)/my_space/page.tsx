'use client';

import React from 'react';
import { LifeTrace2D } from './components/LifeTrace2D/LifeTrace2D';
import styles from './mySpace.module.scss';

export default function MySpacePage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Мой След</h1>
        <p className={styles.subtitle}>Ваша карта событий и друзей</p>
      </div>
      <div className={styles.canvasContainer}>
        <LifeTrace2D />
      </div>
    </div>
  );
}

