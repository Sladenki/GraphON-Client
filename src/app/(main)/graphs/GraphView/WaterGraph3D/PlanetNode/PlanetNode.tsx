'use client'

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, ThreeEvent, useThree } from '@react-three/fiber';
import { Billboard, Html, useTexture } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';

import styles from './PlanetNode.module.scss';
import { ThemeNodeProps } from '../types';
import { THEME_CONFIG } from '../constants';

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
  const isIPhone = typeof window !== 'undefined' && /iPhone|iPod/.test(navigator.userAgent);
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  const isSmallScreen = screenWidth <= 375;
  const isLargeIPhone = screenWidth >= 430;
  
  if (isMobile) {
    if (isLargeIPhone) {
      if (childrenCount > 8) return 0.65;
      if (childrenCount > 5) return 0.7;
      return 0.75;
    }
    if (isSmallScreen && isIPhone) {
      if (childrenCount > 8) return 0.55;
      if (childrenCount > 5) return 0.6;
      return 0.65;
    }
    if (isIPhone) {
      if (childrenCount > 8) return 0.6;
      if (childrenCount > 5) return 0.65;
      return 0.7;
    }
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

// Функция для расчета радиуса орбиты
const calculateOrbitRadius = (childrenCount: number, isMobile: boolean): number => {
  const isIPhone = typeof window !== 'undefined' && /iPhone|iPod/.test(navigator.userAgent);
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  const isSmallScreen = screenWidth <= 375;
  const isLargeIPhone = screenWidth >= 430;
  
  let baseRadius, minRadius, maxRadius;
  
  if (isLargeIPhone) {
    baseRadius = 3.2;
    minRadius = 2.8;
    maxRadius = 4.5;
  } else if (isSmallScreen && isIPhone) {
    baseRadius = 2.6;
    minRadius = 2.3;
    maxRadius = 3.8;
  } else if (isIPhone) {
    baseRadius = 2.8;
    minRadius = 2.5;
    maxRadius = 4.0;
  } else if (isMobile) {
    baseRadius = 1.8;
    minRadius = 1.5;
    maxRadius = 2.5;
  } else {
    baseRadius = 2.2;
    minRadius = 1.8;
    maxRadius = 3.0;
  }
  
  const radius = baseRadius + (childrenCount * 0.1);
  return Math.min(Math.max(radius, minRadius), maxRadius);
};

// Конфигурация планет для разных тематик
const PLANET_CONFIG: Record<string, { color: string; emissive: string; roughness: number; metalness: number }> = {
  "Наука": { color: "#4A90E2", emissive: "#2E5BBA", roughness: 0.3, metalness: 0.7 },
  "Самоуправление": { color: "#50C878", emissive: "#2E8B57", roughness: 0.4, metalness: 0.6 },
  "Творчество": { color: "#FF6B6B", emissive: "#E53E3E", roughness: 0.2, metalness: 0.8 },
  "Спорт": { color: "#FFD93D", emissive: "#FFA500", roughness: 0.5, metalness: 0.5 },
  "Волонтерство": { color: "#FF69B4", emissive: "#C71585", roughness: 0.3, metalness: 0.7 },
  "Волонтёрство": { color: "#FF69B4", emissive: "#C71585", roughness: 0.3, metalness: 0.7 },
  "Медиа": { color: "#9370DB", emissive: "#6A5ACD", roughness: 0.4, metalness: 0.6 },
  "Отряды": { color: "#20B2AA", emissive: "#008B8B", roughness: 0.3, metalness: 0.7 },
  "Литература": { color: "#DDA0DD", emissive: "#BA55D3", roughness: 0.2, metalness: 0.8 },
  "Трудоустройство": { color: "#F0E68C", emissive: "#DAA520", roughness: 0.5, metalness: 0.5 },
  "Военно-патриотизм": { color: "#CD853F", emissive: "#8B4513", roughness: 0.6, metalness: 0.4 }
};

export function PlanetNode({ 
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
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const [labelVisible, setLabelVisible] = useState(true);
  const [childLabelsVisible, setChildLabelsVisible] = useState<Record<string, boolean>>({});
  
  // Получаем дочерние узлы
  const children = useMemo(() => 
    data.filter(n => n.parentGraphId?.$oid === theme._id.$oid),
    [theme, data]
  );

  // Определяем тип устройства
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  const isSmallScreen = screenWidth <= 375;
  const isLargeIPhone = screenWidth >= 430;
  const isIPhone = typeof window !== 'undefined' && /iPhone|iPod/.test(navigator.userAgent);
  
  // Радиус орбиты
  const orbitRadius = useMemo(() => {
    if (isSmallScreen && isIPhone) return 1.9 * 2 * scale;
    if (isIPhone) return 2.1 * 2 * scale;
    return (isMobile ? 1.87 : 3.5) * scale;
  }, [isMobile, scale, isSmallScreen, isIPhone]);
  
  // Размер планеты
  const planetScale = useMemo(() => {
    const baseScale = isSmallScreen && isIPhone ? 1.4 : (isIPhone ? 1.5 : 1);
    
    let baseMobileSize, baseDesktopSize;
    
    if (isIPhone) {
      baseMobileSize = 0.35;
      baseDesktopSize = 0.45;
    } else {
      baseMobileSize = 0.23;
      baseDesktopSize = 0.45;
    }
    
    if (theme.graphType === 'global') {
      if (anyActive) {
        const activeSize = isIPhone ? 0.12 : 0.09;
        return (isMobile ? activeSize : 0.18) * scale * baseScale;
      }
      return (isMobile ? baseMobileSize : baseDesktopSize) * scale * baseScale;
    }
    
    if (active) {
      const activeSize = isIPhone ? 0.25 : 0.17;
      return (isMobile ? activeSize : 0.3) * scale * baseScale;
    }
    if (anyActive) {
      const anyActiveSize = isIPhone ? 0.18 : 0.13;
      return (isMobile ? anyActiveSize : 0.25) * scale * baseScale;
    }
    return (isMobile ? baseMobileSize : baseDesktopSize) * scale * baseScale;
  }, [isMobile, scale, active, anyActive, theme.graphType, isSmallScreen, isIPhone]);
  
  const childOrbitRadius = useMemo(() => {
    const baseRadius = calculateOrbitRadius(children.length, isMobile);
    if (isLargeIPhone) return baseRadius * 1.4 * scale;
    if (isSmallScreen && isIPhone) return baseRadius * 1.2 * scale;
    if (isIPhone) return baseRadius * 1.3 * scale;
    return baseRadius * scale;
  }, [children.length, isMobile, scale, isSmallScreen, isIPhone, isLargeIPhone]);
  
  const childPlanetScale = useMemo(() => {
    let baseChildScale;
    if (isLargeIPhone) {
      baseChildScale = 1.2;
    } else if (isSmallScreen && isIPhone) {
      baseChildScale = 1.0;
    } else if (isIPhone) {
      baseChildScale = 1.1;
    } else {
      baseChildScale = 1;
    }
    
    const baseMobileSize = isIPhone ? 0.22 : 0.15;
    return (isMobile ? baseMobileSize : 0.28) * scale * baseChildScale;
  }, [isMobile, scale, isSmallScreen, isIPhone, isLargeIPhone]);

  // Вычисляем позицию узла
  const angle = (index / total) * Math.PI * 2;
  const x = Math.cos(angle) * orbitRadius;
  const y = Math.sin(angle) * orbitRadius;
  const z = isMobile ? 0.15 * Math.sin(angle * 2) : 0.5 * Math.sin(angle * 2);

  // Получаем конфигурацию планеты
  const planetConfig = PLANET_CONFIG[theme.name] || PLANET_CONFIG["Наука"];

  // Анимации
  const { scale: springScale, glow, opacity, groupScale, rotation } = useSpring({
    scale: active ? 1.3 : hovered ? 1.1 : 1,
    glow: active ? (isMobile ? 2.0 : 2.5) : hovered ? 1.5 : 0.8,
    opacity: active ? 1 : anyActive ? (isMobile ? 0.4 : 0.5) : 0.8,
    groupScale: theme.name === 'КГТУ' && anyActive ? 0.4 : active ? 1 : anyActive ? 0.7 : 1,
    rotation: [0, 0, 0] as [number, number, number],
    config: { 
      tension: 280, 
      friction: 25,
      mass: 1,
      clamp: false,
      precision: 0.001
    }
  });

  // Оптимальный размер шрифта
  const optimalFontSize = useMemo(() => 
    getOptimalFontSize(children.length, isMobile),
    [children.length, isMobile]
  );

  // Максимальная длина текста
  const maxTextLength = useMemo(() => {
    if (isMobile) {
      if (isLargeIPhone) {
        return children.length > 5 ? 12 : 16;
      }
      if (isSmallScreen && isIPhone) {
        return children.length > 5 ? 8 : 12;
      }
      if (isIPhone) {
        return children.length > 5 ? 10 : 14;
      }
      return children.length > 5 ? 12 : 16;
    }
    return children.length > 8 ? 14 : 20;
  }, [children.length, isMobile, isSmallScreen, isIPhone, isLargeIPhone]);

  // Проверяем видимость подписей
  useEffect(() => {
    if (!groupRef.current) return;

    const updateLabelVisibility = () => {
      if (!groupRef.current || !camera) return;

      const nodePosition = groupRef.current.position.clone();
      const isNodeVisible = isPointVisible(nodePosition, camera);
      
      if (isMobile) {
        setLabelVisible(isNodeVisible && (!anyActive || active));
      } else {
        setLabelVisible(isNodeVisible);
      }

      const newChildLabelsVisible: Record<string, boolean> = {};
      const visiblePositions: THREE.Vector3[] = [];

      children.forEach((child, i) => {
        const childAngle = (i / children.length) * Math.PI * 2;
        const childX = Math.cos(childAngle) * childOrbitRadius;
        const childY = Math.sin(childAngle) * childOrbitRadius;
        const childPos = nodePosition.clone().add(new THREE.Vector3(childX, childY, 0));
        
        if (isMobile && !active) {
          newChildLabelsVisible[child._id.$oid] = false;
          return;
        }

        const isChildLabelVisible = isPointVisible(childPos, camera);
        if (isChildLabelVisible) {
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
    }
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * (active ? 0.3 : 0.2);
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += delta * (active ? 0.4 : 0.3);
    }
    if (glowRef.current) {
      const time = Date.now() * 0.001;
      glowRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (active) {
      setActive(null);
      onThemeSelect(null);
    } else {
      setActive(theme._id.$oid);
      onThemeSelect(theme);
    }
  };

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
      {/* Основная планета */}
      <a.mesh ref={planetRef} scale={springScale}>
        <sphereGeometry args={[planetScale, 64, 32]} />
        <meshPhongMaterial
          color={planetConfig.color}
          emissive={planetConfig.emissive}
          emissiveIntensity={glow.get() * 0.3}
          shininess={100}
          roughness={planetConfig.roughness}
          metalness={planetConfig.metalness}
          transparent
          opacity={opacity.get()}
        />
      </a.mesh>

      {/* Атмосфера планеты */}
      <a.mesh ref={atmosphereRef} scale={[springScale.get() * 1.1, springScale.get() * 1.1, springScale.get() * 1.1]}>
        <sphereGeometry args={[planetScale, 32, 16]} />
        <meshPhongMaterial
          color={planetConfig.color}
          transparent
          opacity={active ? 0.2 : 0.1}
          side={THREE.BackSide}
          shininess={100}
        />
      </a.mesh>

      {/* Свечение планеты */}
      <a.mesh ref={glowRef} scale={[springScale.get() * 1.3, springScale.get() * 1.3, springScale.get() * 1.3]}>
        <sphereGeometry args={[planetScale, 16, 8]} />
        <meshBasicMaterial
          color={planetConfig.color}
          transparent
          opacity={active ? 0.15 : 0.05}
          side={THREE.BackSide}
        />
      </a.mesh>

      {/* Орбитальная окружность */}
      {active && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[childOrbitRadius - 0.1, childOrbitRadius + 0.1, 64]} />
          <meshBasicMaterial
            color={planetConfig.color}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Подпись основной планеты */}
      {labelVisible && (
        <Billboard position={[0, (isMobile ? (isIPhone ? 0.45 : 0.3) : 0.8), 0]}>
          <Html center>
            <div 
              className={`${styles.planetLabel} ${active ? styles.active : ''} ${anyActive && !active ? styles.inactive : ''}`}
              style={{
                transform: `scale(${active ? (isMobile ? 1.05 : 1.1) : 1})`,
                transition: 'transform 0.2s ease',
                fontSize: `${optimalFontSize}rem`,
                opacity: active ? 1 : anyActive ? 0.4 : 1,
                backgroundColor: `rgba(${parseInt(planetConfig.color.slice(1, 3), 16)}, ${parseInt(planetConfig.color.slice(3, 5), 16)}, ${parseInt(planetConfig.color.slice(5, 7), 16)}, 0.1)`,
                borderColor: planetConfig.color
              }}
            >
              <span className={styles.emoji}>{THEME_CONFIG[theme.name] || '🌍'}</span>
              <span className={styles.labelText} title={theme.name}>
                {truncateText(theme.name, maxTextLength)}
              </span>
            </div>
          </Html>
        </Billboard>
      )}

      {/* Дочерние планеты */}
      {active && children.map((child, i) => {
        const childAngle = (i / children.length) * Math.PI * 2;
        const cx = Math.cos(childAngle) * childOrbitRadius;
        const cy = Math.sin(childAngle) * childOrbitRadius;
        
        const childConfig = PLANET_CONFIG[child.name] || PLANET_CONFIG["Наука"];
        
        return (
          <a.group
            key={child._id.$oid}
            position={[cx, cy, 0]}
            scale={springScale}
          >
            <mesh>
              <sphereGeometry args={[childPlanetScale, 32, 16]} />
              <meshPhongMaterial
                color={childConfig.color}
                emissive={childConfig.emissive}
                emissiveIntensity={isMobile ? 0.4 : 0.5}
                shininess={100}
                roughness={childConfig.roughness}
                metalness={childConfig.metalness}
                transparent
                opacity={opacity.get()}
              />
            </mesh>

            <mesh scale={[1.1, 1.1, 1.1]}>
              <sphereGeometry args={[childPlanetScale, 16, 8]} />
              <meshPhongMaterial
                color={childConfig.color}
                transparent
                opacity={isMobile ? 0.15 : 0.2}
                side={THREE.BackSide}
                shininess={100}
              />
            </mesh>

            {/* Подпись дочерней планеты */}
            {childLabelsVisible[child._id.$oid] && (
              <Billboard position={[0, 0.4, 0]}>
                <Html center>
                  <div 
                    className={`${styles.childLabel} ${active ? styles.active : ''}`}
                    style={{
                      transform: `scale(${active ? (isMobile ? 1.02 : 1.05) : 1})`,
                      transition: 'transform 0.2s ease',
                      fontSize: `${optimalFontSize * 0.9}rem`,
                      backdropFilter: 'blur(4px)',
                      backgroundColor: `rgba(${parseInt(childConfig.color.slice(1, 3), 16)}, ${parseInt(childConfig.color.slice(3, 5), 16)}, ${parseInt(childConfig.color.slice(5, 7), 16)}, 0.1)`,
                      borderColor: childConfig.color,
                      padding: '4px 8px',
                      borderRadius: '4px'
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
