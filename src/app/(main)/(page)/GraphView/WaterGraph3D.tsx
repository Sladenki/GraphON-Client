import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Billboard, Html, Stars,useTexture } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useSpring, a } from '@react-spring/three';
import { useState, useRef, useEffect, useMemo } from 'react';
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
  data 
}: { 
  theme: GraphNode;
  index: number;
  total: number;
  active: boolean;
  hovered: boolean;
  setActive: (id: string | null) => void;
  setHovered: (id: string | null) => void;
  data: GraphNode[];
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Calculate position on the sphere
  const angle = (index / total) * Math.PI * 2;
  const r = 3.5;
  const x = Math.cos(angle) * r;
  const y = Math.sin(angle) * r;
  const z = 0.5 * Math.sin(angle * 2);

  // Spring animations
  const { scale, glow, opacity } = useSpring({
    scale: hovered || active ? 1.25 : 1,
    glow: hovered || active ? 1.5 : 0.7,
    opacity: active ? 1 : 0.7,
    config: { tension: 300, friction: 20 }
  });

  // Get child nodes
  const children = useMemo(() => 
    data.filter(n => n.parentGraphId?.$oid === theme._id.$oid),
    [theme, data]
  );

  // Orbit radius for child nodes
  const orbitR = 1.5;

  return (
    <group 
      ref={groupRef}
      position={[x, y, z]}
      onPointerOver={() => setHovered(theme._id.$oid)}
      onPointerOut={() => setHovered(null)}
      onClick={(e) => {
        e.stopPropagation();
        setActive(active ? null : theme._id.$oid);
      }}
    >
      {/* Theme node sphere */}
      <a.mesh scale={scale}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial
          color="#ff4fd8"
          emissive="#ff4fd8"
          emissiveIntensity={glow}
          roughness={0.3}
          metalness={0.8}
        />
      </a.mesh>

      {/* Glow effect */}
      <a.mesh scale={scale}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          color="#ff4fd8"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </a.mesh>

      {/* Theme label */}
      <Billboard position={[0, 0.8, 0]}>
        <Html center>
          <div className={styles.themeLabel}>
            <span className={styles.emoji}>{THEME_CONFIG[theme.name] || '✨'}</span>
            <span className={styles.labelText}>{theme.name}</span>
          </div>
        </Html>
      </Billboard>

      {/* Child nodes */}
      {active && children.map((child, i) => {
        const childAngle = (i / children.length) * Math.PI * 2;
        const cx = Math.cos(childAngle) * orbitR;
        const cy = Math.sin(childAngle) * orbitR;
        
        return (
          <a.group
            key={child._id.$oid}
            position={[cx, cy, 0]}
            scale={scale}
          >
            {/* Child node sphere */}
            <mesh>
              <sphereGeometry args={[0.22, 24, 24]} />
              <meshStandardMaterial
                color="#fff"
                emissive="#ff4fd8"
                emissiveIntensity={1.2}
                roughness={0.2}
                metalness={0.7}
              />
            </mesh>

            {/* Child node glow */}
            <mesh>
              <sphereGeometry args={[0.25, 24, 24]} />
              <meshBasicMaterial
                color="#ff4fd8"
                transparent
                opacity={0.3}
                side={THREE.BackSide}
              />
            </mesh>

            {/* Child label */}
            <Billboard position={[0, 0.4, 0]}>
              <Html center>
                <div className={styles.childLabel}>
                  <span className={styles.labelText}>{child.name}</span>
                </div>
              </Html>
            </Billboard>
          </a.group>
        );
      })}
    </group>
  );
}

// Main component
const WaterGraph3D = ({ data, searchQuery }: WaterGraph3DProps) => {
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [hoveredThemeId, setHoveredThemeId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Find root and theme nodes
  const root = useMemo(() => data.find(n => n.name === "КГТУ"), [data]);
  const themes = useMemo(() => 
    data.filter(n => n.parentGraphId?.$oid === root?._id.$oid),
    [data, root]
  );

  // Handle click outside
  const handlePointerMissed = () => {
    setActiveThemeId(null);
  };

  if (!root) return null;

  return (
    <div ref={containerRef} className={styles.container}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
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
            data={data}
          />
        ))}
      </Canvas>
    </div>
  );
};

export default WaterGraph3D; 