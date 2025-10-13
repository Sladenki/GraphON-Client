"use client";

import React from 'react';
import styles from './ActionButton.module.scss';

export type ActionButtonVariant = 'primary' | 'info';

export interface ActionButtonProps {
  label: string;
  icon?: React.ReactNode;
  variant?: ActionButtonVariant; // 'primary' (как registerButton) | 'info' (как подробнее у GraphCard)
  disabled?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  variant = 'primary',
  disabled = false,
  className = '',
  onClick,
  type = 'button',
}) => {
  const variantClass = variant === 'primary' ? styles.primary : styles.info;

  return (
    <button
      type={type}
      className={`${styles.button} ${variantClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{label}</span>
    </button>
  );
};

export default ActionButton;


