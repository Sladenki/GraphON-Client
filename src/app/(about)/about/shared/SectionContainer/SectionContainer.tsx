'use client';

import { ReactNode } from 'react';
import styles from './SectionContainer.module.scss';

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({ 
  children, 
  className = '',
  id
}) => {
  return (
    <section className={`${styles.sectionContainer} ${className}`} id={id}>
      <div className={styles.container}>
        {children}
      </div>
    </section>
  );
}; 