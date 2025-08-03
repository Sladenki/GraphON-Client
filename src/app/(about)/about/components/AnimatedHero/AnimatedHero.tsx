'use client';

import { motion } from 'framer-motion';
import { ParallaxSection, FloatingElement } from '../ParallaxSection/ParallaxSection';
import { HologramEarth } from '../HologramEarth/HologramEarth';
import styles from './AnimatedHero.module.scss';

export const AnimatedHero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut'
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <section className={styles.heroSection}>
      <ParallaxSection speed={0.3}>
        <div className={styles.heroContainer}>
          <motion.div
            className={styles.heroContent}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 className={styles.heroTitle} variants={itemVariants}>
              <span className={styles.gradientText}>GraphON</span>
              <br />
              <span className={styles.subtitle}>Современная платформа</span>
              <br />
              <span className={styles.highlight}>для управления графами</span>
            </motion.h1>

            <motion.p className={styles.heroDescription} variants={itemVariants}>
              Откройте для себя новый уровень визуализации и управления данными
              с помощью интуитивного интерфейса и мощных инструментов
            </motion.p>

            <motion.div className={styles.heroButtons} variants={itemVariants}>
              <motion.button
                className={styles.primaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Начать бесплатно
              </motion.button>
              <motion.button
                className={styles.secondaryButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Узнать больше
              </motion.button>
            </motion.div>
          </motion.div>

          <div className={styles.heroVisuals}>
            <HologramEarth />
          </div>
        </div>
      </ParallaxSection>
    </section>
  );
}; 