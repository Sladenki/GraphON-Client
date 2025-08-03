'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { ParallaxSection } from '../ParallaxSection/ParallaxSection';
import styles from './AnimatedCTA.module.scss';

export const AnimatedCTA = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

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

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
      transition: { duration: 0.3 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  return (
    <section className={styles.ctaSection}>
      <ParallaxSection speed={0.4}>
        <div className={styles.container} ref={containerRef}>
          <motion.div
            className={styles.ctaContent}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <motion.div className={styles.backgroundElements}>
              <motion.div
                className={styles.floatingCircle}
                animate={{
                  y: [-20, 20, -20],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              <motion.div
                className={styles.floatingSquare}
                animate={{
                  y: [20, -20, 20],
                  rotate: [0, -360],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              <motion.div
                className={styles.floatingTriangle}
                animate={{
                  y: [-15, 15, -15],
                  rotate: [0, 180],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>

            <motion.h2 className={styles.title} variants={itemVariants}>
              <span className={styles.gradientText}>Присоединяйся к GraphON!</span>
            </motion.h2>

            <motion.p className={styles.description} variants={itemVariants}>
              Найди мероприятия, друзей и возможности в Калининграде. 
              Стань частью растущего сообщества студентов и бизнеса
            </motion.p>

            <motion.div className={styles.buttonGroup} variants={itemVariants}>
              <motion.button
                className={styles.primaryButton}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <span className={styles.buttonText}>Зарегистрироваться</span>
                <motion.div
                  className={styles.buttonIcon}
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.div>
              </motion.button>

              <motion.button
                className={styles.secondaryButton}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <span className={styles.buttonText}>Найти мероприятия</span>
                <motion.div
                  className={styles.buttonIcon}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  🎯
                </motion.div>
              </motion.button>
            </motion.div>

            <motion.div className={styles.features} variants={itemVariants}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>✓</div>
                <span>Бесплатно для студентов</span>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>✓</div>
                <span>Мероприятия в Калининграде</span>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>✓</div>
                <span>AI-рекомендации</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </ParallaxSection>
    </section>
  );
}; 