'use client';

import { Suspense, lazy, useEffect, useState } from 'react';
import styles from './page.module.scss';

// Приоритетные компоненты (загружаются сразу)
const AnimatedHero = lazy(() => import('./components/AnimatedHero/AnimatedHero').then(module => ({ default: module.AnimatedHero })));
const AnimatedCTA = lazy(() => import('./components/AnimatedCTA/AnimatedCTA').then(module => ({ default: module.AnimatedCTA })));
const Footer = lazy(() => import('./components/Footer/Footer').then(module => ({ default: module.Footer })));

// Компоненты средней приоритетности (загружаются после критических)
const AnimatedFeatures = lazy(() => import('./components/AnimatedFeatures/AnimatedFeatures').then(module => ({ default: module.AnimatedFeatures })));
const AnimatedStats = lazy(() => import('./components/AnimatedStats/AnimatedStats').then(module => ({ default: module.AnimatedStats })));

// Тяжелые компоненты (загружаются только на десктопе или при необходимости)
const SpaceBackground = lazy(() => import('./components/SpaceBackground/SpaceBackground').then(module => ({ default: module.SpaceBackground })));
const InteractiveDemo = lazy(() => import('./components/InteractiveDemo/InteractiveDemo').then(module => ({ default: module.InteractiveDemo })));

// Оптимизированный компонент загрузки
const LoadingFallback = ({ height = '200px', isMobile = false }: { height?: string; isMobile?: boolean }) => (
  <div className={`${styles.loadingFallback} ${isMobile ? styles.mobileLoading : ''}`} style={{ minHeight: height }}>
    <div className={styles.loadingSpinner}></div>
  </div>
);

// Простые хуки для оптимизации
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile, isClient };
};

const useConditionalLoading = () => {
  const [shouldLoadHeavy, setShouldLoadHeavy] = useState(false);
  const { isMobile } = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      const handleScroll = () => {
        if (window.scrollY > 500) {
          setShouldLoadHeavy(true);
        }
      };
      
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setShouldLoadHeavy(true);
    }
  }, [isMobile]);

  return { shouldLoadHeavy, isMobile };
};

const AboutPage = () => {
  const { shouldLoadHeavy, isMobile } = useConditionalLoading();
  const { isClient } = useIsMobile();

  // Показываем скелетон до завершения гидрации
  if (!isClient) {
    return (
      <div className={styles.container}>
        <div className={styles.skeletonContainer}>
          <div className={styles.skeletonHero}></div>
          <div className={styles.skeletonSection}></div>
          <div className={styles.skeletonSection}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Приоритетные компоненты */}
      <Suspense fallback={<LoadingFallback height="100vh" isMobile={isMobile} />}>
        <AnimatedHero />
      </Suspense>
      
      {/* Компоненты средней приоритетности */}
      <Suspense fallback={<LoadingFallback isMobile={isMobile} />}>
        <AnimatedFeatures />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback isMobile={isMobile} />}>
        <AnimatedStats />
      </Suspense>
      
      {/* Тяжелые компоненты загружаются условно */}
      {shouldLoadHeavy && !isMobile && (
        <Suspense fallback={<LoadingFallback isMobile={isMobile} />}>
          <SpaceBackground 
            isMobile={isMobile}
            isLowEndDevice={false}
            shouldReduceMotion={false}
            starCount={200}
            animationSpeed={1}
            quality="high"
          />
        </Suspense>
      )}
      
      {/* InteractiveDemo только на десктопе */}
      {shouldLoadHeavy && !isMobile && (
        <Suspense fallback={<LoadingFallback isMobile={isMobile} />}>
          <InteractiveDemo />
        </Suspense>
      )}
      
      {/* Приоритетные компоненты в конце */}
      <Suspense fallback={<LoadingFallback isMobile={isMobile} />}>
        <AnimatedCTA />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback height="100px" isMobile={isMobile} />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default AboutPage; 