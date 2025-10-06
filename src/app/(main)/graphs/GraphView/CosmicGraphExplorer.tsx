'use client'

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Html, useTexture } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { useAuth } from '@/providers/AuthProvider';
import { GraphService } from '@/services/graph.service';
import { useQuery } from '@tanstack/react-query';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { useSearchQuery, useSelectedGraphId, useSetSelectedGraphId } from '@/stores/useUIStore';
import { Search, Filter, Grid, List, Star, Users, Calendar, BookOpen, Code, Music, Camera, Gamepad2, Heart, GraduationCap, MapPin, Orbit, Zap, Eye, Compass, Type } from 'lucide-react';
import styles from './CosmicGraphExplorer.module.scss';

interface GraphResponse {
  globalGraph: {
    _id: string;
    name: string;
    ownerUserId: string;
    subsNum: number;
    childGraphNum: number;
    imgPath?: string;
    graphType: 'global';
    city: string;
  };
  topicGraphs: Array<{
    _id: string;
    name: string;
    ownerUserId: string;
    subsNum: number;
    childGraphNum: number;
    imgPath?: string;
    parentGraphId: string;
    graphType: 'topic';
  }>;
}

interface CosmicNode {
  id: string;
  name: string;
  subsNum: number;
  childGraphNum: number;
  imgPath?: string;
  icon: React.ReactNode;
  color: string;
  planetType: 'gas' | 'rocky' | 'ice' | 'dwarf';
  size: number;
  orbitRadius: number;
  temperature: number;
  atmosphere: string;
  position: { x: number; y: number; z: number };
}

