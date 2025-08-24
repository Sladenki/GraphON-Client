'use client';

import { useState, useRef, useEffect, memo } from 'react';
import Image from 'next/image';
import styles from './OptimizedImage.module.scss';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export const OptimizedImage = memo(({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`${styles.errorFallback} ${className}`}>
        <div className={styles.errorIcon}>📷</div>
        <span className={styles.errorText}>Ошибка загрузки</span>
      </div>
    );
  }

  return (
    <div 
      ref={imageRef}
      className={`${styles.imageContainer} ${className} ${isLoaded ? styles.loaded : ''}`}
    >
      {isInView && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          className={styles.image}
          priority={priority}
        />
      )}
      
      {!isLoaded && isInView && (
        <div className={styles.skeleton}>
          <div className={styles.skeletonShimmer}></div>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage'; 