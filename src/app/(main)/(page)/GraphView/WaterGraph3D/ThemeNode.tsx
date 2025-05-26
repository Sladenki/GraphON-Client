'use client'

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, ThreeEvent, useThree } from '@react-three/fiber';
import { Billboard, Html, MeshDistortMaterial, MeshWobbleMaterial, Text } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { ThemeNodeProps } from './types';
import { THEME_CONFIG } from './constants';
import styles from './styles.module.scss';

// Функция для проверки видимости точки в камере
const isPointVisible = (point: THREE.Vector3, camera: THREE.Camera): boolean => {
  const screenPoint = point.clone().project(camera);
  return screenPoint.z < 1 && screenPoint.x > -1 && screenPoint.x < 1 && screenPoint.y > -1 && screenPoint.y < 1;
};

// Функция для проверки перекрытия подписей
const checkLabelOverlap = (pos1: THREE.Vector3, pos2: THREE.Vector3, camera: THREE.Camera, threshold = 0.1): boolean => {
  const screenPos1 = pos1.clone().project(camera);
  const screenPos2 = pos2.clone().project(camera);
  return screenPos1.distanceTo(screenPos2) < threshold;
};

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
  const { camera } = useThree();
  const [labelVisible, setLabelVisible] = useState(true);
  const [childLabelsVisible, setChildLabelsVisible] = useState<Record<string, boolean>>({});
  const [labelPosition, setLabelPosition] = useState<THREE.Vector3>(new THREE.Vector3());
  
  // Оптимизированные размеры для разных состояний
  const orbitRadius = useMemo(() => isMobile ? 2.8 : 3.5, [isMobile]);
  const nodeScale = useMemo(() => isMobile ? 0.35 : 0.45, [isMobile]);
  const childOrbitRadius = useMemo(() => isMobile ? 1.2 : 1.5, [isMobile]);
  const childNodeScale = useMemo(() => isMobile ? 0.18 : 0.22, [isMobile]);

  // Вычисляем позицию узла с учетом активного состояния
  const angle = (index / total) * Math.PI * 2;
  const x = Math.cos(angle) * orbitRadius;
  const y = Math.sin(angle) * orbitRadius;
  const z = isMobile ? 0.3 * Math.sin(angle * 2) : 0.5 * Math.sin(angle * 2);

  // Анимации с учетом состояния
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

  // Получаем дочерние узлы
  const children = useMemo(() => 
    data.filter(n => n.parentGraphId?.$oid === theme._id.$oid),
    [theme, data]
  );

  // Проверяем видимость подписей
  useEffect(() => {
    if (!groupRef.current) return;

    const updateLabelVisibility = () => {
      if (!groupRef.current || !camera) return;

      const nodePosition = groupRef.current.position.clone();
      const isNodeVisible = isPointVisible(nodePosition, camera);
      setLabelVisible(isNodeVisible);

      // Проверяем видимость подписей дочерних узлов
      const newChildLabelsVisible: Record<string, boolean> = {};
      children.forEach((child, i) => {
        const childAngle = (i / children.length) * Math.PI * 2;
        const childX = Math.cos(childAngle) * childOrbitRadius;
        const childY = Math.sin(childAngle) * childOrbitRadius;
        const childPos = nodePosition.clone().add(new THREE.Vector3(childX, childY, 0));
        
        // Проверяем, не перекрывается ли подпись другими узлами
        let isChildLabelVisible = isPointVisible(childPos, camera);
        if (isChildLabelVisible) {
          children.forEach((otherChild, j) => {
            if (i !== j) {
              const otherAngle = (j / children.length) * Math.PI * 2;
              const otherX = Math.cos(otherAngle) * childOrbitRadius;
              const otherY = Math.sin(otherAngle) * childOrbitRadius;
              const otherPos = nodePosition.clone().add(new THREE.Vector3(otherX, otherY, 0));
              
              if (checkLabelOverlap(childPos, otherPos, camera)) {
                isChildLabelVisible = false;
              }
            }
          });
        }
        
        newChildLabelsVisible[child._id.$oid] = isChildLabelVisible;
      });
      
      setChildLabelsVisible(newChildLabelsVisible);
    };

    // Обновляем видимость при изменении камеры
    const updateOnCameraChange = () => {
      requestAnimationFrame(updateLabelVisibility);
    };

    camera.addEventListener('change', updateOnCameraChange);
    updateLabelVisibility();

    return () => {
      camera.removeEventListener('change', updateOnCameraChange);
    };
  }, [camera, children, childOrbitRadius]);

  // Анимация вращения
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (active ? 0.8 : 0.5);
      if (trailRef.current) {
        trailRef.current.rotation.z += delta * (active ? 1.2 : 0.8);
      }
    }
  });

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
      {/* Основной узел */}
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

      {/* След узла */}
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

      {/* Подпись основного узла */}
      {labelVisible && (
        <Billboard position={[0, 0.8, 0]}>
          <Html center>
            <div 
              className={`${styles.themeLabel} ${active ? styles.active : ''} ${anyActive && !active ? styles.inactive : ''}`}
              style={{
                transform: `scale(${active ? 1.1 : 1})`,
                transition: 'transform 0.2s ease'
              }}
            >
              <span className={styles.emoji}>{THEME_CONFIG[theme.name] || '✨'}</span>
              <span className={styles.labelText}>{theme.name}</span>
            </div>
          </Html>
        </Billboard>
      )}

      {/* Дочерние узлы */}
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

            {/* Подпись дочернего узла */}
            {childLabelsVisible[child._id.$oid] && (
              <Billboard position={[0, 0.4, 0]}>
                <Html center>
                  <div 
                    className={`${styles.childLabel} ${active ? styles.active : ''}`}
                    style={{
                      transform: `scale(${active ? 1.05 : 1})`,
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <span className={styles.labelText}>{child.name}</span>
                  </div>
                </Html>
              </Billboard>
            )}
          </a.group>
        );
      })}
    </a.group>
  );
} 