import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Billboard, Html, Stars,useTexture, Sphere, MeshDistortMaterial, MeshWobbleMaterial, MeshReflectorMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Outline } from '@react-three/postprocessing';
import { useSpring, a, SpringValue } from '@react-spring/three';
import { animated } from '@react-spring/web';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import styles from './WaterGraph3D.module.scss';

// Types
interface GraphNode {
  _id: { $oid: string };
  name: string;
  imgPath?: string;
  parentGraphId?: { $oid: string };
  childGraphNum: number;
  ownerUserId: { $oid: string };
  subsNum: number;
  directorName?: string;
  directorVkLink?: string;
  vkLink?: string;
  emoji?: string; // Added for 3D visualization
}

interface WaterGraph3DProps {
  data: GraphNode[];
  searchQuery?: string;
}

// Theme configuration with emojis
const THEME_CONFIG: Record<string, string> = {
  "Наука и интеллект": "🎓",
  "Студенческое самоуправление": "👥",
  "Творчество": "🎨",
  "Спорт и туризм": "🎾",
  "Волонтерство и патриотизм": "❤️",
  "Медиа": "📰",
  "Студенческие отряды": "👷"
};

// Add media query hook
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Planet component with enhanced visuals
function Planet() {
  const mesh = useRef<THREE.Mesh>(null);
  const atmosphere = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  
  // Planet rotation animation
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
    <group>
      {/* Main planet sphere with distortion effect */}
      <mesh ref={mesh} castShadow receiveShadow>
        <sphereGeometry args={[1.8, 64, 64]} />
        <MeshDistortMaterial
          color="#3a1c6b"
          roughness={0.4}
          metalness={0.7}
          emissive="#a04fff"
          emissiveIntensity={0.3}
          distort={0.2}
          speed={2}
        />
      </mesh>

      {/* Atmosphere layer */}
      <mesh ref={atmosphere} scale={[1.22, 1.22, 1.22]}>
        <sphereGeometry args={[1.8, 32, 32]} />
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
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial
          color="#a04fff"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Surface details */}
      <mesh scale={[1.01, 1.01, 1.01]}>
        <sphereGeometry args={[1.8, 64, 64]} />
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

