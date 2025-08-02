'use client';

import { motion } from 'framer-motion';
import styles from './page.module.scss';
import Link from 'next/link';
import { HeroSection } from './components/HeroSection/HeroSection';
import { FeaturesSection } from './components/FeaturesSection/FeaturesSection';
import { HowItWorksSection } from './components/HowItWorksSection/HowItWorksSection';
import { CalendarDemo } from './components/CalendarDemo/CalendarDemo';
import { TestimonialsSection } from './components/TestimonialsSection/TestimonialsSection';
import { CTASection } from './components/CTASection/CTASection';
import { Footer } from './components/Footer/Footer';
import { AnimatedBackground } from './components/AnimatedBackground/AnimatedBackground';

const AboutPage = () => {
    return (
        <div className={styles.container}>
            <AnimatedBackground />
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