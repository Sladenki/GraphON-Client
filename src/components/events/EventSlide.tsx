'use client';

import React, { useEffect, useRef } from 'react';
import EventCard from '@/components/shared/EventCard/EventCard';
import { EventItem } from '@/types/schedule.interface';
import styles from './EventSlide.module.scss';

interface EventSlideProps {
  event: EventItem;
  isActive: boolean;
  onIntersect: () => void;
}

export default function EventSlide({ event, isActive, onIntersect }: EventSlideProps) {
  const slideRef = useRef<HTMLDivElement>(null);

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
        threshold: [0.5], // Событие активно, когда 50% видно
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
    <div ref={slideRef} className={styles.slide}>
      <div className={styles.cardWrapper}>
        <EventCard event={event} />
      </div>
    </div>
  );
}

