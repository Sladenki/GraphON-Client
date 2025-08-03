'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { ParallaxSection } from '../ParallaxSection/ParallaxSection';
import styles from './InteractiveDemo.module.scss';

const demoSteps = [
  {
    icon: '📊',
    title: 'Загрузите данные',
    description: 'Импортируйте ваши данные в различных форматах',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: '🎨',
    title: 'Настройте визуализацию',
    description: 'Выберите тип графа и настройте внешний вид',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    icon: '🔍',
    title: 'Анализируйте',
    description: 'Исследуйте связи и находите паттерны',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    icon: '📤',
    title: 'Экспортируйте',
    description: 'Сохраните результаты в нужном формате',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
];

export const InteractiveDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

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
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <section className={styles.demoSection}>
      <ParallaxSection speed={0.3}>
        <div className={styles.container} ref={containerRef}>
          <motion.div
            className={styles.header}
            style={{ opacity, y }}
          >
            <h2 className={styles.title}>
              <span className={styles.gradientText}>Попробуйте прямо сейчас</span>
            </h2>
            <p className={styles.subtitle}>
              Интерактивная демонстрация возможностей GraphON
            </p>
          </motion.div>

          <motion.div
            className={styles.demoContainer}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <div className={styles.stepsContainer}>
              {demoSteps.map((step, index) => (
                <motion.div
                  key={index}
                  className={`${styles.step} ${activeStep === index ? styles.active : ''}`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveStep(index)}
                >
                  <div 
                    className={styles.stepIcon}
                    style={{ background: step.color }}
                  >
                    <span>{step.icon}</span>
                  </div>
                  <div className={styles.stepContent}>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDescription}>{step.description}</p>
                  </div>
                  <motion.div
                    className={styles.stepIndicator}
                    animate={{
                      scale: activeStep === index ? 1.2 : 1,
                      backgroundColor: activeStep === index ? '#667eea' : '#374151'
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              ))}
            </div>

            <motion.div
              className={styles.demoVisual}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className={styles.graphContainer}>
                <motion.div
                  className={styles.graphNode}
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
                <motion.div
                  className={styles.graphNode}
                  animate={{
                    scale: [1, 1.2, 1],
                    y: [-10, 10, -10]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1
                  }}
                />
                <motion.div
                  className={styles.graphNode}
                  animate={{
                    scale: [1, 1.15, 1],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 2
                  }}
                />
                <motion.div
                  className={styles.connectionLine}
                  animate={{
                    scaleX: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.ctaContainer}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.button
              className={styles.demoButton}
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Запустить демо</span>
              <motion.div
                className={styles.buttonArrow}
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
      </ParallaxSection>
    </section>
  );
}; 