'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Music,
  Palette,
  GraduationCap,
  Briefcase,
  Trophy,
  Laugh,
  UtensilsCrossed,
  Home,
  Building2,
  PartyPopper,
  Film,
  Theater,
  TrendingUp,
  Beaker,
  Camera,
} from 'lucide-react';
import { ThemeName } from '@/components/shared/EventCard/pastelTheme';
import styles from './AnimatedObjects.module.scss';

interface AnimatedObject {
  icon: React.ReactNode;
  initialPosition: { x: string; y: string };
  movementRange: { x: number; y: number };
  rotation?: boolean;
  duration: number;
  size?: number;
}

function getObjectsForTheme(theme: ThemeName): AnimatedObject[] {
  switch (theme) {
    case 'Музыка':
      return [
        {
          icon: <Music />,
          initialPosition: { x: '10%', y: '20%' },
          movementRange: { x: 50, y: 100 },
          duration: 25,
          size: 60,
        },
        {
          icon: <Music />,
          initialPosition: { x: '80%', y: '60%' },
          movementRange: { x: -30, y: 80 },
          duration: 30,
          size: 40,
          rotation: true,
        },
        {
          icon: <Music />,
          initialPosition: { x: '50%', y: '80%' },
          movementRange: { x: 70, y: -50 },
          duration: 28,
          size: 50,
        },
      ];

    case 'Бизнес':
      return [
        {
          icon: <TrendingUp />,
          initialPosition: { x: '15%', y: '40%' },
          movementRange: { x: 80, y: 50 },
          duration: 20,
          size: 50,
        },
        {
          icon: <Briefcase />,
          initialPosition: { x: '70%', y: '30%' },
          movementRange: { x: -40, y: 90 },
          duration: 22,
          size: 45,
        },
      ];

    case 'Наука':
    case 'Образование':
      return [
        {
          icon: <Beaker />,
          initialPosition: { x: '20%', y: '50%' },
          movementRange: { x: 60, y: 70 },
          duration: 24,
          size: 55,
          rotation: true,
        },
        {
          icon: <GraduationCap />,
          initialPosition: { x: '75%', y: '25%' },
          movementRange: { x: -50, y: 80 },
          duration: 26,
          size: 50,
        },
      ];

    case 'Искусство':
    case 'Творчество':
      return [
        {
          icon: <Palette />,
          initialPosition: { x: '25%', y: '35%' },
          movementRange: { x: 70, y: 60 },
          duration: 23,
          size: 55,
          rotation: true,
        },
        {
          icon: <Camera />,
          initialPosition: { x: '65%', y: '70%' },
          movementRange: { x: -45, y: 50 },
          duration: 27,
          size: 48,
        },
      ];

    case 'Спорт':
      return [
        {
          icon: <Trophy />,
          initialPosition: { x: '30%', y: '45%' },
          movementRange: { x: 65, y: 75 },
          duration: 21,
          size: 52,
        },
      ];

    case 'Кино':
      return [
        {
          icon: <Film />,
          initialPosition: { x: '20%', y: '30%' },
          movementRange: { x: 80, y: 90 },
          duration: 25,
          size: 50,
        },
      ];

    case 'Театр':
      return [
        {
          icon: <Theater />,
          initialPosition: { x: '15%', y: '50%' },
          movementRange: { x: 75, y: 65 },
          duration: 24,
          size: 55,
        },
      ];

    case 'Юмор':
      return [
        {
          icon: <Laugh />,
          initialPosition: { x: '25%', y: '40%' },
          movementRange: { x: 70, y: 80 },
          duration: 22,
          size: 55,
        },
      ];

    case 'Гастро':
      return [
        {
          icon: <UtensilsCrossed />,
          initialPosition: { x: '30%', y: '50%' },
          movementRange: { x: 65, y: 70 },
          duration: 23,
          size: 50,
        },
      ];

    case 'Семья':
      return [
        {
          icon: <Home />,
          initialPosition: { x: '20%', y: '35%' },
          movementRange: { x: 75, y: 85 },
          duration: 26,
          size: 52,
        },
      ];

    case 'Город':
    case 'Самоуправление':
      return [
        {
          icon: <Building2 />,
          initialPosition: { x: '15%', y: '45%' },
          movementRange: { x: 80, y: 60 },
          duration: 25,
          size: 50,
        },
      ];

    case 'Вечеринки':
    case 'Фестивали, праздники':
      return [
        {
          icon: <PartyPopper />,
          initialPosition: { x: '25%', y: '30%' },
          movementRange: { x: 70, y: 90 },
          duration: 24,
          size: 55,
        },
      ];

    default:
      return []; // Без тематики - минимальные объекты или пусто
  }
}

export default function AnimatedObjects({ theme }: { theme: ThemeName }) {
  const objects = useMemo(() => getObjectsForTheme(theme), [theme]);

  if (objects.length === 0) {
    return null;
  }

  return (
    <>
      {objects.map((object, index) => (
        <motion.div
          key={index}
          className={styles.object}
          style={{
            position: 'absolute',
            left: object.initialPosition.x,
            top: object.initialPosition.y,
            width: object.size || 50,
            height: object.size || 50,
            color: 'rgba(0, 0, 0, 0.15)',
            opacity: 0.6,
          }}
          animate={{
            x: object.movementRange.x,
            y: object.movementRange.y,
            rotate: object.rotation ? 360 : 0,
          }}
          transition={{
            duration: object.duration,
            repeat: Infinity,
            ease: 'linear',
          }}>
          {object.icon}
        </motion.div>
      ))}
    </>
  );
}

