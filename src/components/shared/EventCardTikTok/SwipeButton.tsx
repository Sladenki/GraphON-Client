'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight, Check, Ticket } from 'lucide-react';
import styles from './SwipeButton.module.scss';

interface SwipeButtonProps {
  onSwipeComplete: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  isRegistered?: boolean;
  onUnregister?: () => void;
  text?: string;
  registeredText?: string;
}

const RANDOM_TEXTS = [
  'Залетаю!',
  'Я в деле!',
  'Бронирую место!',
  'Я с вами!',
  'Погнали!',
  'Вписывай меня!',
  'Я в теме!',
  'Записывай, пока не передумал!',
  'Готов к приключениям!',
];

/**
 * SwipeButton - кнопка с жестом свайпа для регистрации
 * Премиум UI компонент с плавной анимацией
 */
export default function SwipeButton({
  onSwipeComplete,
  disabled = false,
  isLoading = false,
  isRegistered = false,
  onUnregister,
  text,
  registeredText = 'Вы записаны',
}: SwipeButtonProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const progress = useTransform(x, [0, 200], [0, 1]);
  const textOpacity = useTransform(progress, [0, 0.5, 1], [1, 0.5, 0]);
  const successOpacity = useTransform(progress, [0, 0.5, 1], [0, 0.5, 1]);
  const thumbOpacity = useTransform(progress, [0, 1], [1, 0.9]);

  // Выбираем случайный текст из массива, если text не передан
  const displayText = useMemo(() => {
    if (text) return text;
    return RANDOM_TEXTS[Math.floor(Math.random() * RANDOM_TEXTS.length)];
  }, [text]);

  // Если зарегистрирован, показываем состояние успеха
  useEffect(() => {
    if (isRegistered) {
      setHasCompleted(true);
      x.set(200);
    } else {
      setHasCompleted(false);
      x.set(0);
    }
  }, [isRegistered, x]);

  const handleDragStart = useCallback(() => {
    if (disabled || isLoading || isRegistered) return;
    setIsDragging(true);
  }, [disabled, isLoading, isRegistered]);

  const handleDrag = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (disabled || isLoading || isRegistered) return;
      // Ограничиваем движение только вправо
      const newX = Math.max(0, Math.min(info.offset.x, 200));
      x.set(newX);
    },
    [disabled, isLoading, isRegistered, x]
  );

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      if (disabled || isLoading || isRegistered) return;

      // Если свайпнули достаточно далеко (>80% ширины), завершаем
      if (info.offset.x > 160) {
        setHasCompleted(true);
        x.set(200);
        // Вибрация на мобильных (если доступна)
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        onSwipeComplete();
      } else {
        // Возвращаем обратно
        x.set(0);
      }
    },
    [disabled, isLoading, isRegistered, x, onSwipeComplete]
  );

  const handleClick = useCallback(() => {
    if (disabled || isLoading) return;
    if (isRegistered && onUnregister) {
      onUnregister();
    } else if (!hasCompleted) {
      // Для desktop: быстрая регистрация по клику
      setHasCompleted(true);
      x.set(200);
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      onSwipeComplete();
    }
  }, [disabled, isLoading, isRegistered, hasCompleted, onSwipeComplete, onUnregister, x]);

  if (isRegistered && onUnregister) {
    // Кнопка-билет после регистрации
    return (
      <button
        className={styles.ticketButton}
        onClick={onUnregister}
        disabled={disabled || isLoading}>
        <div className={styles.ticketContent}>
          <Ticket size={22} />
          <span className={styles.ticketText}>Билет</span>
        </div>
      </button>
    );
  }

  return (
    <div className={styles.swipeButtonContainer} ref={buttonRef} onClick={handleClick}>
      <motion.div
        className={styles.swipeButtonTrack}
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 200 }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.02 }}
        animate={{
          x: hasCompleted ? 200 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}>
        <motion.div
          className={styles.swipeButtonThumb}
          style={{
            scale: isDragging ? 1.1 : 1,
            opacity: thumbOpacity,
          }}
          animate={!isDragging && !hasCompleted && !isRegistered ? {
            x: [0, 8, 0],
          } : {}}
          transition={!isDragging && !hasCompleted && !isRegistered ? {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          } : {}}>
          {hasCompleted ? <Check size={24} /> : <ArrowRight size={24} />}
        </motion.div>
      </motion.div>

      <div className={styles.swipeButtonText}>
        <motion.span
          style={{
            opacity: textOpacity,
          }}>
          {displayText}
        </motion.span>
        <motion.span
          className={styles.successText}
          style={{
            opacity: successOpacity,
          }}>
          Записан! ✓
        </motion.span>
      </div>

      {/* Progress indicator */}
      <motion.div
        className={styles.swipeProgressBar}
        style={{
          scaleX: progress,
          transformOrigin: 'left',
        }}
      />
    </div>
  );
}

