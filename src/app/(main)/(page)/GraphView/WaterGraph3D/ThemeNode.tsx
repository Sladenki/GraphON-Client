'use client'

import { useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Billboard, Html, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { ThemeNodeProps } from './types';
import { THEME_CONFIG } from './constants';
import styles from './styles.module.scss';

export function ThemeNode({ 
  theme, 
  index, 
  total, 
  active, 
  hovered, 
  setActive, 
  setHovered,
  onThemeSelect,
  data,
  isMobile,
  anyActive
}: ThemeNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  
  const orbitRadius = useMemo(() => isMobile ? 2.8 : 3.5, [isMobile]);
  const nodeScale = useMemo(() => isMobile ? 0.35 : 0.45, [isMobile]);
  const childOrbitRadius = useMemo(() => isMobile ? 1.2 : 1.5, [isMobile]);
  const childNodeScale = useMemo(() => isMobile ? 0.18 : 0.22, [isMobile]);

  const angle = (index / total) * Math.PI * 2;
  const x = Math.cos(angle) * orbitRadius;
  const y = Math.sin(angle) * orbitRadius;
  const z = isMobile ? 0.3 * Math.sin(angle * 2) : 0.5 * Math.sin(angle * 2);

  const { scale, glow, opacity, groupScale, rotation } = useSpring({
    scale: active ? 1.3 : hovered ? 1.25 : 1,
    glow: active ? 2 : hovered ? 1.5 : 0.7,
    opacity: active ? 1 : anyActive ? 0.6 : 0.7,
    groupScale: active ? 1 : anyActive ? 0.85 : 1,
    rotation: active ? [0, Math.PI * 2, 0] as [number, number, number] : [0, 0, 0] as [number, number, number],
    config: { 
      tension: 300, 
      friction: 20,
      mass: 1
    }
  });

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
      if (trailRef.current) {
        trailRef.current.rotation.z += delta * 0.8;
      }
    }
  });

  const children = useMemo(() => 
    data.filter(n => n.parentGraphId?.$oid === theme._id.$oid),
    [theme, data]
  );

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setActive(active ? null : theme._id.$oid);
    onThemeSelect(theme);
  };

  const activeColor = useMemo(() => new THREE.Color('#00ffff'), []);
  const defaultColor = useMemo(() => new THREE.Color('#ff4fd8'), []);

  return (
    <a.group 
      ref={groupRef}
      position={[x, y, z]}
      scale={groupScale}
      rotation={rotation as unknown as [number, number, number]}
      onPointerOver={() => setHovered(theme._id.$oid)}
      onPointerOut={() => setHovered(null)}
      onClick={handleClick}
      userData={{ themeId: theme._id.$oid }}
    >
      {/* Meteor core */}
      <a.mesh ref={meshRef} scale={scale}>
        <octahedronGeometry args={[nodeScale, 0]} />
        <MeshDistortMaterial
          color={active ? activeColor : defaultColor}
          emissive={active ? activeColor : defaultColor}
          emissiveIntensity={glow.get()}
          roughness={active ? 0.2 : 0.3}
          metalness={active ? 0.9 : 0.8}
          transparent
          opacity={opacity.get()}
          distort={0.2}
          speed={2}
        />
      </a.mesh>

      {/* Meteor trail */}
      <a.mesh ref={trailRef} scale={[scale.get() * 1.5, scale.get() * 0.3, scale.get() * 1.5]}>
        <coneGeometry args={[nodeScale * 0.8, nodeScale * 2, 8]} />
        <MeshWobbleMaterial
          color={active ? activeColor : defaultColor}
          transparent
          opacity={active ? 0.4 : 0.3}
          side={THREE.BackSide}
          factor={0.2}
          speed={1}
        />
      </a.mesh>

      {/* Theme label */}
      <Billboard position={[0, 0.8, 0]}>
        <Html center>
          <div className={`${styles.themeLabel} ${active ? styles.active : ''} ${anyActive && !active ? styles.inactive : ''}`}>
            <span className={styles.emoji}>{THEME_CONFIG[theme.name] || '✨'}</span>
            <span className={styles.labelText}>{theme.name}</span>
          </div>
        </Html>
      </Billboard>

      {/* Child nodes */}
      {active && children.map((child, i) => {
        const childAngle = (i / children.length) * Math.PI * 2;
        const cx = Math.cos(childAngle) * childOrbitRadius;
        const cy = Math.sin(childAngle) * childOrbitRadius;
        
        return (
          <a.group
            key={child._id.$oid}
            position={[cx, cy, 0]}
            scale={scale}
          >
            <mesh>
              <octahedronGeometry args={[childNodeScale, 0]} />
              <MeshDistortMaterial
                color={activeColor}
                emissive={activeColor}
                emissiveIntensity={1.5}
                roughness={0.2}
                metalness={0.8}
                transparent
                opacity={opacity.get()}
                distort={0.1}
                speed={1.5}
              />
            </mesh>

            <mesh scale={[1.2, 0.2, 1.2]}>
              <coneGeometry args={[childNodeScale * 0.6, childNodeScale * 1.5, 8]} />
              <MeshWobbleMaterial
                color={activeColor}
                transparent
                opacity={0.3}
                side={THREE.BackSide}
                factor={0.15}
                speed={1.2}
              />
            </mesh>

            <Billboard position={[0, 0.4, 0]}>
              <Html center>
                <div className={`${styles.childLabel} ${active ? styles.active : ''}`}>
                  <span className={styles.labelText}>{child.name}</span>
                </div>
              </Html>
            </Billboard>
          </a.group>
        );
      })}
    </a.group>
  );
} 