'use client';

import { motion } from 'framer-motion';
import styles from './AnimatedBackground.module.scss';

export const AnimatedBackground = () => {
  return (
    <div className={styles.background}>
      {/* Анимированные графы */}
      <motion.div
        className={styles.graphNode}
        style={{ top: '10%', left: '15%' }}
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className={styles.graphNode}
        style={{ top: '20%', right: '20%' }}
        animate={{
          y: [0, 15, 0],
          rotate: [0, -3, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className={styles.graphNode}
        style={{ bottom: '30%', left: '10%' }}
        animate={{
          y: [0, -10, 0],
          rotate: [0, 2, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className={styles.graphNode}
        style={{ bottom: '20%', right: '15%' }}
        animate={{
          y: [0, 25, 0],
          rotate: [0, -4, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Соединительные линии */}
      <motion.div
        className={styles.connectionLine}
        style={{ top: '15%', left: '20%', width: '100px', transform: 'rotate(45deg)' }}
        animate={{
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className={styles.connectionLine}
        style={{ top: '25%', right: '25%', width: '80px', transform: 'rotate(-30deg)' }}
        animate={{
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className={styles.connectionLine}
        style={{ bottom: '25%', left: '15%', width: '120px', transform: 'rotate(60deg)' }}
        animate={{
          opacity: [0.4, 0.9, 0.4],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Плавающие частицы */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className={styles.particle}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 2,
          }}
        />
      ))}
      
      {/* Градиентные круги */}
      <motion.div
        className={styles.gradientCircle}
        style={{ top: '5%', left: '5%' }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className={styles.gradientCircle}
        style={{ top: '10%', right: '10%' }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.05, 0.2, 0.05],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className={styles.gradientCircle}
        style={{ bottom: '10%', left: '20%' }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.08, 0.25, 0.08],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}; 