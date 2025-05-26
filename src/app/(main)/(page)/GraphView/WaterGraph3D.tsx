import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Billboard, Html, Stars,useTexture } from '@react-three/drei';
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

// Planet component
function Planet() {
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  
  // Planet rotation animation
  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.y += delta * 0.08;
  });

  return (
    <group>
      <mesh ref={mesh} castShadow receiveShadow>
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshStandardMaterial
          color="#3a1c6b"
          roughness={0.4}
          metalness={0.7}
          emissive="#a04fff"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh scale={[1.22, 1.22, 1.22]}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial
          color="#a04fff"
          transparent
          opacity={0.13}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// Theme node component
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
  const { scale, glow, opacity, groupScale } = useSpring({
    scale: active ? 1.3 : hovered ? 1.25 : 1,
    glow: active ? 2 : hovered ? 1.5 : 0.7,
    opacity: active ? 1 : anyActive ? 0.6 : 0.7,
    groupScale: active ? 1 : anyActive ? 0.85 : 1,
    config: { 
      tension: 300, 
      friction: 20,
      mass: 1
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
      onPointerOver={() => setHovered(theme._id.$oid)}
      onPointerOut={() => setHovered(null)}
      onClick={handleClick}
      userData={{ themeId: theme._id.$oid }}
    >
      {/* Theme node sphere with mobile scaling */}
      <a.mesh ref={meshRef} scale={scale}>
        <sphereGeometry args={[nodeScale, 32, 32]} />
        <meshStandardMaterial
          color={active ? activeColor : defaultColor}
          emissive={active ? activeColor : defaultColor}
          emissiveIntensity={glow.get()}
          roughness={active ? 0.2 : 0.3}
          metalness={active ? 0.9 : 0.8}
          transparent
          opacity={opacity.get()}
        />
      </a.mesh>

      {/* Enhanced glow effect for active state */}
      <a.mesh scale={scale}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          color={active ? activeColor : defaultColor}
          transparent
          opacity={active ? 0.4 : 0.3}
          side={THREE.BackSide}
        />
      </a.mesh>

      {/* Active state outer glow */}
      {active && (
        <a.mesh scale={scale}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshBasicMaterial
            color={activeColor}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </a.mesh>
      )}

      {/* Theme label with active state */}
      <Billboard position={[0, 0.8, 0]}>
        <Html center>
          <div className={`${styles.themeLabel} ${active ? styles.active : ''} ${anyActive && !active ? styles.inactive : ''}`}>
            <span className={styles.emoji}>{THEME_CONFIG[theme.name] || '✨'}</span>
            <span className={styles.labelText}>{theme.name}</span>
          </div>
        </Html>
      </Billboard>

      {/* Child nodes with mobile scaling */}
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
              <sphereGeometry args={[childNodeScale, 24, 24]} />
              <meshStandardMaterial
                color={activeColor}
                emissive={activeColor}
                emissiveIntensity={1.5}
                roughness={0.2}
                metalness={0.8}
                transparent
                opacity={opacity.get()}
              />
            </mesh>

            {/* Enhanced child node glow */}
            <mesh>
              <sphereGeometry args={[0.25, 24, 24]} />
              <meshBasicMaterial
                color={activeColor}
                transparent
                opacity={0.4}
                side={THREE.BackSide}
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

  // Remove animations for desktop version
  const themeBlocks = useSpring({
    from: { opacity: 1, transform: 'none' },
    to: { opacity: 1, transform: 'none' },
    config: { tension: 300, friction: 20 }
  });

  const subgraphBlocks = useSpring({
    from: { opacity: 1, transform: 'none' },
    to: { opacity: 1, transform: 'none' },
    config: { tension: 300, friction: 20 }
  });

  if (!root || !themes.length) {
    return null;
  }

  return (
    <div className={styles.leftPanel}>
      <div className={styles.panelContent}>
        <h1 className={styles.title}>Планета – КГТУ</h1>
        <h2 className={styles.subtitle}>Изученные спутники</h2>
        
        {!selectedTheme ? (
          <animated.div style={themeBlocks} className={styles.themeBlocks}>
            {themes.map((theme) => (
              <div
                key={theme._id.$oid}
                className={`${styles.themeBlock} ${selectedTheme?._id.$oid === theme._id.$oid ? styles.active : ''}`}
                onClick={() => onThemeSelect(theme)}
              >
                <span className={styles.emoji}>{THEME_CONFIG[theme.name] || '✨'}</span>
                <span className={styles.themeName}>{theme.name}</span>
              </div>
            ))}
          </animated.div>
        ) : (
          <animated.div style={subgraphBlocks} className={styles.subgraphBlocks}>
            <button 
              className={styles.backButton}
              onClick={() => onThemeSelect(null)}
            >
              ← Назад к темам
            </button>
            <h3 className={styles.subgraphTitle}>
              {THEME_CONFIG[selectedTheme.name]} {selectedTheme.name}
            </h3>
            {subgraphs.map((subgraph) => (
              <div
                key={subgraph._id.$oid}
                className={styles.subgraphBlock}
              >
                <span className={styles.subgraphName}>{subgraph.name}</span>
                {subgraph.directorName && (
                  <span className={styles.directorName}>
                    Руководитель: {subgraph.directorName}
                  </span>
                )}
              </div>
            ))}
          </animated.div>
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
          <color attach="background" args={['#0a0020']} />
          <fog attach="fog" args={['#0a0020', 15, 30]} />
          
          {/* Lighting */}
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <pointLight position={[-5, -5, -5]} intensity={0.5} color="#ff4fd8" />
          
          {/* Effects */}
          <EffectComposer>
            <Bloom 
              luminanceThreshold={0.1}
              luminanceSmoothing={0.9}
              intensity={1.5}
            />
            {activeNodeRef.current && (
              <Outline
                selection={[activeNodeRef.current]}
                edgeStrength={100}
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

          {/* Stars background */}
          <Stars 
            radius={100}
            depth={50}
            count={5000}
            factor={2}
            fade
            speed={1}
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