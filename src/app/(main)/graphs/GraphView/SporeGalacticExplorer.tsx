'use client'

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Html } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { useAuth } from '@/providers/AuthProvider';
import { GraphService } from '@/services/graph.service';
import { useQuery } from '@tanstack/react-query';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { useSearchQuery, useSelectedGraphId, useSetSelectedGraphId } from '@/stores/useUIStore';
import { Search, Users, BookOpen, Code, Music, Camera, Heart, GraduationCap, Star, Zap, Eye, ArrowRight, Plus, Minus, RotateCcw, Compass, MapPin, Target } from 'lucide-react';
import styles from './SporeGalacticExplorer.module.scss';

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

interface StarSystem {
  id: string;
  name: string;
  subsNum: number;
  childGraphNum: number;
  imgPath?: string;
  icon: React.ReactNode;
  color: string;
  starType: 'blue' | 'yellow' | 'red' | 'white' | 'purple';
  size: number;
  position: { x: number; y: number; z: number };
  planets: Array<{
    id: string;
    name: string;
    type: 'terran' | 'desert' | 'arctic' | 'jungle' | 'ocean' | 'toxic' | 'barren';
    size: number;
    color: string;
    groups: Array<{
      id: string;
      name: string;
      description: string;
      membersCount: number;
      isActive: boolean;
    }>;
  }>;
  distance: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
}

