'use client';

import { motion } from 'framer-motion';
import styles from './page.module.scss';
import Link from 'next/link';
import { WaveBackground } from './components/WaveBackground/WaveBackground';
import { ParticleBackground } from './components/ParticleBackground/ParticleBackground';
import { AnimatedHero } from './components/AnimatedHero/AnimatedHero';
import { AnimatedFeatures } from './components/AnimatedFeatures/AnimatedFeatures';
import { InteractiveDemo } from './components/InteractiveDemo/InteractiveDemo';
import { AnimatedStats } from './components/AnimatedStats/AnimatedStats';
import { AnimatedCTA } from './components/AnimatedCTA/AnimatedCTA';
import { Footer } from './components/Footer/Footer';

const AboutPage = () => {
    return (
        <div className={styles.container}>
            <ParticleBackground />
            <WaveBackground />
            <AnimatedHero />
            <AnimatedFeatures />
            <InteractiveDemo />
            <AnimatedStats />
            <AnimatedCTA />
            <Footer />
        </div>
    );
};

export default AboutPage; 