// Theme node component with meteor-like appearance
function ThemeNode({ 
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
}: { 
  theme: GraphNode;
  index: number;
  total: number;
  active: boolean;
  hovered: boolean;
  setActive: (id: string | null) => void;
  setHovered: (id: string | null) => void;
  onThemeSelect: (theme: GraphNode) => void;
  data: GraphNode[];
  isMobile: boolean;
  anyActive: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  
  // Adjust orbit radius and node scale for mobile
  const orbitRadius = useMemo(() => isMobile ? 2.8 : 3.5, [isMobile]);
  const nodeScale = useMemo(() => isMobile ? 0.35 : 0.45, [isMobile]);
  const childOrbitRadius = useMemo(() => isMobile ? 1.2 : 1.5, [isMobile]);
  const childNodeScale = useMemo(() => isMobile ? 0.18 : 0.22, [isMobile]);

  // Calculate position on the sphere with mobile adjustments
  const angle = (index / total) * Math.PI * 2;
  const x = Math.cos(angle) * orbitRadius;
  const y = Math.sin(angle) * orbitRadius;
  const z = isMobile ? 0.3 * Math.sin(angle * 2) : 0.5 * Math.sin(angle * 2);

  // Enhanced spring animations with inactive state
  const { scale, glow, opacity, groupScale, rotation } = useSpring({
    scale: active ? 1.3 : hovered ? 1.25 : 1,
    glow: active ? 2 : hovered ? 1.5 : 0.7,
    opacity: active ? 1 : anyActive ? 0.6 : 0.7,
    groupScale: active ? 1 : anyActive ? 0.85 : 1,
    rotation: active ? [0, Math.PI * 2, 0] : [0, 0, 0],
    config: { 
      tension: 300, 
      friction: 20,
      mass: 1
    }
  });

  // Animation for meteor trail
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
      if (trailRef.current) {
        trailRef.current.rotation.z += delta * 0.8;
      }
    }
  });

  // Get child nodes
  const children = useMemo(() => 
    data.filter(n => n.parentGraphId?.$oid === theme._id.$oid),
    [theme, data]
  );

  // Handle click with theme selection
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setActive(active ? null : theme._id.$oid);
    onThemeSelect(theme);
  };

  // Memoize material colors
  const activeColor = useMemo(() => new THREE.Color('#00ffff'), []);
  const defaultColor = useMemo(() => new THREE.Color('#ff4fd8'), []);

  return (
    <a.group 
      ref={groupRef}
      position={[x, y, z]}
      scale={groupScale}
      rotation={rotation}
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

      {/* Theme label with active state */}
      <Billboard position={[0, 0.8, 0]}>
        <Html center>
          <div className={`${styles.themeLabel} ${active ? styles.active : ''} ${anyActive && !active ? styles.inactive : ''}`}>
            <span className={styles.emoji}>{THEME_CONFIG[theme.name] || '✨'}</span>
            <span className={styles.labelText}>{theme.name}</span>
          </div>
        </Html>
      </Billboard>

      {/* Child nodes with enhanced visuals */}
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
            {/* Small meteor */}
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

            {/* Child meteor trail */}
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

            {/* Child label */}
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

// Left Panel Component
function LeftPanel({ 
  data, 
  onThemeSelect, 
  selectedTheme 
}: { 
  data: GraphNode[];
  onThemeSelect: (theme: GraphNode | null) => void;
  selectedTheme: GraphNode | null;
}) {
  const root = useMemo(() => data.find(n => n.name === "КГТУ"), [data]);
  const themes = useMemo(() => 
    data.filter(n => n.parentGraphId?.$oid === root?._id.$oid),
    [data, root]
  );

  const subgraphs = useMemo(() => 
    selectedTheme ? data.filter(n => n.parentGraphId?.$oid === selectedTheme._id.$oid) : [],
    [data, selectedTheme]
  );

  // Add hover state for theme blocks
  const [hoveredThemeId, setHoveredThemeId] = useState<string | null>(null);

  // Add animation for theme count
  const themeCount = useMemo(() => themes.length, [themes]);
  const subgraphCount = useMemo(() => subgraphs.length, [subgraphs]);

  if (!root || !themes.length) {
    return null;
  }

  return (
    <div className={styles.leftPanel}>
      <div className={styles.panelContent}>
        <h1 className={styles.title}>
          Планета – КГТУ
          <span className={styles.themeCount}>
            {themeCount} {themeCount === 1 ? 'спутник' : themeCount < 5 ? 'спутника' : 'спутников'}
          </span>
        </h1>
        
        <h2 className={styles.subtitle}>
          {selectedTheme ? (
            <>
              <span className={styles.emoji}>{THEME_CONFIG[selectedTheme.name] || '✨'}</span>
              {selectedTheme.name}
              <span className={styles.subgraphCount}>
                {subgraphCount} {subgraphCount === 1 ? 'подспутник' : subgraphCount < 5 ? 'подспутника' : 'подспутников'}
              </span>
            </>
          ) : (
            'Изученные спутники'
          )}
        </h2>
        
        {!selectedTheme ? (
          <div className={styles.themeBlocks}>
            {themes.map((theme) => (
              <div
                key={theme._id.$oid}
                className={`${styles.themeBlock} ${selectedTheme?._id.$oid === theme._id.$oid ? styles.active : ''}`}
                onClick={() => onThemeSelect(theme)}
                onMouseEnter={() => setHoveredThemeId(theme._id.$oid)}
                onMouseLeave={() => setHoveredThemeId(null)}
              >
                <span className={styles.emoji}>{THEME_CONFIG[theme.name] || '✨'}</span>
                <div className={styles.themeInfo}>
                  <span className={styles.themeName}>{theme.name}</span>
                  {theme.childGraphNum > 0 && (
                    <span className={styles.childCount}>
                      {theme.childGraphNum} {theme.childGraphNum === 1 ? 'подспутник' : theme.childGraphNum < 5 ? 'подспутника' : 'подспутников'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.subgraphBlocks}>
            <button 
              className={styles.backButton}
              onClick={() => onThemeSelect(null)}
              aria-label="Вернуться к темам"
            >
              Назад к темам
            </button>
            
            {subgraphs.length > 0 ? (
              subgraphs.map((subgraph) => (
                <div
                  key={subgraph._id.$oid}
                  className={styles.subgraphBlock}
                  onClick={() => {
                    // Можно добавить дополнительную функциональность при клике на подспутник
                    console.log('Selected subgraph:', subgraph);
                  }}
                >
                  <div className={styles.subgraphInfo}>
                    <span className={styles.subgraphName}>{subgraph.name}</span>
                    {subgraph.directorName && (
                      <span className={styles.directorName}>
                        {subgraph.directorName}
                      </span>
                    )}
                  </div>
                  {subgraph.vkLink && (
                    <a 
                      href={subgraph.vkLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.vkLink}
                      onClick={(e) => e.stopPropagation()}
                    >
                      VK
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                У этого спутника пока нет подспутников
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Main component with responsive handling
const WaterGraph3D = ({ data, searchQuery }: WaterGraph3DProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [hoveredThemeId, setHoveredThemeId] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<GraphNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const activeNodeRef = useRef<THREE.Object3D | null>(null);

  // Adjust camera position for mobile
  const cameraPosition = useMemo(() => 
    isMobile ? [0, 0, 10] : [0, 0, 12],
    [isMobile]
  );

  // Find root and theme nodes
  const root = useMemo(() => data.find(n => n.name === "КГТУ"), [data]);
  const themes = useMemo(() => 
    data.filter(n => n.parentGraphId?.$oid === root?._id.$oid),
    [data, root]
  );

  // Update active node ref when theme changes
  useEffect(() => {
    if (activeThemeId) {
      const activeTheme = themes.find(t => t._id.$oid === activeThemeId);
      if (activeTheme) {
        // Find the corresponding 3D object
        const scene = document.querySelector('canvas')?.__r3f?.scene;
        if (scene) {
          scene.traverse((object) => {
            if (object.userData?.themeId === activeThemeId) {
              activeNodeRef.current = object;
            }
          });
        }
      }
    } else {
      activeNodeRef.current = null;
    }
  }, [activeThemeId, themes]);

  // Handle theme selection from both sources
  const handleThemeSelect = (theme: GraphNode | null) => {
    setSelectedTheme(theme);
    setActiveThemeId(theme?._id.$oid || null);
  };

  // Handle click outside
  const handlePointerMissed = () => {
    setActiveThemeId(null);
    setSelectedTheme(null);
  };

  // Handle window resize with debounce
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
      <LeftPanel 
        data={data}
        onThemeSelect={handleThemeSelect}
        selectedTheme={selectedTheme}
      />
      <div className={styles.graphContainer}>
        <Canvas
          camera={{ 
            position: cameraPosition,
            fov: isMobile ? 45 : 50 
          }}
          onPointerMissed={handlePointerMissed}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Scene setup */}
          <color attach="background" args={['#1a1b3d']} />
          <fog attach="fog" args={['#1a1b3d', 15, 30]} />
          
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
            {activeNodeRef.current && (
              <Outline
                selection={[activeNodeRef.current]}
                edgeStrength={90}
                pulseSpeed={0.5}
                visibleEdgeColor={0x00ffff}
                hiddenEdgeColor={0x00ffff}
                blurPass={{
                  enabled: true,
                  resolutionScale: 1.0,
                  blurSize: 1.0
                }}
              />
            )}
          </EffectComposer>

          {/* Stars background with adjusted intensity */}
          <Stars 
            radius={100}
            depth={50}
            count={4000}
            factor={1.8}
            fade
            speed={0.9}
          />

          {/* Controls */}
          <OrbitControls
            enablePan={false}
            minDistance={8}
            maxDistance={20}
            enableDamping
            dampingFactor={0.05}
          />

          {/* Planet */}
          <Planet />

          {/* Theme nodes with mobile prop */}
          {themes.map((theme: GraphNode, i: number) => (
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
            />
          ))}
        </Canvas>
      </div>
    </div>
  );
};

// Debounce helper
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default WaterGraph3D; 