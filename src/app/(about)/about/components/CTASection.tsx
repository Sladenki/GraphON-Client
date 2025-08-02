'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './CTASection.module.scss';

export const CTASection = () => {
  return (
    <section className={styles.ctaSection}>
      <div className={styles.container}>
        <motion.div
          className={styles.ctaContent}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className={styles.ctaTitle}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Готовы начать?
          </motion.h2>
          
          <motion.p
            className={styles.ctaSubtitle}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Присоединяйтесь к GraphON сегодня и откройте для себя новые возможности для развития и роста
          </motion.p>
          
          <motion.div
            className={styles.ctaButtons}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Link href="/" className={styles.primaryButton}>
              Начать бесплатно
            </Link>
            <Link href="#features" className={styles.secondaryButton}>
              Узнать больше
            </Link>
          </motion.div>
          
          <motion.div
            className={styles.ctaFeatures}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🚀</span>
              <span>Быстрая регистрация</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>💎</span>
              <span>Бесплатно навсегда</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🔒</span>
              <span>Безопасность данных</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}; 