'use client'

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, MeshWobbleMaterial, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface PlanetProps {
  scale?: number;
}

export function Planet({ scale = 1 }: PlanetProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const atmosphere = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  
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
  
  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.08;
      mesh.current.rotation.x += delta * 0.02;
    }
    if (atmosphere.current) {
      atmosphere.current.rotation.y += delta * 0.06;
      atmosphere.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <group scale={[scale, scale, scale]}>
      {/* Main planet sphere with distortion effect */}
      <mesh ref={mesh} castShadow receiveShadow>
        <sphereGeometry args={[planetRadius, 64, 64]} />
        <MeshDistortMaterial
          color="#3a1c6b"
          roughness={0.4}
          metalness={0.7}
          emissive="#a04fff"
          emissiveIntensity={0.3}
          distort={0.15}
          speed={1.5}
        />
      </mesh>

      {/* Atmosphere layer */}
      <mesh ref={atmosphere} scale={[1.22, 1.22, 1.22]}>
        <sphereGeometry args={[planetRadius, 32, 32]} />
        <MeshWobbleMaterial
          color="#a04fff"
          transparent
          opacity={0.13}
          side={THREE.BackSide}
          factor={0.2}
          speed={1}
        />
      </mesh>

      {/* Glow effect */}
      <mesh scale={[1.3, 1.3, 1.3]}>
        <sphereGeometry args={[planetRadius, 32, 32]} />
        <meshBasicMaterial
          color="#a04fff"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Surface details */}
      <mesh scale={[1.01, 1.01, 1.01]}>
        <sphereGeometry args={[planetRadius, 64, 64]} />
        <MeshReflectorMaterial
          color="#4a2c8b"
          roughness={0.8}
          metalness={0.2}
          mirror={0.1}
          blur={[400, 100]}
          mixBlur={1}
          mixStrength={0.5}
          resolution={256}
        />
      </mesh>
    </group>
  );
} 