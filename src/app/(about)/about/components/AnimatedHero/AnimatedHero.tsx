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
        staggerChildren: 0.4,
        delayChildren: 0.3,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 1,
        ease: [0.4, 0, 0.2, 1]
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
              <span className={styles.highlight}> для управления графами</span>
            </motion.h1>

            <motion.p className={styles.heroDescription} variants={itemVariants}>
              Откройте для себя новый уровень визуализации и управления данными
              с помощью интуитивного интерфейса и мощных инструментов
            </motion.p>

            <motion.div className={styles.heroButtons} variants={itemVariants}>
              <motion.button
                className={styles.primaryButton}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.98,
                  transition: { duration: 0.1 }
                }}
              >
                Начать бесплатно
              </motion.button>
              <motion.button
                className={styles.secondaryButton}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ 
                  scale: 0.98,
                  transition: { duration: 0.1 }
                }}
              >
                Узнать больше
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div 
            className={styles.heroVisuals}
            initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ 
              duration: 1.2, 
              delay: 0.5,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            <HologramEarth />
          </motion.div>
        </div>
      </ParallaxSection>
    </section>
  );
}; 