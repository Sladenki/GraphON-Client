'use client'

import { useState, useRef, useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { CameraControllerProps } from './types';
import { calculateOptimalCameraPosition, getDefaultCameraPosition } from './cameraUtils';
import styles from './Camera.module.scss';

export function CameraController({ activeNodeRef, isMobile }: CameraControllerProps) {
  const { camera } = useThree();
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  // Функция для плавного перемещения камеры
  const animateCamera = useCallback((targetPosition: THREE.Vector3, targetLookAt: THREE.Vector3) => {
    if (!camera || isAnimating) return;
    
    setIsAnimating(true);
    const startPosition = camera.position.clone();
    const startLookAt = new THREE.Vector3();
    camera.getWorldDirection(startLookAt);
    startLookAt.multiplyScalar(10).add(camera.position);

    const duration = 1000; // 1 секунда
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Используем easeInOutCubic для плавности
      const easeProgress = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      // Интерполируем позицию и направление взгляда
      camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
      
      const currentLookAt = new THREE.Vector3();
      currentLookAt.lerpVectors(startLookAt, targetLookAt, easeProgress);
      camera.lookAt(currentLookAt);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animate();
  }, [camera, isAnimating]);

  // Обработка изменения активного узла
  useEffect(() => {
    if (activeNodeRef.current) {
      const node = activeNodeRef.current;
      const { cameraPosition, lookAt } = calculateOptimalCameraPosition(node, isMobile);
      animateCamera(cameraPosition, lookAt);
    } else {
      const { cameraPosition, lookAt } = getDefaultCameraPosition(isMobile);
      animateCamera(cameraPosition, lookAt);
    }
  }, [activeNodeRef.current, isMobile, animateCamera]);

  // Очистка анимации при размонтировании
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Функция сброса позиции камеры
  const resetCamera = useCallback(() => {
    if (!camera) return;
    
    const { cameraPosition, lookAt } = getDefaultCameraPosition(isMobile);
    animateCamera(cameraPosition, lookAt);
  }, [camera, isMobile, animateCamera]);

  return (
    <>
      <OrbitControls
        enablePan={false}
        minDistance={isMobile ? 8 : 8}
        maxDistance={isMobile ? 18 : 20}
        enableDamping
        dampingFactor={0.05}
        target={[0, 0, 0]}
      />
      {!isMobile && activeNodeRef.current && (
        <Html position={[0, 0, 0]} center>
          <button 
            className={styles.resetButton}
            onClick={resetCamera}
            title="Вернуться к общему виду"
          >
            Сбросить вид
          </button>
        </Html>
      )}
    </>
  );
} 