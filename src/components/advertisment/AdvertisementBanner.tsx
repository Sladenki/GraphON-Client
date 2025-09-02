"use client";

import React from 'react';
import styles from './AdvertisementBanner.module.scss';

export type Advertisement = {
  title: string;
  subtitle?: string;
  description?: string;
  ctaText: string;
  ctaLink: string;
  promoCode?: string;
  discount?: string; // e.g. "30%"
  backgroundGradient?: string;
  imageSrc?: string;
  smallPrint?: string;
};

interface AdvertisementBannerProps {
  ad: Advertisement;
  className?: string;
}

const AdvertisementBanner: React.FC<AdvertisementBannerProps> = React.memo(({ ad, className }) => {
  return (
    <section
      className={[styles.banner, className].filter(Boolean).join(' ')}
      style={ad.backgroundGradient ? { backgroundImage: ad.backgroundGradient } : undefined}
      aria-label="Рекламный баннер"
    >
      <div className={styles.content}>
        <div className={styles.left}>
          {ad.discount && (
            <div className={styles.discountBadge} aria-hidden>
              <span>{ad.discount}</span>
            </div>
          )}

          <h3 className={styles.title}>{ad.title}</h3>
          {ad.subtitle && <p className={styles.subtitle}>{ad.subtitle}</p>}
          {ad.promoCode && (
            <div className={styles.promo}>
              Промокод: <strong>{ad.promoCode}</strong>
            </div>
          )}
          {ad.description && <p className={styles.description}>{ad.description}</p>}

          <div className={styles.actions}>
            <a
              className={styles.ctaButton}
              href={ad.ctaLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {ad.ctaText}
            </a>
          </div>

          {ad.smallPrint && <p className={styles.smallPrint}>{ad.smallPrint}</p>}
        </div>

        <div className={styles.right} aria-hidden>
          <div className={styles.pizzaArt}>
            <div className={`${styles.slice} ${styles.slice1}`}></div>
            <div className={`${styles.slice} ${styles.slice2}`}></div>
            <div className={`${styles.slice} ${styles.slice3}`}></div>
            <div className={`${styles.slice} ${styles.slice4}`}></div>
          </div>
        </div>
      </div>
    </section>
  );
});

AdvertisementBanner.displayName = 'AdvertisementBanner';

export default AdvertisementBanner;


