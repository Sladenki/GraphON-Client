'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import styles from './AnimatedCard.module.scss';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  whileHover?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  className = '', 
  delay = 0,
  whileHover = true
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay
      }
    }
  };

  return (
    <motion.div
      className={`${styles.animatedCard} ${className}`}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover={whileHover ? { 
        scale: 1.05,
        transition: { duration: 0.2 }
      } : undefined}
    >
      {children}
    </motion.div>
  );
}; 