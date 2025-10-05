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
  const atmosphere = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
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

  // Создаем материал для атмосферы
  const atmosphereMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: new THREE.Color(0x4fc3f7),
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
      shininess: 100,
    });
  }, []);

  // Создаем материал для свечения
  const glowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x4fc3f7),
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
  }, []);
  
  useFrame((_, delta) => {
    if (mesh.current) {
      // Медленное вращение планеты
      mesh.current.rotation.y += delta * 0.05;
    }
    if (atmosphere.current) {
      // Атмосфера вращается немного быстрее
      atmosphere.current.rotation.y += delta * 0.08;
    }
    if (glowRef.current) {
      // Свечение пульсирует
      const time = Date.now() * 0.001;
      glowRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
    }
  });

  return (
    <group scale={[scale, scale, scale]}>
      {/* Основная планета с текстурой Земли */}
      <mesh ref={mesh} castShadow receiveShadow>
        <sphereGeometry args={[planetRadius, 128, 64]} />
        <primitive object={planetMaterial} />
      </mesh>

      {/* Атмосфера Земли */}
      <mesh ref={atmosphere} scale={[1.15, 1.15, 1.15]}>
        <sphereGeometry args={[planetRadius, 64, 32]} />
        <primitive object={atmosphereMaterial} />
      </mesh>

      {/* Свечение атмосферы */}
      <mesh ref={glowRef} scale={[1.25, 1.25, 1.25]}>
        <sphereGeometry args={[planetRadius, 32, 16]} />
        <primitive object={glowMaterial} />
      </mesh>

      {/* Дополнительное свечение для эффекта */}
      <mesh scale={[1.4, 1.4, 1.4]}>
        <sphereGeometry args={[planetRadius, 16, 8]} />
        <meshBasicMaterial
          color="#4fc3f7"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
} 