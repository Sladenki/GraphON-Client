'use client';

import React, { ReactNode } from 'react';
import styles from './EventsTikTokContainer.module.scss';

interface EventsTikTokContainerProps {
  children: ReactNode;
}

export default function EventsTikTokContainer({ children }: EventsTikTokContainerProps) {
  return (
    <div className={styles.container}>
      <div className={styles.slidesContainer}>{children}</div>
    </div>
  );
}

