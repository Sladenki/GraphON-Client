'use client';

import { motion, MotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { useAboutPageOptimization } from '../../../hooks/useAboutPageOptimization';

interface OptimizedMotionProps extends MotionProps {
  children: ReactNode;
  className?: string;
  reducedMotion?: boolean;
  mobileOptimized?: boolean;
}

export const OptimizedMotion = ({
  children,
  className = '',
  reducedMotion = false,
  mobileOptimized = false,
  ...motionProps
}: OptimizedMotionProps) => {
  const { settings, animationSettings } = useAboutPageOptimization();

  // Определяем, нужно ли отключить анимации
  const shouldDisableAnimations = reducedMotion || settings.reducedMotion;
  const isMobile = settings.isMobile;

  // Оптимизированные настройки анимации
  const optimizedProps = {
    ...motionProps,
    transition: {
      duration: shouldDisableAnimations ? 0 : animationSettings.duration,
      ease: shouldDisableAnimations ? 'linear' : animationSettings.ease,
      ...motionProps.transition
    },
    // Отключаем сложные анимации на мобильных
    ...(isMobile && mobileOptimized && {
      whileHover: undefined,
      whileTap: undefined,
      drag: undefined,
      dragConstraints: undefined
    })
  };

  // Если анимации отключены, возвращаем обычный div
  if (shouldDisableAnimations) {
    return (
      <div className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div className={className} {...optimizedProps}>
      {children}
    </motion.div>
  );
};

// Специализированные компоненты для разных типов анимаций
export const FadeInMotion = ({ children, className = '', delay = 0 }: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) => {
  const { settings, animationSettings } = useAboutPageOptimization();

  if (settings.reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: animationSettings.duration,
        ease: animationSettings.ease,
        delay
      }}
    >
      {children}
    </motion.div>
  );
};

export const SlideInMotion = ({ children, className = '', direction = 'up', delay = 0 }: {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
}) => {
  const { settings, animationSettings } = useAboutPageOptimization();

  if (settings.reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants = {
    hidden: {
      opacity: 0,
      x: direction === 'left' ? -50 : direction === 'right' ? 50 : 0,
      y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0
    }
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{
        duration: animationSettings.duration,
        ease: animationSettings.ease,
        delay
      }}
    >
      {children}
    </motion.div>
  );
};

export const ScaleMotion = ({ children, className = '', delay = 0 }: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) => {
  const { settings, animationSettings } = useAboutPageOptimization();

  if (settings.reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: animationSettings.duration,
        ease: animationSettings.ease,
        delay
      }}
    >
      {children}
    </motion.div>
  );
}; 