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
          Telegram канал
        </a>
    );
}

export default TelegramButton
