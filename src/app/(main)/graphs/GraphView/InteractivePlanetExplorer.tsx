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
import { Search, Users, BookOpen, Code, Music, Camera, Heart, GraduationCap, Star, Zap, Eye, ArrowRight, Plus, Minus, RotateCcw } from 'lucide-react';
import styles from './InteractivePlanetExplorer.module.scss';

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

interface PlanetData {
  id: string;
  name: string;
  subsNum: number;
  childGraphNum: number;
  imgPath?: string;
  icon: React.ReactNode;
  color: string;
  planetType: 'education' | 'social' | 'creative' | 'sport' | 'volunteer' | 'media' | 'tech';
  size: number;
  orbitRadius: number;
  position: { x: number; y: number; z: number };
  groups: Array<{
    id: string;
    name: string;
    description: string;
    membersCount: number;
    isActive: boolean;
  }>;
}

const InteractivePlanetExplorer: React.FC = () => {
  const { user } = useAuth();
  const isInitialized = useRef(false);
  
  // Zustand store
  const searchQuery = useSearchQuery();
  const selectedGraphId = useSelectedGraphId();
  const setSelectedGraphId = useSetSelectedGraphId();

  // Состояния
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'overview' | 'explore' | 'focus'>('overview');
  const [cameraDistance, setCameraDistance] = useState(15);
  const [showLabels, setShowLabels] = useState(true);
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

  // Конфигурация планет
  const PLANET_CONFIG: Record<string, { 
    icon: React.ReactNode; 
    color: string; 
    planetType: 'education' | 'social' | 'creative' | 'sport' | 'volunteer' | 'media' | 'tech';
    size: number;
  }> = {
    "Наука": { 
      icon: <GraduationCap size={20} />, 
      color: "#3B82F6", 
      planetType: 'education',
      size: 1.2
    },
    "Самоуправление": { 
      icon: <Users size={20} />, 
      color: "#10B981", 
      planetType: 'social',
      size: 1.4
    },
    "Творчество": { 
      icon: <Music size={20} />, 
      color: "#F59E0B", 
      planetType: 'creative',
      size: 1.1
    },
    "Спорт": { 
      icon: <Heart size={20} />, 
      color: "#EF4444", 
      planetType: 'sport',
      size: 1.3
    },
    "Волонтерство": { 
      icon: <Star size={20} />, 
      color: "#8B5CF6", 
      planetType: 'volunteer',
      size: 1.0
    },
    "Волонтёрство": { 
      icon: <Star size={20} />, 
      color: "#8B5CF6", 
      planetType: 'volunteer',
      size: 1.0
    },
    "Медиа": { 
      icon: <Camera size={20} />, 
      color: "#06B6D4", 
      planetType: 'media',
      size: 1.1
    },
    "Отряды": { 
      icon: <Users size={20} />, 
      color: "#84CC16", 
      planetType: 'social',
      size: 1.2
    },
    "Литература": { 
      icon: <BookOpen size={20} />, 
      color: "#F97316", 
      planetType: 'creative',
      size: 0.9
    },
    "Трудоустройство": { 
      icon: <Code size={20} />, 
      color: "#EC4899", 
      planetType: 'tech',
      size: 1.0
    },
    "Военно-патриотизм": { 
      icon: <Star size={20} />, 
      color: "#6366F1", 
      planetType: 'social',
      size: 1.3
    }
  };

  // Создание планет с группами
  const planets = useMemo(() => {
    if (!data?.topicGraphs) return [];

    return data.topicGraphs.map((topic, index) => {
      const config = PLANET_CONFIG[topic.name] || PLANET_CONFIG["Наука"];
      const angle = (index / data.topicGraphs.length) * Math.PI * 2;
      const orbitRadius = 4 + (index * 0.4);
      
      // Моковые группы для демонстрации
      const groups = [
        {
          id: `${topic._id}_group1`,
          name: `${topic.name} - Основная группа`,
          description: `Основная группа по направлению ${topic.name}`,
          membersCount: Math.floor(Math.random() * 50) + 10,
          isActive: true
        },
        {
          id: `${topic._id}_group2`,
          name: `${topic.name} - Продвинутая группа`,
          description: `Продвинутая группа для углубленного изучения`,
          membersCount: Math.floor(Math.random() * 30) + 5,
          isActive: true
        },
        {
          id: `${topic._id}_group3`,
          name: `${topic.name} - Начинающие`,
          description: `Группа для новичков в направлении ${topic.name}`,
          membersCount: Math.floor(Math.random() * 40) + 15,
          isActive: false
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
        planetType: config.planetType,
        size: config.size,
        orbitRadius: orbitRadius,
        position: {
          x: Math.cos(angle) * orbitRadius,
          y: Math.sin(angle) * orbitRadius,
          z: Math.sin(angle * 2) * 0.3
        },
        groups: groups
      } as PlanetData;
    });
  }, [data?.topicGraphs]);

  // Фильтрация планет
  const filteredPlanets = useMemo(() => {
    let filtered = planets;

    if (searchTerm) {
      filtered = filtered.filter(planet => 
        planet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        planet.groups.some(group => 
          group.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return filtered;
  }, [planets, searchTerm]);

  // Обработчики
  const handlePlanetClick = useCallback((planetId: string) => {
    setSelectedPlanet(planetId === selectedPlanet ? null : planetId);
    setViewMode('explore');
    setCameraDistance(8);
  }, [selectedPlanet]);

  const handleGroupClick = useCallback((groupId: string) => {
    console.log('Group clicked:', groupId);
    // Здесь можно добавить логику перехода к группе
  }, []);

  const resetView = useCallback(() => {
    setSelectedPlanet(null);
    setViewMode('overview');
    setCameraDistance(15);
  }, []);

  if (isLoading) return <SpinnerLoader />;
  if (error) return <div>Ошибка при загрузке данных</div>;
  if (!isLoading && data?.globalGraph === null) {
    return <div>Нет данных для отображения</div>;
  }

  if (!data) return null;

  // Компонент планеты
  const Planet: React.FC<{
    planet: PlanetData;
    selected: boolean;
    hovered: boolean;
    onPlanetClick: (id: string) => void;
    onPlanetHover: (id: string | null) => void;
  }> = ({ planet, selected, hovered, onPlanetClick, onPlanetHover }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    const { scale, glow, rotation } = useSpring({
      scale: selected ? 1.8 : hovered ? 1.3 : 1,
      glow: selected ? 3 : hovered ? 2 : 1,
      rotation: [0, 0, 0] as [number, number, number],
      config: { tension: 300, friction: 30 }
    });

    useFrame((_, delta) => {
      if (meshRef.current) {
        meshRef.current.rotation.y += delta * animationSpeed * 0.3;
      }
    });

    return (
      <group position={[planet.position.x, planet.position.y, planet.position.z]}>
        {/* Орбита */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.orbitRadius - 0.05, planet.orbitRadius + 0.05, 64]} />
          <meshBasicMaterial
            color={planet.color}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>

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
            emissiveIntensity={glow.get() * 0.4}
            shininess={100}
            transparent
            opacity={0.95}
          />
        </a.mesh>

        {/* Атмосфера */}
        <a.mesh scale={[scale.get() * 1.3, scale.get() * 1.3, scale.get() * 1.3]}>
          <sphereGeometry args={[planet.size, 16, 8]} />
          <meshPhongMaterial
            color={planet.color}
            transparent
            opacity={0.08}
            side={THREE.BackSide}
          />
        </a.mesh>

        {/* Подпись */}
        {showLabels && (
          <Html center>
            <div className={styles.planetLabel}>
              <span className={styles.planetName}>{planet.name}</span>
              <span className={styles.planetStats}>
                {planet.subsNum} участников • {planet.groups.length} групп
              </span>
            </div>
          </Html>
        )}
      </group>
    );
  };

  return (
    <div className={styles.explorer}>
      {/* Панель управления */}
      <div className={styles.controlPanel}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Star size={28} />
            <h1>Исследование тематик</h1>
            <span className={styles.subtitle}>
              {data.globalGraph.name} • {planets.length} направлений
            </span>
          </div>
          
          <div className={styles.controls}>
            <button
              className={`${styles.controlButton} ${explorationMode ? styles.active : ''}`}
              onClick={() => setExplorationMode(!explorationMode)}
            >
              <Eye size={18} />
              Режим исследования
            </button>
            
            <button
              className={styles.controlButton}
              onClick={resetView}
            >
              <RotateCcw size={18} />
              Сброс
            </button>
          </div>
        </div>

        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Поиск тематик и групп..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className={styles.viewControls}>
            <button
              className={`${styles.viewButton} ${viewMode === 'overview' ? styles.active : ''}`}
              onClick={() => setViewMode('overview')}
            >
              Обзор
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'explore' ? styles.active : ''}`}
              onClick={() => setViewMode('explore')}
            >
              Исследование
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'focus' ? styles.active : ''}`}
              onClick={() => setViewMode('focus')}
            >
              Фокус
            </button>
          </div>
        </div>
      </div>

      {/* 3D область */}
      <div className={styles.spaceArea}>
        <Canvas
          camera={{ 
            position: new THREE.Vector3(0, 0, cameraDistance),
            fov: 60
          }}
          style={{ 
            width: '100%', 
            height: '100%'
          }}
        >
          {/* Фон */}
          <color attach="background" args={['#0a0a1a']} />
          <fog attach="fog" args={['#0a0a1a', 8, 25]} />
          
          {/* Звезды */}
          <Stars 
            radius={150}
            depth={80}
            count={3000}
            factor={2}
            fade
            speed={0.3}
          />

          {/* Освещение */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} color="#ffffff" />
          <pointLight position={[0, 0, 0]} intensity={0.8} color="#4A90E2" />

          {/* Центральная звезда */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.5, 64, 64]} />
            <meshPhongMaterial
              color="#FFD700"
              emissive="#FFA500"
              emissiveIntensity={0.5}
            />
          </mesh>

          {/* Планеты */}
          {filteredPlanets.map((planet) => (
            <Planet
              key={planet.id}
              planet={planet}
              selected={selectedPlanet === planet.id}
              hovered={hoveredPlanet === planet.id}
              onPlanetClick={handlePlanetClick}
              onPlanetHover={setHoveredPlanet}
            />
          ))}
        </Canvas>
      </div>

      {/* Панель информации о планете */}
      {selectedPlanet && (
        <div className={styles.planetInfo}>
          <div className={styles.infoHeader}>
            <h3>Группы в тематике</h3>
            <button onClick={() => setSelectedPlanet(null)}>✕</button>
          </div>
          
          <div className={styles.infoContent}>
            {(() => {
              const planet = planets.find(p => p.id === selectedPlanet);
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
                      <p>{planet.subsNum} участников • {planet.groups.length} групп</p>
                    </div>
                  </div>
                  
                  <div className={styles.groupsList}>
                    {planet.groups.map((group) => (
                      <div
                        key={group.id}
                        className={`${styles.groupCard} ${group.isActive ? styles.active : styles.inactive}`}
                        onClick={() => handleGroupClick(group.id)}
                      >
                        <div className={styles.groupInfo}>
                          <h5>{group.name}</h5>
                          <p>{group.description}</p>
                          <div className={styles.groupStats}>
                            <Users size={14} />
                            <span>{group.membersCount} участников</span>
                            <span className={styles.status}>
                              {group.isActive ? 'Активна' : 'Неактивна'}
                            </span>
                          </div>
                        </div>
                        <ArrowRight size={16} />
                      </div>
                    ))}
                  </div>
                  
                  <div className={styles.planetActions}>
                    <button className={styles.joinButton}>
                      <Plus size={16} />
                      Присоединиться к тематике
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
        <h4>Все тематики</h4>
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
                <p>{planet.subsNum} участников</p>
                <div className={styles.planetCardGroups}>
                  {planet.groups.length} групп
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InteractivePlanetExplorer;
