'use client';

import { Suspense, lazy } from 'react';
import styles from './page.module.scss';

// Динамические импорты для ленивой загрузки
const SpaceBackground = lazy(() => import('./components/SpaceBackground/SpaceBackground').then(module => ({ default: module.SpaceBackground })));
const AnimatedHero = lazy(() => import('./components/AnimatedHero/AnimatedHero').then(module => ({ default: module.AnimatedHero })));
const AnimatedFeatures = lazy(() => import('./components/AnimatedFeatures/AnimatedFeatures').then(module => ({ default: module.AnimatedFeatures })));
const InteractiveDemo = lazy(() => import('./components/InteractiveDemo/InteractiveDemo').then(module => ({ default: module.InteractiveDemo })));
const AnimatedStats = lazy(() => import('./components/AnimatedStats/AnimatedStats').then(module => ({ default: module.AnimatedStats })));
const AnimatedCTA = lazy(() => import('./components/AnimatedCTA/AnimatedCTA').then(module => ({ default: module.AnimatedCTA })));
const Footer = lazy(() => import('./components/Footer/Footer').then(module => ({ default: module.Footer })));

// Компонент загрузки
const LoadingFallback = () => (
  <div className={styles.loadingFallback}>
    <div className={styles.loadingSpinner}></div>
  </div>
);

const AboutPage = () => {
  return (
    <div className={styles.container}>
      <Suspense fallback={<LoadingFallback />}>
        <SpaceBackground />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <AnimatedHero />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <AnimatedFeatures />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <InteractiveDemo />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <AnimatedStats />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <AnimatedCTA />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default AboutPage; 