'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import EventCardTikTok from '@/components/shared/EventCardTikTok/EventCardTikTok';
import { EventItem } from '@/types/schedule.interface';
import styles from './EventSlide.module.scss';

interface EventSlideProps {
  event: EventItem;
  isActive: boolean;
  onIntersect: () => void;
}

export default function EventSlide({ event, isActive, onIntersect }: EventSlideProps) {
  const slideRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(slideRef, { 
    once: false, // Анимация будет срабатывать каждый раз при появлении в viewport
    margin: '-20% 0px -20% 0px', // Срабатывает когда элемент на 20% виден
    amount: 0.3 // Минимальная часть элемента, которая должна быть видна
  });

  // Отслеживание для вызова onIntersect (старая логика)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            onIntersect();
          }
        });
      },
      {
        threshold: [0.5],
        rootMargin: '0px',
      },
    );

    const currentRef = slideRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [onIntersect]);

  return (
    <motion.div
      ref={slideRef}
      className={styles.slide}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}>
      <motion.div
        className={styles.cardWrapper}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={
          isInView
            ? { opacity: 1, scale: 1, y: 0 }
            : { opacity: 0, scale: 0.95, y: 20 }
        }
        transition={{
          duration: 0.5,
          ease: [0.34, 1.56, 0.64, 1], // Пружинящая анимация
        }}>
        {/* Используем специализированный компонент для TikTok-ленты */}
        <EventCardTikTok event={event} isVisible={isInView} />
      </motion.div>
    </motion.div>
  );
}

