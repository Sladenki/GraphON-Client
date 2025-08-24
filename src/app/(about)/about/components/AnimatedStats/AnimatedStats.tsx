'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { ParallaxSection } from '../ParallaxSection/ParallaxSection';
import styles from './AnimatedStats.module.scss';

interface Stat {
  value: number;
  label: string;
  suffix: string;
  color: string;
}

const stats: Stat[] = [
  { value: 5000, label: 'Студентов в Калининграде', suffix: '+', color: '#667eea' },
  { value: 200, label: 'Мероприятий в месяц', suffix: '+', color: '#f093fb' },
  { value: 150, label: 'Бизнес-партнеров', suffix: '+', color: '#4facfe' },
  { value: 95, label: 'Удовлетворенность', suffix: '%', color: '#43e97b' }
];

const AnimatedCounter = ({ value, suffix, color }: { value: number; suffix: string; color: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      className={styles.counter}
      style={{ color }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <span className={styles.counterValue}>
        {count.toLocaleString()}
        <span className={styles.counterSuffix}>{suffix}</span>
      </span>
    </motion.div>
  );
};

export const AnimatedStats = () => {
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

  return (
    <section className={styles.statsSection}>
      <ParallaxSection speed={0.2}>
        <div className={styles.container} ref={containerRef}>
          <motion.div
            className={styles.header}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={styles.title}>
              <span className={styles.gradientText}>GraphON в цифрах</span>
            </h2>
            <p className={styles.subtitle}>
              Реальные результаты нашей платформы
            </p>
          </motion.div>

          <motion.div
            className={styles.statsGrid}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className={styles.statCard}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={styles.statIcon}>
                  <motion.div
                    className={styles.iconCircle}
                    style={{ background: stat.color }}
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                </div>
                
                <AnimatedCounter 
                  value={stat.value} 
                  suffix={stat.suffix} 
                  color={stat.color}
                />
                
                <h3 className={styles.statLabel}>{stat.label}</h3>
                
                <motion.div
                  className={styles.statProgress}
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '100%' } : { width: 0 }}
                  transition={{ duration: 1.5, delay: 0.5 + index * 0.2 }}
                  style={{ background: stat.color }}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className={styles.achievementContainer}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className={styles.achievement}>
              <div className={styles.achievementIcon}>🏆</div>
              <div className={styles.achievementContent}>
                <h3>Лучшая платформа 2024</h3>
                <p>По версии GraphTech Awards</p>
              </div>
            </div>
            
            <div className={styles.achievement}>
              <div className={styles.achievementIcon}>⭐</div>
              <div className={styles.achievementContent}>
                <h3>4.9/5 звезд</h3>
                <p>Средняя оценка пользователей</p>
              </div>
            </div>
          </motion.div>
        </div>
      </ParallaxSection>
    </section>
  );
}; 