const SporeGalacticExplorer: React.FC = () => {
  const { user } = useAuth();
  const isInitialized = useRef(false);
  
  // Zustand store
  const searchQuery = useSearchQuery();
  const selectedGraphId = useSelectedGraphId();
  const setSelectedGraphId = useSetSelectedGraphId();

  // Состояния
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'galaxy' | 'system' | 'planet'>('galaxy');
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, z: 20 });
  const [showConnections, setShowConnections] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [explorationMode, setExplorationMode] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  
  // Состояния для визуальных эффектов
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [clickAnimation, setClickAnimation] = useState<string | null>(null);
  const [dataTransition, setDataTransition] = useState(false);
  const [pulseEffect, setPulseEffect] = useState<string | null>(null);

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

  // Конфигурация звездных систем
  const STAR_CONFIG: Record<string, { 
    icon: React.ReactNode; 
    color: string; 
    starType: 'blue' | 'yellow' | 'red' | 'white' | 'purple';
    size: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  }> = {
    "Наука": { 
      icon: <GraduationCap size={18} />, 
      color: "#3B82F6", 
      starType: 'blue',
      size: 1.2,
      difficulty: 'medium'
    },
    "Самоуправление": { 
      icon: <Users size={18} />, 
      color: "#10B981", 
      starType: 'yellow',
      size: 1.4,
      difficulty: 'easy'
    },
    "Творчество": { 
      icon: <Music size={18} />, 
      color: "#F59E0B", 
      starType: 'yellow',
      size: 1.1,
      difficulty: 'easy'
    },
    "Спорт": { 
      icon: <Heart size={18} />, 
      color: "#EF4444", 
      starType: 'red',
      size: 1.3,
      difficulty: 'medium'
    },
    "Волонтерство": { 
      icon: <Star size={18} />, 
      color: "#8B5CF6", 
      starType: 'purple',
      size: 1.0,
      difficulty: 'easy'
    },
    "Волонтёрство": { 
      icon: <Star size={18} />, 
      color: "#8B5CF6", 
      starType: 'purple',
      size: 1.0,
      difficulty: 'easy'
    },
    "Медиа": { 
      icon: <Camera size={18} />, 
      color: "#06B6D4", 
      starType: 'white',
      size: 1.1,
      difficulty: 'medium'
    },
    "Отряды": { 
      icon: <Users size={18} />, 
      color: "#84CC16", 
      starType: 'yellow',
      size: 1.2,
      difficulty: 'easy'
    },
    "Литература": { 
      icon: <BookOpen size={18} />, 
      color: "#F97316", 
      starType: 'red',
      size: 0.9,
      difficulty: 'easy'
    },
    "Трудоустройство": { 
      icon: <Code size={18} />, 
      color: "#EC4899", 
      starType: 'purple',
      size: 1.0,
      difficulty: 'hard'
    },
    "Военно-патриотизм": { 
      icon: <Star size={18} />, 
      color: "#6366F1", 
      starType: 'blue',
      size: 1.3,
      difficulty: 'medium'
    }
  };

  // Создание звездных систем
  const starSystems = useMemo(() => {
    if (!data?.topicGraphs) return [];

    return data.topicGraphs.map((topic, index) => {
      const config = STAR_CONFIG[topic.name] || STAR_CONFIG["Наука"];
      const angle = (index / data.topicGraphs.length) * Math.PI * 2;
      const distance = 8 + (index * 1.5);
      
      // Создаем планеты для каждой системы
      const planets = [
        {
          id: `${topic._id}_planet1`,
          name: `${topic.name} - Основная планета`,
          type: 'terran' as const,
          size: 0.8,
          color: '#4A90E2',
          groups: [
            {
              id: `${topic._id}_group1`,
              name: `${topic.name} - Основная группа`,
              description: `Основная группа по направлению ${topic.name}`,
              membersCount: Math.floor(Math.random() * 50) + 10,
              isActive: true
            }
          ]
        },
        {
          id: `${topic._id}_planet2`,
          name: `${topic.name} - Продвинутая планета`,
          type: 'jungle' as const,
          size: 0.6,
          color: '#10B981',
          groups: [
            {
              id: `${topic._id}_group2`,
              name: `${topic.name} - Продвинутая группа`,
              description: `Продвинутая группа для углубленного изучения`,
              membersCount: Math.floor(Math.random() * 30) + 5,
              isActive: true
            }
          ]
        },
        {
          id: `${topic._id}_planet3`,
          name: `${topic.name} - Начинающие`,
          type: 'desert' as const,
          size: 0.7,
          color: '#F59E0B',
          groups: [
            {
              id: `${topic._id}_group3`,
              name: `${topic.name} - Начинающие`,
              description: `Группа для новичков в направлении ${topic.name}`,
              membersCount: Math.floor(Math.random() * 40) + 15,
              isActive: false
            }
          ]
        }
      ];

      return {
        id: topic._id,
        name: topic.name,
        subsNum: topic.subsNum,
        childGraphNum: topic.childGraphNum,
        imgPath: topic.imgPath,
        icon: config.icon,
        color: config.color,
        starType: config.starType,
        size: config.size,
        position: {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          z: Math.sin(angle * 2) * 0.5
        },
        planets: planets,
        distance: distance,
        difficulty: config.difficulty
      } as StarSystem;
    });
  }, [data?.topicGraphs]);

  // Фильтрация систем
  const filteredSystems = useMemo(() => {
    let filtered = starSystems;

    if (searchTerm) {
      filtered = filtered.filter(system => 
        system.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        system.planets.some(planet => 
          planet.groups.some(group => 
            group.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      );
    }

    return filtered;
  }, [starSystems, searchTerm]);

  // Обработчики с визуальными эффектами
  const handleSystemClick = useCallback((systemId: string) => {
    // Запускаем анимацию клика
    setClickAnimation(systemId);
    setIsLoadingData(true);
    setDataTransition(true);
    
    // Эффект пульсации
    setPulseEffect(systemId);
    
    // Имитируем загрузку данных
    setTimeout(() => {
      setSelectedSystem(systemId === selectedSystem ? null : systemId);
      setViewMode('system');
      setCameraPosition({ x: 0, y: 0, z: 12 });
      setIsLoadingData(false);
      setDataTransition(false);
    }, 800);
    
    // Сбрасываем анимации
    setTimeout(() => {
      setClickAnimation(null);
      setPulseEffect(null);
    }, 1200);
  }, [selectedSystem]);

  const handlePlanetClick = useCallback((planetId: string) => {
    // Запускаем анимацию клика
    setClickAnimation(planetId);
    setIsLoadingData(true);
    setDataTransition(true);
    
    // Эффект пульсации
    setPulseEffect(planetId);
    
    // Имитируем загрузку данных
    setTimeout(() => {
      setSelectedPlanet(planetId === selectedPlanet ? null : planetId);
      setViewMode('planet');
      setCameraPosition({ x: 0, y: 0, z: 8 });
      setIsLoadingData(false);
      setDataTransition(false);
    }, 600);
    
    // Сбрасываем анимации
    setTimeout(() => {
      setClickAnimation(null);
      setPulseEffect(null);
    }, 1000);
  }, [selectedPlanet]);

  const resetView = useCallback(() => {
    setSelectedSystem(null);
    setSelectedPlanet(null);
    setViewMode('galaxy');
    setCameraPosition({ x: 0, y: 0, z: 20 });
  }, []);

  if (isLoading) return <SpinnerLoader />;
  if (error) return <div>Ошибка при загрузке данных</div>;
  if (!isLoading && data?.globalGraph === null) {
    return <div>Нет данных для отображения</div>;
  }

  if (!data) return null;

  // Компонент звездной системы с визуальными эффектами
  const StarSystemComponent: React.FC<{
    system: StarSystem;
    selected: boolean;
    hovered: boolean;
    onSystemClick: (id: string) => void;
    onSystemHover: (id: string | null) => void;
  }> = ({ system, selected, hovered, onSystemClick, onSystemHover }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    const isClicking = clickAnimation === system.id;
    const isPulsing = pulseEffect === system.id;

    const { scale, glow, rotation } = useSpring({
      scale: isClicking ? 2.0 : selected ? 1.5 : hovered ? 1.2 : 1,
      glow: isClicking ? 6 : isPulsing ? 5 : selected ? 4 : hovered ? 2.5 : 1.5,
      rotation: [0, 0, 0] as [number, number, number],
      config: { tension: 300, friction: 30 }
    });

    useFrame((_, delta) => {
      if (meshRef.current) {
        meshRef.current.rotation.y += delta * animationSpeed * 0.2;
        
        // Эффект пульсации при клике
        if (isPulsing) {
          meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.1);
        }
      }
      if (groupRef.current) {
        groupRef.current.rotation.z += delta * animationSpeed * 0.1;
      }
    });

    return (
      <group position={[system.position.x, system.position.y, system.position.z]} ref={groupRef}>
        {/* Звезда */}
        <a.mesh 
          ref={meshRef}
          scale={scale}
          onClick={() => onSystemClick(system.id)}
          onPointerOver={() => onSystemHover(system.id)}
          onPointerOut={() => onSystemHover(null)}
        >
          <sphereGeometry args={[system.size, 32, 16]} />
          <meshPhongMaterial
            color={system.color}
            emissive={system.color}
            emissiveIntensity={glow.get() * 0.6}
            shininess={100}
            transparent
            opacity={0.9}
          />
        </a.mesh>

        {/* Свечение звезды */}
        <a.mesh scale={[scale.get() * 2, scale.get() * 2, scale.get() * 2]}>
          <sphereGeometry args={[system.size, 16, 8]} />
          <meshBasicMaterial
            color={system.color}
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </a.mesh>

        {/* Планеты вокруг звезды */}
        {system.planets.map((planet, index) => {
          const planetAngle = (index / system.planets.length) * Math.PI * 2;
          const planetDistance = 2.5;
          const planetX = Math.cos(planetAngle) * planetDistance;
          const planetY = Math.sin(planetAngle) * planetDistance;
          
          return (
            <mesh
              key={planet.id}
              position={[planetX, planetY, 0]}
              onClick={() => handlePlanetClick(planet.id)}
            >
              <sphereGeometry args={[planet.size, 16, 8]} />
              <meshPhongMaterial
                color={planet.color}
                emissive={planet.color}
                emissiveIntensity={0.2}
                shininess={50}
              />
            </mesh>
          );
        })}

        {/* Подпись */}
        {showLabels && (
          <Html center>
            <div className={styles.systemLabel}>
              <span className={styles.systemName}>{system.name}</span>
              <span className={styles.systemStats}>
                {system.subsNum} жителей • {system.planets.length} планет
              </span>
              <span className={`${styles.difficulty} ${styles[system.difficulty]}`}>
                {system.difficulty === 'easy' ? 'Легко' :
                 system.difficulty === 'medium' ? 'Средне' :
                 system.difficulty === 'hard' ? 'Сложно' : 'Экстремально'}
              </span>
            </div>
          </Html>
        )}
      </group>
    );
  };

  return (
    <div className={styles.galacticExplorer}>
      {/* Панель управления в стиле Spore */}
      <div className={styles.sporeControlPanel}>
        <div className={styles.galaxyHeader}>
          <div className={styles.galaxyTitle}>
            <Compass size={32} />
            <h1>Галактика {data.globalGraph.name}</h1>
            <span className={styles.galaxyStats}>
              {starSystems.length} звездных систем • {data.globalGraph.subsNum} жителей галактики
            </span>
          </div>
          
          <div className={styles.galaxyControls}>
            <button
              className={`${styles.sporeButton} ${explorationMode ? styles.active : ''}`}
              onClick={() => setExplorationMode(!explorationMode)}
            >
              <Eye size={20} />
              Режим исследования
            </button>
            
            <button
              className={styles.sporeButton}
              onClick={resetView}
            >
              <RotateCcw size={20} />
              Вернуться в галактику
            </button>
          </div>
        </div>

        <div className={styles.sporeSearchSection}>
          <div className={styles.sporeSearchBar}>
            <Search size={22} />
            <input
              type="text"
              placeholder="Поиск звездных систем и планет..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isLoadingData && (
              <div className={styles.loadingIndicator}>
                <div className={styles.loadingSpinner}></div>
                <span>Загрузка данных...</span>
              </div>
            )}
          </div>
          
          <div className={styles.sporeViewControls}>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'galaxy' ? styles.active : ''}`}
              onClick={() => setViewMode('galaxy')}
            >
              <Compass size={18} />
              Галактика
            </button>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'system' ? styles.active : ''}`}
              onClick={() => setViewMode('system')}
            >
              <Star size={18} />
              Система
            </button>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'planet' ? styles.active : ''}`}
              onClick={() => setViewMode('planet')}
            >
              <Target size={18} />
              Планета
            </button>
          </div>
        </div>
      </div>

      {/* Галактическая область */}
      <div className={styles.galacticSpace}>
        <Canvas
          camera={{ 
            position: new THREE.Vector3(cameraPosition.x, cameraPosition.y, cameraPosition.z),
            fov: 60
          }}
          style={{ 
            width: '100%', 
            height: '100%'
          }}
        >
          {/* Фон */}
          <color attach="background" args={['#000011']} />
          <fog attach="fog" args={['#000011', 5, 30]} />
          
          {/* Звездное поле */}
          <Stars 
            radius={200}
            depth={100}
            count={8000}
            factor={4}
            fade
            speed={0.2}
          />

          {/* Освещение */}
          <ambientLight intensity={0.2} />
          <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
          <pointLight position={[0, 0, 0]} intensity={0.3} color="#4A90E2" />

          {/* Центральная звезда (главный граф) */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[2, 64, 64]} />
            <meshPhongMaterial
              color="#FFD700"
              emissive="#FFA500"
              emissiveIntensity={0.8}
            />
          </mesh>

          {/* Звездные системы */}
          {filteredSystems.map((system) => (
            <StarSystemComponent
              key={system.id}
              system={system}
              selected={selectedSystem === system.id}
              hovered={hoveredSystem === system.id}
              onSystemClick={handleSystemClick}
              onSystemHover={setHoveredSystem}
            />
          ))}
        </Canvas>
      </div>

      {/* Панель информации о системе */}
      {selectedSystem && (
        <div className={`${styles.systemInfo} ${dataTransition ? styles.transitioning : ''}`}>
          <div className={styles.infoHeader}>
            <h3>Звездная система</h3>
            <button onClick={() => setSelectedSystem(null)}>✕</button>
          </div>
          
          <div className={styles.infoContent}>
            {(() => {
              const system = starSystems.find(s => s.id === selectedSystem);
              if (!system) return null;
              
              return (
                <>
                  <div className={styles.systemHeader}>
                    <div 
                      className={styles.systemIcon}
                      style={{ backgroundColor: system.color }}
                    >
                      {system.icon}
                    </div>
                    <div>
                      <h4>{system.name}</h4>
                      <p>{system.subsNum} жителей • {system.planets.length} планет</p>
                      <div className={`${styles.difficultyBadge} ${styles[system.difficulty]}`}>
                        {system.difficulty === 'easy' ? 'Легко' :
                         system.difficulty === 'medium' ? 'Средне' :
                         system.difficulty === 'hard' ? 'Сложно' : 'Экстремально'}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.planetsList}>
                    <h5>Планеты системы:</h5>
                    {system.planets.map((planet) => (
                      <div
                        key={planet.id}
                        className={`${styles.planetCard} ${selectedPlanet === planet.id ? styles.selected : ''}`}
                        onClick={() => handlePlanetClick(planet.id)}
                      >
                        <div className={styles.planetInfo}>
                          <div 
                            className={styles.planetIcon}
                            style={{ backgroundColor: planet.color }}
                          />
                          <div>
                            <h6>{planet.name}</h6>
                            <p>{planet.groups.length} групп</p>
                          </div>
                        </div>
                        <ArrowRight size={16} />
                      </div>
                    ))}
                  </div>
                  
                  <div className={styles.systemActions}>
                    <button className={styles.exploreButton}>
                      <Eye size={16} />
                      Исследовать систему
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Панель информации о планете */}
      {selectedPlanet && (
        <div className={`${styles.planetInfo} ${dataTransition ? styles.transitioning : ''}`}>
          <div className={styles.infoHeader}>
            <h3>Планета</h3>
            <button onClick={() => setSelectedPlanet(null)}>✕</button>
          </div>
          
          <div className={styles.infoContent}>
            {(() => {
              const planet = starSystems
                .flatMap(s => s.planets)
                .find(p => p.id === selectedPlanet);
              if (!planet) return null;
              
              return (
                <>
                  <div className={styles.planetHeader}>
                    <div 
                      className={styles.planetIcon}
                      style={{ backgroundColor: planet.color }}
                    />
                    <div>
                      <h4>{planet.name}</h4>
                      <p>Тип: {planet.type}</p>
                    </div>
                  </div>
                  
                  <div className={styles.groupsList}>
                    <h5>Группы на планете:</h5>
                    {planet.groups.map((group) => (
                      <div
                        key={group.id}
                        className={`${styles.groupCard} ${group.isActive ? styles.active : styles.inactive}`}
                      >
                        <div className={styles.groupInfo}>
                          <h6>{group.name}</h6>
                          <p>{group.description}</p>
                          <div className={styles.groupStats}>
                            <Users size={14} />
                            <span>{group.membersCount} участников</span>
                            <span className={styles.status}>
                              {group.isActive ? 'Активна' : 'Неактивна'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className={styles.planetActions}>
                    <button className={styles.colonizeButton}>
                      <Plus size={16} />
                      Колонизировать планету
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Список звездных систем */}
      <div className={styles.systemsList}>
        <h4>Звездные системы</h4>
        <div className={styles.systemsGrid}>
          {filteredSystems.map((system) => (
            <div
              key={system.id}
              className={`${styles.systemCard} ${selectedSystem === system.id ? styles.selected : ''}`}
              onClick={() => handleSystemClick(system.id)}
              style={{ '--system-color': system.color } as React.CSSProperties}
            >
              <div className={styles.systemCardIcon} style={{ backgroundColor: system.color }}>
                {system.icon}
              </div>
              <div className={styles.systemCardInfo}>
                <h5>{system.name}</h5>
                <p>{system.subsNum} жителей</p>
                <div className={styles.systemCardPlanets}>
                  {system.planets.length} планет
                </div>
                <div className={`${styles.difficultyTag} ${styles[system.difficulty]}`}>
                  {system.difficulty}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SporeGalacticExplorer;
