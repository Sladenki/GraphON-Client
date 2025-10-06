'use client'

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface PlanetProps {
  scale?: number;
}

export function Planet({ scale = 1 }: PlanetProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  
  // Загружаем текстуру Земли
  const earthTexture = useTexture('/earth-texture.jpg');
  
  // Определяем размер планеты в зависимости от устройства
  const planetRadius = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const isIPhone = typeof window !== 'undefined' && /iPhone|iPod/.test(navigator.userAgent);
    
    if (isIPhone) {
      return 2.4; // Увеличено с 1.8 для iPhone
    }
    if (isMobile) {
      return 1.8; // Увеличено для других мобильных
    }
    return 1.8; // Оригинальный размер для десктопа
  }, []);

  // Создаем материал для планеты с текстурой Земли
  const planetMaterial = useMemo(() => {
    const material = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 30,
      specular: new THREE.Color(0x222222),
      transparent: false,
    });
    
    // Настраиваем повторение текстуры
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.wrapT = THREE.RepeatWrapping;
    
    return material;
  }, [earthTexture]);
  
  useFrame((_, delta) => {
    if (mesh.current) {
      // Медленное вращение планеты
      mesh.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group scale={[scale, scale, scale]}>
      {/* Основная планета с текстурой Земли */}
      <mesh ref={mesh} castShadow receiveShadow>
        <sphereGeometry args={[planetRadius, 128, 64]} />
        <primitive object={planetMaterial} />
      </mesh>
    </group>
  );
} 