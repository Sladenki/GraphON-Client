'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
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
import { CameraController } from './camera/CameraController';
import styles from './styles.module.scss';

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