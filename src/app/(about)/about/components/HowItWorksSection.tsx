'use client';

import { motion } from 'framer-motion';
import styles from './HowItWorksSection.module.scss';

const steps = [
  {
    number: "01",
    title: "Регистрация",
    description: "Создайте аккаунт и укажите свои интересы и цели развития",
    icon: "👤"
  },
  {
    number: "02",
    title: "Исследование",
    description: "Изучите визуальные графы мероприятий и найдите подходящие возможности",
    icon: "🔍"
  },
  {
    number: "03",
    title: "Планирование",
    description: "Используйте календарь возможностей для планирования встреч и мероприятий",
    icon: "📅"
  },
  {
    number: "04",
    title: "Участие",
    description: "Присоединяйтесь к мероприятиям и создавайте новые связи",
    icon: "🤝"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

export const HowItWorksSection = () => {
  return (
    <section className={styles.howItWorksSection}>
      <div className={styles.container}>
        <motion.h2
          className={styles.sectionTitle}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Как это работает
        </motion.h2>
        
        <motion.p
          className={styles.sectionSubtitle}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Всего 4 простых шага отделяют вас от новых возможностей и знакомств
        </motion.p>

        <motion.div
          className={styles.stepsContainer}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={styles.stepCard}
              variants={stepVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              <div className={styles.stepNumber}>{step.number}</div>
              <div className={styles.stepIcon}>{step.icon}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
              
              {index < steps.length - 1 && (
                <div className={styles.stepConnector}>
                  <div className={styles.connectorLine} />
                  <div className={styles.connectorArrow} />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}; 