'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Outline } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { Object3D } from 'three';
import { WaterGraph3DProps, GraphNode } from './types';
import { useMediaQuery, useDeviceType, debounce } from './hooks';
import { Planet } from './Planet';

import { ThemeCards } from './ThemeCards/ThemeCards';
import { CameraController } from './camera/CameraController';
import { useQuery } from '@tanstack/react-query';
import { GraphService } from '@/services/graph.service';
import SubgraphPopUp from './SubgraphPopUp/SubgraphPopUp';
import styles from './WaterGraph3D.module.scss';
import { LeftPanel } from './LeftPanel/LeftPanel';
import { ThemeNode } from './ThemeNode/ThemeNode';

// Add interface for the API response data
interface SubgraphData {
  _id: string;
  name: string;
  directorName?: string;
  directorVkLink?: string;
  vkLink?: string;
  ownerUserId: string;
  subsNum: number;
  childGraphNum: number;
  imgPath?: string;
  parentGraphId: string;
  graphType: string;
  globalGraphId: string;
}

const WaterGraph3D = ({ data, searchQuery }: WaterGraph3DProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const deviceType = useDeviceType();
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [hoveredThemeId, setHoveredThemeId] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<GraphNode | null>(null);
  const [selectedSubgraph, setSelectedSubgraph] = useState<GraphNode | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const activeNodeRef = useRef<Object3D | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  // Fetch subgraphs when a theme is selected
  const { data: subgraphsData } = useQuery<SubgraphData[]>({
    queryKey: ['subgraphs', selectedTheme?._id.$oid],
    queryFn: async () => {
      const response = await GraphService.getAllChildrenByTopic(selectedTheme?._id.$oid as string);
      return response.data;
    },
    enabled: !!selectedTheme?._id.$oid,
  });

  // Transform and combine data with fetched subgraphs
  const combinedData = useMemo(() => {
    if (!subgraphsData || !selectedTheme) return data;
    
    // Transform the subgraphs data to match our expected format
    const transformedSubgraphs = subgraphsData.map((subgraph: SubgraphData) => ({
      ...subgraph,
      _id: { $oid: subgraph._id },
      ownerUserId: { $oid: subgraph.ownerUserId },
      parentGraphId: { $oid: subgraph.parentGraphId },
      globalGraphId: { $oid: subgraph.globalGraphId },
      graphType: subgraph.graphType === 'default' ? 'topic' : subgraph.graphType as 'global' | 'topic'
    }));

    return [...data, ...transformedSubgraphs] as GraphNode[];
  }, [data, subgraphsData, selectedTheme]);

  const cameraPosition = useMemo<[number, number, number]>(() => {
    if (deviceType.isSmallIPhone) return [0, 0, 9];
    if (deviceType.isIPhone) return [0, 0, 10];
    if (isMobile) return [0, 0, 8];
    return [0, 0, 12];
  }, [isMobile, deviceType]);

  const root = useMemo(() => data.find(n => n.graphType === 'global'), [data]);
  const themes = useMemo(() => 
    data.filter(n => n.graphType === 'topic'),
    [data]
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

  // Отслеживаем состояние MobileNav через MutationObserver
  useEffect(() => {
    if (!isMobile) return;

    const observer = new MutationObserver(() => {
      // Проверяем наличие backdrop элемента MobileNav
      const backdrop = document.querySelector('[class*="backdrop"]');
      const sidebar = document.querySelector('[class*="sidebar"][class*="sidebarOpen"]');
      setIsMobileNavOpen(!!(backdrop || sidebar));
    });

    // Наблюдаем за изменениями в DOM
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [isMobile]);

  const handleSubgraphSelect = (subgraph: GraphNode) => {
    setSelectedSubgraph(subgraph);
  };

  if (!root) return null;

  return (
    <div ref={containerRef} className={styles.container}>
      {!isMobile && (
        <LeftPanel 
          data={combinedData}
          onThemeSelect={handleThemeSelect}
          selectedTheme={selectedTheme}
          onSubgraphSelect={handleSubgraphSelect}
        />
      )}
      <div className={`${styles.graphContainer} ${isMobileNavOpen ? styles.navOpen : ''}`}>
        <Canvas
          camera={{ 
            position: new THREE.Vector3(...cameraPosition),
            fov: deviceType.isSmallIPhone ? 42 : (deviceType.isIPhone ? 45 : (isMobile ? 40 : 50))
          }}
          onPointerMissed={handlePointerMissed}
          style={{ 
            width: '100%', 
            height: '100%',
            ...(isMobile && { 
              marginTop: deviceType.isIPhone 
                ? (deviceType.isSmallIPhone ? '-10px' : '-15px') // Менее агрессивное смещение для iPhone
                : '-170px' // Сохраняем исходное значение для других мобильных
            })
          }}
          onCreated={({ scene, gl, camera }) => {
            sceneRef.current = scene;
            if (isMobile) {
              gl.setPixelRatio(Math.min(window.devicePixelRatio, deviceType.isIPhone ? 2 : 2));
              gl.shadowMap.enabled = false;
              
              // Убираем принудительное изменение aspect ratio для iPhone
              // Позволяем Three.js автоматически рассчитывать пропорции
            }
          }}
          dpr={deviceType.isIPhone ? [1, 2] : (isMobile ? [1, 2] : [1, 2])}
          performance={{ min: deviceType.isIPhone ? 0.7 : 0.5 }}
        >
          {/* Scene setup */}
          <color attach="background" args={['#0a0a1a']} />
          <fog attach="fog" args={['#0a0a1a', isMobile ? 8 : 12, isMobile ? 20 : 25]} />
          
          {/* Lighting */}
          <ambientLight intensity={isMobile ? 0.4 : 0.5} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={isMobile ? 1.2 : 1.5} 
            color="#ffffff"
            castShadow
          />
          <directionalLight 
            position={[-5, -5, -5]} 
            intensity={0.3} 
            color="#4fc3f7"
          />
          <pointLight position={[0, 0, 10]} intensity={0.2} color="#ffffff" />
          
          {/* Effects */}
          {!isMobile && (
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
          )}

          {/* Stars background */}
          <Stars 
            radius={isMobile ? 100 : 150}
            depth={isMobile ? 50 : 80}
            count={isMobile ? 3000 : 5000}
            factor={isMobile ? 2 : 2.5}
            fade
            speed={isMobile ? 0.3 : 0.4}
            saturation={0.8}
          />

          {/* Camera Controller */}
          <CameraController activeNodeRef={activeNodeRef} isMobile={isMobile} />
   
          {/* Planet */}

            <Planet scale={activeThemeId 
              ? (isMobile ? 0.15 : 0.4) 
              : (isMobile ? 0.22 : 1)} 
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
                data={combinedData}
                isMobile={isMobile}
                anyActive={!!activeThemeId}
                scale={isMobile ? 0.5 : 1}
              />
            ))}
 


        </Canvas>
      </div>
      {isMobile && (
        <ThemeCards 
          data={combinedData}
          onThemeSelect={handleThemeSelect}
          selectedTheme={selectedTheme}
          onSubgraphSelect={handleSubgraphSelect}
        />
      )}
      <SubgraphPopUp 
        subgraph={selectedSubgraph}
        onClose={() => setSelectedSubgraph(null)}
      />
    </div>
  );
};

export default WaterGraph3D; 