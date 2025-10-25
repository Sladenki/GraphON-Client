"use client";

import React from 'react';
import styles from './ActionButton.module.scss';

export type ActionButtonVariant = 'primary' | 'info' | 'danger';

export interface ActionButtonProps {
  label: string;
  icon?: React.ReactNode;
  variant?: ActionButtonVariant; // 'primary' (как registerButton) | 'info' (как подробнее у GraphCard)
  disabled?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  // Проброс любых HTML-атрибутов кнопки (data-*, aria- и т.д.)
  [key: string]: any;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  variant = 'primary',
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...rest
}) => {
  const variantClass =
    variant === 'primary'
      ? styles.primary
      : variant === 'info'
        ? styles.info
        : styles.danger;

  return (
    <button
      type={type}
      className={`${styles.button} ${variantClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{label}</span>
    </button>
  );
};

export default ActionButton;


