'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import { ArrowLeft } from 'lucide-react';
import styles from './ButtonBack.module.scss';

interface ButtonBackProps {
  label?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'flat' | 'light' | 'solid' | 'bordered' | 'shadow' | 'ghost' | 'faded';
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

const ButtonBack: React.FC<ButtonBackProps> = ({ 
  label = 'Назад', 
  href,
  onClick,
  className,
  variant = 'flat',
  color = 'primary'
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      color={color}
      variant={variant}
      startContent={<ArrowLeft size={18} />}
      onPress={handleClick}
      className={`${styles.backButton} ${className || ''}`}
    >
      {label}
    </Button>
  );
};

export default ButtonBack;

