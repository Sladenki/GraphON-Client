'use client';

import { motion } from 'framer-motion';
import styles from './HowItWorksSection.module.scss';
import { Icon } from '../Icon/Icon';
import { SectionContainer } from '../../shared/SectionContainer/SectionContainer';
import { SectionHeader } from '../../shared/SectionHeader/SectionHeader';
import { AnimatedCard } from '../../shared/AnimatedCard/AnimatedCard';
import content from '../../data/content.json';

const steps = content.howItWorks.steps;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export const HowItWorksSection = () => {
  return (
    <SectionContainer className={styles.howItWorksSection}>
      <SectionHeader 
        title={content.howItWorks.title}
        subtitle={content.howItWorks.subtitle}
      />

      <motion.div
        className={styles.stepsContainer}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {steps.map((step, index) => (
          <AnimatedCard key={index} delay={index * 0.2}>
            <div className={styles.stepNumber}>{step.number}</div>
            <div className={styles.stepIcon}>
              <Icon name={step.icon} size={40} />
            </div>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDescription}>{step.description}</p>
            
            {index < steps.length - 1 && (
              <div className={styles.stepConnector}>
                <div className={styles.connectorLine} />
                <div className={styles.connectorArrow} />
              </div>
            )}
          </AnimatedCard>
        ))}
      </motion.div>
    </SectionContainer>
  );
}; 