'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './Footer.module.scss';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <motion.div
            className={styles.footerSection}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className={styles.footerTitle}>GraphON</h3>
            <p className={styles.footerDescription}>
              Инновационная платформа для студентов БФУ и малого бизнеса в Калининграде. 
              Соединяем людей, создаем возможности.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink}>📧</a>
              <a href="#" className={styles.socialLink}>📱</a>
              <a href="#" className={styles.socialLink}>💬</a>
            </div>
          </motion.div>

          <motion.div
            className={styles.footerSection}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className={styles.sectionTitle}>Продукт</h4>
            <ul className={styles.footerLinks}>
              <li><Link href="#features">Возможности</Link></li>
              <li><Link href="#how-it-works">Как это работает</Link></li>
              <li><Link href="#calendar">Календарь возможностей</Link></li>
              <li><Link href="#testimonials">Отзывы</Link></li>
            </ul>
          </motion.div>

          <motion.div
            className={styles.footerSection}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className={styles.sectionTitle}>Поддержка</h4>
            <ul className={styles.footerLinks}>
              <li><Link href="/help">Помощь</Link></li>
              <li><Link href="/contact">Контакты</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/feedback">Обратная связь</Link></li>
            </ul>
          </motion.div>

          <motion.div
            className={styles.footerSection}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className={styles.sectionTitle}>Компания</h4>
            <ul className={styles.footerLinks}>
              <li><Link href="/about">О нас</Link></li>
              <li><Link href="/team">Команда</Link></li>
              <li><Link href="/careers">Карьера</Link></li>
              <li><Link href="/press">Пресс-кит</Link></li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          className={styles.footerBottom}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className={styles.copyright}>
            © 2024 GraphON. Все права защищены.
          </div>
          <div className={styles.legalLinks}>
            <Link href="/legal">Юридические документы</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}; 