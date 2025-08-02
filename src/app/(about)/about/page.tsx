'use client';

import { motion } from 'framer-motion';
import styles from './page.module.scss';
import Link from 'next/link';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { CalendarDemo } from './components/CalendarDemo';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';

const AboutPage = () => {
    return (
        <div className={styles.container}>
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />
            <CalendarDemo />
            <TestimonialsSection />
            <CTASection />
            <Footer />
        </div>
    );
};

export default AboutPage; 