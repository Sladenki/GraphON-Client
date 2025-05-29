'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import { EffectComposer, Bloom, Outline } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { Object3D } from 'three';
import { WaterGraph3DProps, GraphNode } from './types';
import { useMediaQuery, debounce } from './hooks';
import { Planet } from './Planet';
import { ThemeNode } from './ThemeNode';
import { LeftPanel } from './LeftPanel';
import { ThemeCards } from './ThemeCards';
import styles from './styles.module.scss';

// Компонент для управления камерой
function CameraController({ 
  activeNodeRef, 
  isMobile 
}: { 
  activeNodeRef: React.RefObject<Object3D | null>,
  isMobile: boolean 
}) {
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

  // Функция для расчета оптимальной позиции камеры
  const calculateOptimalCameraPosition = useCallback((node: Object3D) => {
    // Получаем все дочерние элементы
    const children: THREE.Object3D[] = [];
    node.traverse((child) => {
      if (child !== node) {
        children.push(child);
      }
    });

    // Создаем ограничивающий бокс, включающий основной узел и все дочерние элементы
    const boundingBox = new THREE.Box3().setFromObject(node);
    children.forEach(child => {
      const childBox = new THREE.Box3().setFromObject(child);
      boundingBox.union(childBox);
    });

    // Получаем центр ограничивающего бокса
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);

    // Рассчитываем размер ограничивающего бокса
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    const maxDimension = Math.max(size.x, size.y, size.z);

    // Рассчитываем оптимальное расстояние до камеры с учетом количества дочерних элементов
    const childCount = children.length;
    const distanceMultiplier = isMobile
      ? Math.max(2.5, 2 + childCount * 0.2)
      : Math.max(3, 2.5 + childCount * 0.15);

    const optimalDistance = Math.max(
      isMobile ? 6 : 8,
      maxDimension * distanceMultiplier
    );

    // Определяем позицию узла относительно центра сцены
    const nodePosition = node.position.clone();
    const angle = Math.atan2(nodePosition.y, nodePosition.x);
    
    // Рассчитываем смещение камеры в зависимости от позиции узла
    const offsetX = Math.cos(angle) * optimalDistance * 0.8;
    const offsetY = Math.sin(angle) * optimalDistance * 0.8;
    
    // Рассчитываем высоту камеры для лучшего обзора
    const heightOffset = optimalDistance * 0.5;

    // Рассчитываем финальную позицию камеры
    const cameraPosition = new THREE.Vector3(
      center.x + offsetX,
      center.y + offsetY + heightOffset,
      center.z + optimalDistance
    );

    // Немного смещаем точку фокуса вверх для лучшего обзора
    const lookAt = new THREE.Vector3(
      center.x,
      center.y + heightOffset * 0.5,
      center.z
    );

    return {
      cameraPosition,
      lookAt
    };
  }, [isMobile]);

  // Обработка изменения активного узла
  useEffect(() => {
    if (activeNodeRef.current) {
      console.log('Active node changed:', activeNodeRef.current);
      const node = activeNodeRef.current;
      const { cameraPosition, lookAt } = calculateOptimalCameraPosition(node);
      console.log('New camera position:', cameraPosition);
      console.log('New look at:', lookAt);
      animateCamera(cameraPosition, lookAt);
    } else {
      // Если активный узел сброшен, возвращаем камеру в исходное положение
      console.log('Resetting camera to default position');
      const defaultPosition = new THREE.Vector3(0, 0, isMobile ? 8 : 12);
      const defaultLookAt = new THREE.Vector3(0, 0, 0);
      animateCamera(defaultPosition, defaultLookAt);
    }
  }, [activeNodeRef.current, calculateOptimalCameraPosition, animateCamera, isMobile]);

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
    
    const defaultPosition = new THREE.Vector3(0, 0, isMobile ? 8 : 12);
    const defaultLookAt = new THREE.Vector3(0, 0, 0);
    
    animateCamera(defaultPosition, defaultLookAt);
  }, [camera, isMobile, animateCamera]);

  return (
    <>
      <OrbitControls
        enablePan={false}
        minDistance={isMobile ? 6 : 8}
        maxDistance={isMobile ? 15 : 20}
        enableDamping
        dampingFactor={0.05}
        target={[0, 0, 0]}
      />
        {!isMobile && (
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

const WaterGraph3D = ({ data, searchQuery }: WaterGraph3DProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [hoveredThemeId, setHoveredThemeId] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<GraphNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const activeNodeRef = useRef<Object3D | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const cameraPosition = useMemo<[number, number, number]>(() => 
    isMobile ? [0, 0, 8] : [0, 0, 12],
    [isMobile]
  );

  const root = useMemo(() => data.find(n => n.name === "КГТУ"), [data]);
  const themes = useMemo(() => 
    data.filter(n => n.parentGraphId?.$oid === root?._id.$oid),
    [data, root]
  );

  // Обновляем ссылку на активный узел при изменении выбранной темы
  useEffect(() => {
    if (activeThemeId) {
      const activeTheme = themes.find(t => t._id.$oid === activeThemeId);
      if (activeTheme) {
        // Находим узел в сцене
        const findNode = (object: THREE.Object3D): THREE.Object3D | null => {
          if (object.userData?.themeId === activeThemeId) {
            return object;
          }
          for (const child of object.children) {
            const found = findNode(child);
            if (found) return found;
          }
          return null;
        };

        if (sceneRef.current) {
          const node = findNode(sceneRef.current);
          if (node) {
            activeNodeRef.current = node;
          }
        }
      }
    } else {
      activeNodeRef.current = null;
    }
  }, [activeThemeId, themes]);

  const handleThemeSelect = (theme: GraphNode | null) => {
    setSelectedTheme(theme);
    setActiveThemeId(theme?._id.$oid || null);
  };

  const handlePointerMissed = () => {
    setActiveThemeId(null);
    setSelectedTheme(null);
  };

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    handleResize();
    const debouncedResize = debounce(handleResize, 250);
    window.addEventListener('resize', debouncedResize);
    return () => window.removeEventListener('resize', debouncedResize);
  }, [handleResize]);

  if (!root) return null;

  return (
    <div ref={containerRef} className={styles.container}>
      {!isMobile && (
        <LeftPanel 
          data={data}
          onThemeSelect={handleThemeSelect}
          selectedTheme={selectedTheme}
        />
      )}
      <div className={styles.graphContainer}>
        <Canvas
          camera={{ 
            position: new THREE.Vector3(...cameraPosition),
            fov: isMobile ? 40 : 50 
          }}
          onPointerMissed={handlePointerMissed}
          style={{ width: '100%', height: '100%' }}
          onCreated={({ scene }) => {
            sceneRef.current = scene;
          }}
        >
          {/* Scene setup */}
          <color attach="background" args={['#1a1b3d']} />
          <fog attach="fog" args={['#1a1b3d', 12, 25]} />
          
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-5, -5, -5]} intensity={0.4} color="#a04fff" />
          
          {/* Effects */}
          <EffectComposer>
            <Bloom 
              luminanceThreshold={0.15}
              luminanceSmoothing={0.9}
              intensity={1.3}
            />
            {activeNodeRef.current ? (
              <Outline
                key={activeNodeRef.current.uuid}
                selection={[activeNodeRef.current]}
                edgeStrength={90}
                pulseSpeed={0.5}
                visibleEdgeColor={0x00ffff}
                hiddenEdgeColor={0x00ffff}
                blendFunction={BlendFunction.SCREEN}
              />
            ) : (
              <Outline
                selection={[]}
                edgeStrength={0}
                visibleEdgeColor={0x000000}
                hiddenEdgeColor={0x000000}
                blendFunction={BlendFunction.SCREEN}
              />
            )}
          </EffectComposer>

          {/* Stars background */}
          <Stars 
            radius={100}
            depth={50}
            count={4000}
            factor={1.8}
            fade
            speed={0.9}
          />

          {/* Camera Controller */}

          <CameraController activeNodeRef={activeNodeRef} isMobile={isMobile} />
   
        
          {/* Planet */}
          <Planet scale={activeThemeId 
            ? (isMobile ? 0.21 : 0.4) 
            : (isMobile ? 0.35 : 1)} 
          />

          {/* Theme nodes */}
          {themes.map((theme, i) => (
            <ThemeNode
              key={theme._id.$oid}
              theme={theme}
              index={i}
              total={themes.length}
              active={activeThemeId === theme._id.$oid}
              hovered={hoveredThemeId === theme._id.$oid}
              setActive={setActiveThemeId}
              setHovered={setHoveredThemeId}
              onThemeSelect={handleThemeSelect}
              data={data}
              isMobile={isMobile}
              anyActive={!!activeThemeId}
              scale={isMobile ? 0.85 : 1}
            />
          ))}
        </Canvas>
      </div>
      {isMobile && (
        <ThemeCards 
          data={data}
          onThemeSelect={handleThemeSelect}
          selectedTheme={selectedTheme}
        />
      )}
    </div>
  );
};

export default WaterGraph3D; 