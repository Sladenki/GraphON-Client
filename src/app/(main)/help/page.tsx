'use client'

import { MessageCircle, ExternalLink } from 'lucide-react';
import styles from './page.module.scss';

const HelpPage = () => {
  const telegramBotUrl = 'https://t.me/graphon_support_bot';

  return (
    <div className={styles.helpPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <MessageCircle size={48} />
          </div>
          <h1 className={styles.title}>Помощь и поддержка</h1>
          <p className={styles.subtitle}>
            Мы всегда готовы помочь вам и услышать ваши предложения
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.messageBox}>
            <p className={styles.message}>
              Если у вас возникли проблемы или есть советы по улучшению продукта, напишите нам в Telegram:
            </p>
            
            <a 
              href={telegramBotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.telegramLink}
            >
              <MessageCircle size={20} className={styles.telegramIcon} />
              <span className={styles.buttonText}>GraphON Тех.Поддержка</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;

