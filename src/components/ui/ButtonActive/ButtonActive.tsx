import React, { FC } from 'react'
import styles from './ButtonActive.module.scss'

interface ButtonActiveProps {
    text: string;
    onClick: () => void;
    isLoading?: boolean;
  }

const ButtonActive: FC<ButtonActiveProps> = ({ text, onClick, isLoading }) => {
  return (
    <button 
        className={styles.buttonActive}
        onClick={onClick} 
        disabled={isLoading}
    >
        {isLoading ? 'Загрузка...' : text}
    </button>
  )
}

export default ButtonActive
