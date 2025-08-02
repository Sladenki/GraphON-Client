'use client';

import { motion } from 'framer-motion';
import styles from './FeaturesSection.module.scss';

const features = [
  {
    title: "Визуальные графы",
    description: "Инновационная система визуализации мероприятий и объединений в виде интерактивных графов",
    icon: "📊",
    color: "var(--primary-color)"
  },
  {
    title: "Календарь возможностей",
    description: "Уникальная система для планирования спонтанных встреч и неформального общения",
    icon: "📅",
    color: "var(--primary-color)"
  },
  {
    title: "Персонализация",
    description: "Умные алгоритмы подбирают мероприятия и возможности, подходящие именно вам",
    icon: "🎯",
    color: "var(--primary-color)"
  },
  {
    title: "Социальная сеть",
    description: "Находите единомышленников и создавайте профессиональные связи",
    icon: "🤝",
    color: "var(--primary-color)"
  },
  {
    title: "Аналитика",
    description: "Отслеживайте свою активность и получайте insights для развития",
    icon: "📈",
    color: "var(--primary-color)"
  },
  {
    title: "Мобильность",
    description: "Полный доступ к платформе с любого устройства в любое время",
    icon: "📱",
    color: "var(--primary-color)"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export const FeaturesSection = () => {
  return (
    <section className={styles.featuresSection} id="features">
      <div className={styles.container}>
        <motion.h2
          className={styles.sectionTitle}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Возможности платформы
        </motion.h2>
        
        <motion.p
          className={styles.sectionSubtitle}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          GraphON объединяет лучшие технологии для создания уникального опыта взаимодействия
        </motion.p>

        <motion.div
          className={styles.featuresGrid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={styles.featureCard}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              <div 
                className={styles.featureIcon}
                style={{ backgroundColor: feature.color }}
              >
                <span className={styles.iconEmoji}>{feature.icon}</span>
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}; 