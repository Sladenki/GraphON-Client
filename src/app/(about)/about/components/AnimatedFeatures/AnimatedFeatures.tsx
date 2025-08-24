'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { ParallaxSection } from '../ParallaxSection/ParallaxSection';
import { HologramEarth } from '../HologramEarth/HologramEarth';
import styles from './AnimatedFeatures.module.scss';

const features = [
  {
    icon: '🎯',
    title: 'Визуальные графы',
    description: 'Найди мероприятия через интуитивные визуальные графы',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: '📅',
    title: 'Календарь возможностей',
    description: 'Спонтанные встречи и события в удобном формате',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    icon: '🎮',
    title: 'Геймификация',
    description: 'Зарабатывай баллы за участие в мероприятиях',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    icon: '📈',
    title: 'Таргетированная реклама',
    description: 'Персонализированные предложения с аналитикой',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    icon: '🤖',
    title: 'AI-рекомендации',
    description: 'Умные предложения для персонализации опыта',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    icon: '👥',
    title: 'Социальная сеть',
    description: 'Найди друзей и единомышленников в Калининграде',
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  }
];

export const AnimatedFeatures = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <section className={styles.featuresSection}>
      <ParallaxSection speed={0.2}>
        <div className={styles.container} ref={containerRef}>
          <motion.div
            className={styles.header}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={styles.title}>
              <span className={styles.gradientText}>Уникальные возможности</span>
            </h2>
            <p className={styles.subtitle}>
              Откройте для себя революционные функции GraphON
            </p>
          </motion.div>

          <motion.div
            className={styles.featuresGrid}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={styles.featureCard}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div 
                  className={styles.iconContainer}
                  style={{ background: feature.color }}
                >
                  <span className={styles.icon}>{feature.icon}</span>
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
                
                <motion.div
                  className={styles.hoverEffect}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className={styles.statsContainer}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className={styles.stat}>
              <div className={styles.statNumber}>10K+</div>
              <div className={styles.statLabel}>Активных пользователей</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>99.9%</div>
              <div className={styles.statLabel}>Время работы</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>50M+</div>
              <div className={styles.statLabel}>Обработанных узлов</div>
            </div>
          </motion.div>

          <motion.div
            className={styles.hologramSection}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <HologramEarth />
            <div className={styles.hologramText}>
              <h3>Глобальная сеть данных</h3>
              <p>Подключитесь к мировой сети информации</p>
            </div>
          </motion.div>
        </div>
      </ParallaxSection>
    </section>
  );
}; 