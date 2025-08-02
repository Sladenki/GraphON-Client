'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import styles from './CalendarDemo.module.scss';

const calendarEvents = [
  {
    id: 1,
    title: "Кофе с разработчиком",
    time: "14:00",
    location: "Кафе 'Университет'",
    type: "meetup",
    participants: 3
  },
  {
    id: 2,
    title: "Обсуждение стартапа",
    time: "16:30",
    location: "Коворкинг",
    type: "business",
    participants: 5
  },
  {
    id: 3,
    title: "Изучение React",
    time: "18:00",
    location: "Библиотека",
    type: "learning",
    participants: 8
  }
];

export const CalendarDemo = () => {
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  return (
    <section className={styles.calendarDemoSection}>
      <div className={styles.container}>
        <motion.h2
          className={styles.sectionTitle}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Календарь возможностей
        </motion.h2>
        
        <motion.p
          className={styles.sectionSubtitle}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Планируйте спонтанные встречи и находите единомышленников в реальном времени
        </motion.p>

        <div className={styles.demoContainer}>
          <motion.div
            className={styles.calendarVisual}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className={styles.calendarHeader}>
              <h3>Сегодня</h3>
              <div className={styles.dateIndicator}>15 марта</div>
            </div>
            
            <div className={styles.calendarGrid}>
              {Array.from({ length: 24 }, (_, hour) => (
                <div key={hour} className={styles.timeSlot}>
                  <span className={styles.timeLabel}>
                    {hour.toString().padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className={styles.eventsPanel}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3>Доступные встречи</h3>
            
            <div className={styles.eventsList}>
              {calendarEvents.map((event) => (
                <motion.div
                  key={event.id}
                  className={`${styles.eventCard} ${selectedEvent === event.id ? styles.selected : ''}`}
                  onClick={() => setSelectedEvent(event.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={styles.eventHeader}>
                    <span className={styles.eventTime}>{event.time}</span>
                    <span className={`${styles.eventType} ${styles[event.type]}`}>
                      {event.type === 'meetup' && '👥'}
                      {event.type === 'business' && '💼'}
                      {event.type === 'learning' && '📚'}
                    </span>
                  </div>
                  
                  <h4 className={styles.eventTitle}>{event.title}</h4>
                  <p className={styles.eventLocation}>{event.location}</p>
                  
                  <div className={styles.eventFooter}>
                    <span className={styles.participants}>
                      {event.participants} участников
                    </span>
                    <button className={styles.joinButton}>
                      Присоединиться
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          className={styles.demoFeatures}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className={styles.feature}>
            <div className={styles.featureIcon}>⚡</div>
            <h4>Мгновенные уведомления</h4>
            <p>Получайте уведомления о новых возможностях в реальном времени</p>
          </div>
          
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🎯</div>
            <h4>Умные рекомендации</h4>
            <p>ИИ подбирает встречи на основе ваших интересов и целей</p>
          </div>
          
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🔒</div>
            <h4>Безопасность</h4>
            <p>Все встречи проходят в безопасной и контролируемой среде</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}; 