'use client';

import { motion } from 'framer-motion';
import styles from './FeaturesSection.module.scss';
import { Icon } from '../Icon/Icon';
import { SectionContainer } from '../../shared/SectionContainer/SectionContainer';
import { SectionHeader } from '../../shared/SectionHeader/SectionHeader';
import { AnimatedCard } from '../../shared/AnimatedCard/AnimatedCard';
import content from '../../data/content.json';

const features = content.features.items;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const FeaturesSection = () => {
  return (
    <SectionContainer className={styles.featuresSection} id="features">
      <SectionHeader 
        title={content.features.title}
        subtitle={content.features.subtitle}
      />

      <motion.div
        className={styles.featuresGrid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {features.map((feature, index) => (
          <AnimatedCard key={index} delay={index * 0.1}>
            <div className={styles.featureIcon}>
              <Icon name={feature.icon} size={40} />
            </div>
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <p className={styles.featureDescription}>{feature.description}</p>
          </AnimatedCard>
        ))}
      </motion.div>
    </SectionContainer>
  );
}; 