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
const checkLabelOverlap = (pos1: THREE.Vector3, pos2: THREE.Vector3, camera: THREE.Camera, threshold = 0.15): boolean => {
  const screenPos1 = pos1.clone().project(camera);
  const screenPos2 = pos2.clone().project(camera);
  return screenPos1.distanceTo(screenPos2) < threshold;
};

// Функция для получения оптимального размера шрифта
const getOptimalFontSize = (childrenCount: number, isMobile: boolean): number => {
  if (isMobile) {
    if (childrenCount > 8) return 0.65;
    if (childrenCount > 5) return 0.7;
    return 0.75;
  }
  if (childrenCount > 12) return 0.75;
  if (childrenCount > 8) return 0.8;
  return 0.85;
};

// Функция для сокращения текста
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 2) + '...';
};

// Функция для получения оптимального масштаба для мобильных устройств
const getMobileScale = (active: boolean, isMobile: boolean): number => {
  if (!isMobile) return active ? 1.3 : 1;
  return active ? 1.15 : 1;
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
  anyActive,
  scale = 1
}: ThemeNodeProps & { scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const [labelVisible, setLabelVisible] = useState(true);
  const [childLabelsVisible, setChildLabelsVisible] = useState<Record<string, boolean>>({});
  const [labelPosition, setLabelPosition] = useState<THREE.Vector3>(new THREE.Vector3());
  
  // Оптимизированные размеры для разных состояний
  const orbitRadius = useMemo(() => (isMobile ? 2.8 : 3.5) * scale, [isMobile, scale]);
  const nodeScale = useMemo(() => (isMobile ? 0.35 : 0.45) * scale, [isMobile, scale]);
  const childOrbitRadius = useMemo(() => (isMobile ? 1.2 : 1.5) * scale, [isMobile, scale]);
  const childNodeScale = useMemo(() => (isMobile ? 0.18 : 0.22) * scale, [isMobile, scale]);

  // Вычисляем позицию узла с учетом активного состояния
  const angle = (index / total) * Math.PI * 2;
  const x = Math.cos(angle) * orbitRadius;
  const y = Math.sin(angle) * orbitRadius;
  const z = isMobile ? 0.3 * Math.sin(angle * 2) : 0.5 * Math.sin(angle * 2);

  // Анимации с учетом состояния
  const { scale: springScale, glow, opacity, groupScale, rotation } = useSpring({
    scale: getMobileScale(active, isMobile),
    glow: active ? (isMobile ? 1.5 : 2) : hovered ? 1.5 : 0.7,
    opacity: active ? 1 : anyActive ? (isMobile ? 0.4 : 0.6) : 0.7,
    groupScale: active ? (isMobile ? 1.1 : 1) : anyActive ? 0.85 : 1,
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

  // Оптимальный размер шрифта для подписей
  const optimalFontSize = useMemo(() => 
    getOptimalFontSize(children.length, isMobile),
    [children.length, isMobile]
  );

  // Максимальная длина текста для подписей
  const maxTextLength = useMemo(() => 
    isMobile ? (children.length > 5 ? 12 : 16) : (children.length > 8 ? 14 : 20),
    [children.length, isMobile]
  );

  // Проверяем видимость подписей
  useEffect(() => {
    if (!groupRef.current) return;

    const updateLabelVisibility = () => {
      if (!groupRef.current || !camera) return;

      const nodePosition = groupRef.current.position.clone();
      const isNodeVisible = isPointVisible(nodePosition, camera);
      
      // На мобильных показываем все подписи по умолчанию, но скрываем неактивные при выборе
      if (isMobile) {
        setLabelVisible(isNodeVisible && (!anyActive || active));
      } else {
        setLabelVisible(isNodeVisible);
      }

      // Проверяем видимость подписей дочерних узлов
      const newChildLabelsVisible: Record<string, boolean> = {};
      const visiblePositions: THREE.Vector3[] = [];

      children.forEach((child, i) => {
        const childAngle = (i / children.length) * Math.PI * 2;
        const childX = Math.cos(childAngle) * childOrbitRadius;
        const childY = Math.sin(childAngle) * childOrbitRadius;
        const childPos = nodePosition.clone().add(new THREE.Vector3(childX, childY, 0));
        
        // На мобильных показываем подписи дочерних узлов только для активного графа
        if (isMobile && !active) {
          newChildLabelsVisible[child._id.$oid] = false;
          return;
        }

        // Проверяем видимость и перекрытие
        const isChildLabelVisible = isPointVisible(childPos, camera);
        if (isChildLabelVisible) {
          // Проверяем перекрытие с уже видимыми подписями
          const hasOverlap = visiblePositions.some(pos => 
            checkLabelOverlap(childPos, pos, camera)
          );
          
          if (!hasOverlap) {
            visiblePositions.push(childPos);
            newChildLabelsVisible[child._id.$oid] = true;
          } else {
            newChildLabelsVisible[child._id.$oid] = false;
          }
        } else {
          newChildLabelsVisible[child._id.$oid] = false;
        }
      });
      
      setChildLabelsVisible(newChildLabelsVisible);
    };

    // Обновляем видимость при изменении камеры
    const updateOnCameraChange = () => {
      requestAnimationFrame(updateLabelVisibility);
    };

    // @ts-expect-error 123
    camera.addEventListener('change', updateOnCameraChange);
    updateLabelVisibility();

    return () => {
      // @ts-expect-error 123
      camera.removeEventListener('change', updateOnCameraChange);
    };
  }, [camera, children, childOrbitRadius, active, anyActive, isMobile]);

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
      <a.mesh ref={meshRef} scale={springScale}>
        <octahedronGeometry args={[nodeScale, 0]} />
        <MeshDistortMaterial
          color={active ? activeColor : defaultColor}
          emissive={active ? activeColor : defaultColor}
          emissiveIntensity={glow.get()}
          roughness={active ? (isMobile ? 0.3 : 0.2) : 0.3}
          metalness={active ? (isMobile ? 0.7 : 0.9) : 0.8}
          transparent
          opacity={opacity.get()}
          distort={isMobile ? 0.15 : 0.2}
          speed={isMobile ? 1.5 : 2}
        />
      </a.mesh>

      {/* След узла */}
      <a.mesh ref={trailRef} scale={[springScale.get() * (isMobile ? 1.2 : 1.5), springScale.get() * 0.3, springScale.get() * (isMobile ? 1.2 : 1.5)]}>
        <coneGeometry args={[nodeScale * 0.8, nodeScale * 2, 8]} />
        <MeshWobbleMaterial
          color={active ? activeColor : defaultColor}
          transparent
          opacity={active ? (isMobile ? 0.3 : 0.4) : 0.3}
          side={THREE.BackSide}
          factor={isMobile ? 0.15 : 0.2}
          speed={isMobile ? 0.8 : 1}
        />
      </a.mesh>

      {/* Подпись основного узла */}
      {labelVisible && (
        <Billboard position={[0, 0.8, 0]}>
          <Html center>
            <div 
              className={`${styles.themeLabel} ${active ? styles.active : ''} ${anyActive && !active ? styles.inactive : ''}`}
              style={{
                transform: `scale(${active ? (isMobile ? 1.05 : 1.1) : 1})`,
                transition: 'transform 0.2s ease',
                fontSize: `${optimalFontSize}rem`
              }}
            >
              <span className={styles.emoji}>{THEME_CONFIG[theme.name] || '✨'}</span>
              <span className={styles.labelText} title={theme.name}>
                {truncateText(theme.name, maxTextLength)}
              </span>
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
            scale={springScale}
          >
            <mesh>
              <octahedronGeometry args={[childNodeScale, 0]} />
              <MeshDistortMaterial
                color={activeColor}
                emissive={activeColor}
                emissiveIntensity={isMobile ? 1.2 : 1.5}
                roughness={isMobile ? 0.3 : 0.2}
                metalness={isMobile ? 0.7 : 0.8}
                transparent
                opacity={opacity.get()}
                distort={isMobile ? 0.1 : 0.1}
                speed={isMobile ? 1.2 : 1.5}
              />
            </mesh>

            <mesh scale={[1.2, 0.2, 1.2]}>
              <coneGeometry args={[childNodeScale * 0.6, childNodeScale * 1.5, 8]} />
              <MeshWobbleMaterial
                color={activeColor}
                transparent
                opacity={isMobile ? 0.25 : 0.3}
                side={THREE.BackSide}
                factor={isMobile ? 0.12 : 0.15}
                speed={isMobile ? 1 : 1.2}
              />
            </mesh>

            {/* Подпись дочернего узла */}
            {childLabelsVisible[child._id.$oid] && (
              <Billboard position={[0, 0.4, 0]}>
                <Html center>
                  <div 
                    className={`${styles.childLabel} ${active ? styles.active : ''}`}
                    style={{
                      transform: `scale(${active ? (isMobile ? 1.02 : 1.05) : 1})`,
                      transition: 'transform 0.2s ease',
                      fontSize: `${optimalFontSize * 0.9}rem`
                    }}
                  >
                    <span className={styles.labelText} title={child.name}>
                      {truncateText(child.name, maxTextLength - 2)}
                    </span>
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