const CosmicGraphExplorer: React.FC = () => {
  const { user } = useAuth();
  const isInitialized = useRef(false);
  
  // Zustand store
  const searchQuery = useSearchQuery();
  const selectedGraphId = useSelectedGraphId();
  const setSelectedGraphId = useSetSelectedGraphId();

  // Состояния
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'solar' | 'galaxy' | 'constellation'>('solar');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [cameraPosition, setCameraPosition] = useState<'overview' | 'close' | 'orbit'>('overview');
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [explorationMode, setExplorationMode] = useState(false);

  // Блокируем скролл
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Инициализация selectedGraphId
  useEffect(() => {
    const rawSelected = user?.selectedGraphId as any;
    const normalizedId =
      typeof rawSelected === 'object' && rawSelected?._id
        ? (rawSelected._id as string)
        : typeof rawSelected === 'string'
          ? rawSelected
          : null;

    if (normalizedId && normalizedId !== selectedGraphId && !isInitialized.current) {
      setSelectedGraphId(normalizedId);
      isInitialized.current = true;
    }
  }, [user?.selectedGraphId, selectedGraphId, setSelectedGraphId]);

  // Загрузка данных
  const { data, isLoading, error } = useQuery<GraphResponse>({
    queryKey: ['graphWithTopics', selectedGraphId],
    queryFn: async () => {
      if (!selectedGraphId) return { globalGraph: null, topicGraphs: [] };
      const response = await GraphService.getTopicGraphsWithGlobal(selectedGraphId);
      return response.data;
    },
    enabled: !!selectedGraphId
  });

  // Конфигурация космических объектов
  const COSMIC_CONFIG: Record<string, { 
    icon: React.ReactNode; 
    color: string; 
    planetType: 'gas' | 'rocky' | 'ice' | 'dwarf';
    size: number;
    temperature: number;
    atmosphere: string;
  }> = {
    "Наука": { 
      icon: <GraduationCap size={16} />, 
      color: "#4A90E2", 
      planetType: 'rocky',
      size: 1.2,
      temperature: 15,
      atmosphere: 'Азот-кислородная'
    },
    "Самоуправление": { 
      icon: <Users size={16} />, 
      color: "#10B981", 
      planetType: 'gas',
      size: 1.5,
      temperature: -50,
      atmosphere: 'Водород-гелиевая'
    },
    "Творчество": { 
      icon: <Music size={16} />, 
      color: "#F59E0B", 
      planetType: 'rocky',
      size: 0.9,
      temperature: 25,
      atmosphere: 'Углекислотная'
    },
    "Спорт": { 
      icon: <Heart size={16} />, 
      color: "#EF4444", 
      planetType: 'rocky',
      size: 1.1,
      temperature: 20,
      atmosphere: 'Азот-кислородная'
    },
    "Волонтерство": { 
      icon: <Heart size={16} />, 
      color: "#8B5CF6", 
      planetType: 'ice',
      size: 0.8,
      temperature: -100,
      atmosphere: 'Метановая'
    },
    "Волонтёрство": { 
      icon: <Heart size={16} />, 
      color: "#8B5CF6", 
      planetType: 'ice',
      size: 0.8,
      temperature: -100,
      atmosphere: 'Метановая'
    },
    "Медиа": { 
      icon: <Camera size={16} />, 
      color: "#06B6D4", 
      planetType: 'gas',
      size: 1.3,
      temperature: -30,
      atmosphere: 'Водород-гелиевая'
    },
    "Отряды": { 
      icon: <Users size={16} />, 
      color: "#84CC16", 
      planetType: 'rocky',
      size: 1.0,
      temperature: 18,
      atmosphere: 'Азот-кислородная'
    },
    "Литература": { 
      icon: <BookOpen size={16} />, 
      color: "#F97316", 
      planetType: 'rocky',
      size: 0.95,
      temperature: 22,
      atmosphere: 'Азот-кислородная'
    },
    "Трудоустройство": { 
      icon: <Code size={16} />, 
      color: "#EC4899", 
      planetType: 'dwarf',
      size: 0.7,
      temperature: 10,
      atmosphere: 'Разреженная'
    },
    "Военно-патриотизм": { 
      icon: <Star size={16} />, 
      color: "#6366F1", 
      planetType: 'rocky',
      size: 1.4,
      temperature: 5,
      atmosphere: 'Азот-кислородная'
    }
  };

  // Создание космических узлов
  const cosmicNodes = useMemo(() => {
    if (!data?.topicGraphs) return [];

    return data.topicGraphs.map((topic, index) => {
      const config = COSMIC_CONFIG[topic.name] || COSMIC_CONFIG["Наука"];
      const angle = (index / data.topicGraphs.length) * Math.PI * 2;
      const orbitRadius = 3 + (index * 0.3); // Разные орбиты
      
      return {
        id: topic._id,
        name: topic.name,
        subsNum: topic.subsNum,
        childGraphNum: topic.childGraphNum,
        imgPath: topic.imgPath,
        icon: config.icon,
        color: config.color,
        planetType: config.planetType,
        size: config.size,
        orbitRadius: orbitRadius,
        temperature: config.temperature,
        atmosphere: config.atmosphere,
        position: {
          x: Math.cos(angle) * orbitRadius,
          y: Math.sin(angle) * orbitRadius,
          z: Math.sin(angle * 2) * 0.5
        }
      } as CosmicNode;
    });
  }, [data?.topicGraphs]);

  // Фильтрация планет
  const filteredPlanets = useMemo(() => {
    let filtered = cosmicNodes;

    // Поиск по названию
    if (searchTerm) {
      filtered = filtered.filter(planet => 
        planet.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фильтр по типу планеты
    if (filterType !== 'all') {
      filtered = filtered.filter(planet => planet.planetType === filterType);
    }

    return filtered;
  }, [cosmicNodes, searchTerm, filterType]);

  // Обработчики
  const handlePlanetClick = useCallback((planetId: string) => {
    setSelectedPlanet(planetId === selectedPlanet ? null : planetId);
    setExplorationMode(true);
  }, [selectedPlanet]);

  const handleViewModeChange = useCallback((mode: 'solar' | 'galaxy' | 'constellation') => {
    setViewMode(mode);
    setSelectedPlanet(null);
    setExplorationMode(false);
  }, []);

  if (isLoading) return <SpinnerLoader />;
  if (error) return <div>Ошибка при загрузке данных</div>;
  if (!isLoading && data?.globalGraph === null) {
    return <div>Нет данных для отображения</div>;
  }

  if (!data) return null;

  // Компонент космической планеты (внутри Canvas)
  const CosmicPlanet: React.FC<{
    planet: CosmicNode;
    selected: boolean;
    hovered: boolean;
    showOrbits: boolean;
    showLabels: boolean;
    onPlanetClick: (id: string) => void;
    onPlanetHover: (id: string | null) => void;
    animationSpeed: number;
  }> = ({ planet, selected, hovered, showOrbits, showLabels, onPlanetClick, onPlanetHover, animationSpeed }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const orbitRef = useRef<THREE.Mesh>(null);

    // Анимации
    const { scale, glow } = useSpring({
      scale: selected ? 1.5 : hovered ? 1.2 : 1,
      glow: selected ? 2 : hovered ? 1.5 : 1,
      config: { tension: 300, friction: 30 }
    });

    // Анимация вращения
    useFrame((_, delta) => {
      if (meshRef.current) {
        meshRef.current.rotation.y += delta * animationSpeed * 0.5;
      }
      if (orbitRef.current) {
        orbitRef.current.rotation.z += delta * animationSpeed * 0.1;
      }
    });

    return (
      <group position={[planet.position.x, planet.position.y, planet.position.z]}>
        {/* Орбита */}
        {showOrbits && (
          <mesh ref={orbitRef} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[planet.orbitRadius - 0.1, planet.orbitRadius + 0.1, 64]} />
            <meshBasicMaterial
              color={planet.color}
              transparent
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Планета */}
        <a.mesh 
          ref={meshRef}
          scale={scale}
          onClick={() => onPlanetClick(planet.id)}
          onPointerOver={() => onPlanetHover(planet.id)}
          onPointerOut={() => onPlanetHover(null)}
        >
          <sphereGeometry args={[planet.size, 32, 16]} />
          <meshPhongMaterial
            color={planet.color}
            emissive={planet.color}
            emissiveIntensity={glow.get() * 0.3}
            shininess={100}
            transparent
            opacity={0.9}
          />
        </a.mesh>

        {/* Атмосфера */}
        <a.mesh scale={[scale.get() * 1.2, scale.get() * 1.2, scale.get() * 1.2]}>
          <sphereGeometry args={[planet.size, 16, 8]} />
          <meshPhongMaterial
            color={planet.color}
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </a.mesh>

        {/* Подпись */}
        {showLabels && (
          <Html center>
            <div className={styles.planetLabel}>
              <span className={styles.planetName}>{planet.name}</span>
              <span className={styles.planetType}>{planet.planetType}</span>
            </div>
          </Html>
        )}
      </group>
    );
  };

  return (
    <div className={styles.cosmicExplorer}>
      {/* Космическая панель управления */}
      <div className={styles.cosmicControlPanel}>
        <div className={styles.explorerHeader}>
          <div className={styles.starSystemTitle}>
            <Star size={24} />
            <h2>Система {data.globalGraph.name}</h2>
            <span className={styles.systemStats}>
              {cosmicNodes.length} планет • {data.globalGraph.subsNum} жителей
            </span>
          </div>
          
          <div className={styles.explorationMode}>
            <button
              className={`${styles.modeButton} ${explorationMode ? styles.active : ''}`}
              onClick={() => setExplorationMode(!explorationMode)}
            >
              <Eye size={16} />
              Режим исследования
            </button>
          </div>
        </div>

        <div className={styles.cosmicControls}>
          <div className={styles.searchSection}>
            <div className={styles.cosmicSearch}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Поиск планет..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className={styles.cosmicFilters}>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className={styles.planetTypeFilter}
              >
                <option value="all">Все типы планет</option>
                <option value="rocky">Каменные планеты</option>
                <option value="gas">Газовые гиганты</option>
                <option value="ice">Ледяные миры</option>
                <option value="dwarf">Карликовые планеты</option>
              </select>
            </div>
          </div>

          <div className={styles.viewControls}>
            <div className={styles.viewModeButtons}>
              <button
                className={`${styles.viewButton} ${viewMode === 'solar' ? styles.active : ''}`}
                onClick={() => handleViewModeChange('solar')}
              >
                <Orbit size={16} />
                Солнечная система
              </button>
              <button
                className={`${styles.viewButton} ${viewMode === 'galaxy' ? styles.active : ''}`}
                onClick={() => handleViewModeChange('galaxy')}
              >
                <Grid size={16} />
                Галактический вид
              </button>
              <button
                className={`${styles.viewButton} ${viewMode === 'constellation' ? styles.active : ''}`}
                onClick={() => handleViewModeChange('constellation')}
              >
                <Compass size={16} />
                Созвездия
              </button>
            </div>

            <div className={styles.displayOptions}>
              <button
                className={`${styles.optionButton} ${showOrbits ? styles.active : ''}`}
                onClick={() => setShowOrbits(!showOrbits)}
              >
                <Orbit size={14} />
                Орбиты
              </button>
              <button
                className={`${styles.optionButton} ${showLabels ? styles.active : ''}`}
                onClick={() => setShowLabels(!showLabels)}
              >
                <Type size={14} />
                Подписи
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Космическая область */}
      <div className={styles.cosmicSpace}>
        <Canvas
          camera={{ 
            position: new THREE.Vector3(0, 0, 15),
            fov: 50
          }}
          style={{ 
            width: '100%', 
            height: '100%'
          }}
        >
          {/* Космический фон */}
          <color attach="background" args={['#0a0a1a']} />
          <fog attach="fog" args={['#0a0a1a', 10, 30]} />
          
          {/* Звездное поле */}
          <Stars 
            radius={200}
            depth={100}
            count={5000}
            factor={3}
            fade
            speed={0.5}
          />

          {/* Освещение */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
          <pointLight position={[0, 0, 0]} intensity={0.5} color="#4A90E2" />

          {/* Центральная звезда (главный граф) */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[2, 64, 64]} />
            <meshPhongMaterial
              color="#FFD700"
              emissive="#FFA500"
              emissiveIntensity={0.3}
            />
          </mesh>

          {/* Планеты */}
          {filteredPlanets.map((planet) => (
            <CosmicPlanet
              key={planet.id}
              planet={planet}
              selected={selectedPlanet === planet.id}
              hovered={hoveredPlanet === planet.id}
              showOrbits={showOrbits}
              showLabels={showLabels}
              onPlanetClick={handlePlanetClick}
              onPlanetHover={setHoveredPlanet}
              animationSpeed={animationSpeed}
            />
          ))}
        </Canvas>
      </div>

      {/* Панель информации о планете */}
      {selectedPlanet && (
        <div className={styles.planetInfoPanel}>
          <div className={styles.panelHeader}>
            <h3>Информация о планете</h3>
            <button onClick={() => setSelectedPlanet(null)}>✕</button>
          </div>
          <div className={styles.panelContent}>
            {(() => {
              const planet = cosmicNodes.find(p => p.id === selectedPlanet);
              if (!planet) return null;
              
              return (
                <>
                  <div className={styles.planetHeader}>
                    <div 
                      className={styles.planetIcon}
                      style={{ backgroundColor: planet.color }}
                    >
                      {planet.icon}
                    </div>
                    <div>
                      <h4>{planet.name}</h4>
                      <p className={styles.planetType}>
                        {planet.planetType === 'rocky' ? 'Каменная планета' :
                         planet.planetType === 'gas' ? 'Газовый гигант' :
                         planet.planetType === 'ice' ? 'Ледяной мир' :
                         'Карликовая планета'}
                      </p>
                    </div>
                  </div>
                  
                  <div className={styles.planetSpecs}>
                    <div className={styles.spec}>
                      <span className={styles.specLabel}>Размер:</span>
                      <span className={styles.specValue}>{planet.size.toFixed(1)}x Земли</span>
                    </div>
                    <div className={styles.spec}>
                      <span className={styles.specLabel}>Температура:</span>
                      <span className={styles.specValue}>{planet.temperature}°C</span>
                    </div>
                    <div className={styles.spec}>
                      <span className={styles.specLabel}>Атмосфера:</span>
                      <span className={styles.specValue}>{planet.atmosphere}</span>
                    </div>
                    <div className={styles.spec}>
                      <span className={styles.specLabel}>Орбита:</span>
                      <span className={styles.specValue}>{planet.orbitRadius.toFixed(1)} а.е.</span>
                    </div>
                  </div>
                  
                  <div className={styles.planetStats}>
                    <div className={styles.stat}>
                      <Users size={16} />
                      <span>{planet.subsNum} жителей</span>
                    </div>
                    <div className={styles.stat}>
                      <BookOpen size={16} />
                      <span>{planet.childGraphNum} спутников</span>
                    </div>
                  </div>
                  
                  <div className={styles.planetActions}>
                    <button className={styles.exploreButton}>
                      <Compass size={16} />
                      Исследовать
                    </button>
                    <button className={styles.colonizeButton}>
                      <Users size={16} />
                      Колонизировать
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Список планет */}
      <div className={styles.planetsList}>
        <h4>Планеты системы</h4>
        <div className={styles.planetsGrid}>
          {filteredPlanets.map((planet) => (
            <div
              key={planet.id}
              className={`${styles.planetCard} ${selectedPlanet === planet.id ? styles.selected : ''}`}
              onClick={() => handlePlanetClick(planet.id)}
              style={{ '--planet-color': planet.color } as React.CSSProperties}
            >
              <div className={styles.planetCardIcon} style={{ backgroundColor: planet.color }}>
                {planet.icon}
              </div>
              <div className={styles.planetCardInfo}>
                <h5>{planet.name}</h5>
                <p>{planet.planetType}</p>
                <div className={styles.planetCardStats}>
                  <span>{planet.subsNum}</span>
                  <span>{planet.childGraphNum}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CosmicGraphExplorer;
