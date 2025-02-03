import React from 'react'
import styles from './TelegramButton.module.scss'

const TelegramButton = () => {
    return (
        <a
          href="https://t.me/graph_ON"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.subscribeButton}
        >
          Мы в Telegram
        </a>
    );
}

export default TelegramButton
