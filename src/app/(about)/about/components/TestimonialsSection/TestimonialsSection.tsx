'use client';

import { motion } from 'framer-motion';
import styles from './TestimonialsSection.module.scss';

const testimonials = [
  {
    id: 1,
    name: "Анна Петрова",
    role: "Студентка БФУ",
    avatar: "👩‍🎓",
    text: "GraphON помог мне найти единомышленников для изучения программирования. Теперь у нас есть регулярные встречи по изучению React!",
    rating: 5
  },
  {
    id: 2,
    name: "Михаил Соколов",
    role: "Предприниматель",
    avatar: "👨‍💼",
    text: "Отличная платформа для нетворкинга! Нашел партнеров для своего стартапа и получил ценные советы от опытных предпринимателей.",
    rating: 5
  },
  {
    id: 3,
    name: "Елена Иванова",
    role: "Организатор мероприятий",
    avatar: "👩‍💻",
    text: "Календарь возможностей - это революция! Теперь легко планировать спонтанные встречи и создавать живые сообщества.",
    rating: 5
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const testimonialVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

export const TestimonialsSection = () => {
  return (
    <section className={styles.testimonialsSection}>
      <div className={styles.container}>
        <motion.h2
          className={styles.sectionTitle}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Что говорят пользователи
        </motion.h2>
        
        <motion.p
          className={styles.sectionSubtitle}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Присоединяйтесь к тысячам довольных пользователей, которые уже открыли для себя новые возможности
        </motion.p>

        <motion.div
          className={styles.testimonialsGrid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              className={styles.testimonialCard}
              variants={testimonialVariants}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <div className={styles.testimonialHeader}>
                <div className={styles.avatar}>{testimonial.avatar}</div>
                <div className={styles.userInfo}>
                  <h4 className={styles.userName}>{testimonial.name}</h4>
                  <p className={styles.userRole}>{testimonial.role}</p>
                </div>
                <div className={styles.rating}>
                  {Array.from({ length: testimonial.rating }, (_, i) => (
                    <span key={i} className={styles.star}>⭐</span>
                  ))}
                </div>
              </div>
              
              <blockquote className={styles.testimonialText}>
                "{testimonial.text}"
              </blockquote>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className={styles.statsContainer}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className={styles.stat}>
            <div className={styles.statNumber}>1000+</div>
            <div className={styles.statLabel}>Активных пользователей</div>
          </div>
          
          <div className={styles.stat}>
            <div className={styles.statNumber}>500+</div>
            <div className={styles.statLabel}>Проведенных встреч</div>
          </div>
          
          <div className={styles.stat}>
            <div className={styles.statNumber}>50+</div>
            <div className={styles.statLabel}>Партнерских организаций</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}; 