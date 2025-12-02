'use client';

import React from 'react';
import styles from './MaintenancePage.module.scss';
import { Wrench } from 'lucide-react';

const MaintenancePage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <Wrench className={styles.wrenchIcon} size={80} />
          <div className={styles.pulseRing} />
        </div>

        <h1 className={styles.title}>Ведётся техническое обслуживание</h1>
        
        <div className={styles.description}>
          <p>
            Мы проводим плановые работы для улучшения работы платформы.
          </p>
          <p>
            Приносим извинения за временные неудобства.
          </p>
        </div>

        <div className={styles.footer}>
          <p>Спасибо за ваше терпение!</p>
          <div className={styles.logo}>GraphON</div>
        </div>
      </div>

      {/* Animated background elements */}
      <div className={styles.bgElements}>
        <div className={styles.bgCircle} style={{ top: '10%', left: '10%', animationDelay: '0s' }} />
        <div className={styles.bgCircle} style={{ top: '70%', left: '80%', animationDelay: '1s' }} />
        <div className={styles.bgCircle} style={{ top: '40%', left: '85%', animationDelay: '2s' }} />
        <div className={styles.bgCircle} style={{ top: '80%', left: '15%', animationDelay: '1.5s' }} />
      </div>
    </div>
  );
};

export default MaintenancePage;

