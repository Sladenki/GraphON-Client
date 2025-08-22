'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { HexagonalNode } from './HexagonalNode';
import styles from './HexagonalGraph3D.module.scss';
import { GraphService } from '@/services/graph.service';

interface GraphNode {
  _id: string;
  name: string;
  imgPath?: string;
  parentGraphId?: string;
  childGraphNum: number;
  ownerUserId: string;
  subsNum: number;
  directorName?: string;
  directorVkLink?: string;
  vkLink?: string;
  graphType: 'global' | 'topic';
  city?: string;
}

interface HexagonalGraph3DProps {
  data: GraphNode[];
  searchQuery: string;
}

// Вспомогательные функции для гекс-сетки (аксиальные координаты)
type Axial = { q: number; r: number };

const axialToWorld = (hex: Axial, tileRadius: number): [number, number, number] => {
  const x = tileRadius * (Math.sqrt(3) * hex.q + Math.sqrt(3) / 2 * hex.r);
  const z = tileRadius * (3 / 2 * hex.r);
  return [x, 0, z];
};

const ring = (radius: number): Axial[] => {
  // Возвращает гексы на кольце радиуса вокруг (0,0)
  if (radius === 0) return [{ q: 0, r: 0 }];
  const results: Axial[] = [];
  let q = 0 + radius;
  let r = 0 - radius;
  const directions: Axial[] = [
    { q: -1, r: 0 },
    { q: 0, r: 1 },
    { q: 1, r: 1 },
    { q: 1, r: 0 },
    { q: 0, r: -1 },
    { q: -1, r: -1 },
  ];
  for (let side = 0; side < 6; side++) {
    for (let step = 0; step < radius; step++) {
      results.push({ q, r });
      q += directions[side].q;
      r += directions[side].r;
    }
  }
  return results;
};

const Scene = ({ data, searchQuery }: HexagonalGraph3DProps) => {
  const { camera } = useThree();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [childrenByTopic, setChildrenByTopic] = useState<Record<string, GraphNode[]>>({});
  
  // Настройки камеры для лучшего обзора
  useEffect(() => {
    camera.position.set(0, 15, 20);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  // Фильтруем данные по поисковому запросу
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    const result = data.filter(node =>
      node.name.toLowerCase().includes(query) ||
      node.city?.toLowerCase().includes(query)
    );
    // Если ничего не найдено, не скрываем сцену, а показываем все
    return result.length ? result : data;
  }, [data, searchQuery]);

  // Разделяем данные на глобальный граф и тематические
  const globalGraph = useMemo(() => 
    filteredData.find(n => n.graphType === 'global'), [filteredData]
  );
  
  const topicGraphs = useMemo(() => 
    filteredData.filter(n => n.graphType === 'topic'), [filteredData]
  );

  // Строгое расположение в гекс-сетке: центр + шесть соседей, затем внешние кольца при необходимости
  const topicPositions = useMemo(() => {
    if (!topicGraphs.length) return [];
    const tileRadius = 3.2; // размер гекса в мире
    const positions: [number, number, number][] = [];

    // Кольца заполняем последовательно
    let placed = 0;
    let currentRing = 1;
    while (placed < topicGraphs.length) {
      const cells = ring(currentRing);
      for (let i = 0; i < cells.length && placed < topicGraphs.length; i++) {
        positions.push(axialToWorld(cells[i], tileRadius));
        placed++;
      }
      currentRing++;
    }
    return positions;
  }, [topicGraphs]);

  // Загружаем подграфы для каждой темы и сохраняем в словаре
  useEffect(() => {
    let isCancelled = false;
    async function loadChildren() {
      try {
        const requests = topicGraphs.map(async (t) => {
          try {
            const resp = await GraphService.getAllChildrenByTopic(t._id);
            // resp.data может быть в разных форматах, приведем к GraphNode[] если возможно
            const arr = (resp as any)?.data ?? [];
            return [t._id, arr as GraphNode[]] as const;
          } catch (e) {
            return [t._id, [] as GraphNode[]] as const;
          }
        });
        const entries = await Promise.all(requests);
        if (!isCancelled) {
          const dict: Record<string, GraphNode[]> = {};
          for (const [id, list] of entries) dict[id] = list;
          setChildrenByTopic(dict);
        }
      } catch (_) {
        if (!isCancelled) setChildrenByTopic({});
      }
    }
    if (topicGraphs.length) loadChildren();
    return () => {
      isCancelled = true;
    };
  }, [topicGraphs]);

  // Обработчик наведения на узлы
  const handleNodeHover = useCallback((nodeId: string | null) => {
    setHoveredNode(nodeId);
  }, []);

  return (
    <>
      {/* Простое небесное освещение */}
      <ambientLight intensity={0.8} color="#87ceeb" />
      <directionalLight position={[10, 20, 10]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, 15, -10]} intensity={0.6} color="#ff6b6b" />
      <pointLight position={[10, 15, -10]} intensity={0.6} color="#2ed573" />
      
      {/* Плиточная подложка-гекс поле */}
      <group>
        {(() => {
          const tiles: JSX.Element[] = [];
          const tileRadius = 3.2;
          const gridRadius = 6; // радиус поля в гексах
          for (let r = -gridRadius; r <= gridRadius; r++) {
            for (let q = -gridRadius; q <= gridRadius; q++) {
              const s = -q - r;
              if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) <= gridRadius) {
                const [x, y, z] = axialToWorld({ q, r }, tileRadius);
                tiles.push(
                  <mesh key={`tile-${q}-${r}`} position={[x, -0.06, z]} receiveShadow>
                    <cylinderGeometry args={[tileRadius * 0.55, tileRadius * 0.55, 0.02, 6]} />
                    <meshStandardMaterial color={((q + r) & 1) === 0 ? '#9ec5a3' : '#8bb891'} roughness={0.9} metalness={0.05} />
                  </mesh>
                );
              }
            }
          }
          return tiles;
        })()}
      </group>
      
      {/* Глобальный граф в центре */}
      {globalGraph && (
        <HexagonalNode
          node={globalGraph}
          position={[0, 0, 0]}
          scale={2.2}
          isGlobal={true}
          onHover={handleNodeHover}
          isHovered={hoveredNode === globalGraph._id}
        />
      )}
      
      {/* Тематические графы в прилегающих гексах */}
      {topicGraphs.map((topic, index) => (
        <HexagonalNode
          key={topic._id}
          node={topic}
          position={topicPositions[index]}
          scale={1.6}
          isGlobal={false}
          onHover={handleNodeHover}
          isHovered={hoveredNode === topic._id}
        />
      ))}

      {/* Подграфы вокруг каждой темы (локальная гекс-спираль) */}
      {topicGraphs.map((topic, index) => {
        const basePos = topicPositions[index];
        const children = childrenByTopic[topic._id] || [];
        if (!children.length) return null;

        const childTile = 1.5; // плотность подграфов
        const needed = children.length;
        const spiral: Axial[] = [];
        let rr = 1;
        while (spiral.length < needed) {
          spiral.push(...ring(rr));
          rr++;
        }
        const positions = spiral.slice(0, needed).map(h => axialToWorld(h, childTile));
        return (
          <group key={`children-${topic._id}`}>
            {children.map((child, i) => (
              <HexagonalNode
                key={child._id}
                node={child}
                position={[basePos[0] + positions[i][0], 0, basePos[2] + positions[i][2]]}
                scale={0.9}
                isGlobal={false}
                onHover={handleNodeHover}
                isHovered={hoveredNode === child._id}
              />)
            )}
          </group>
        );
      })}
      
      {/* Соединительные линии от центра к темам */}
      <ConnectionLines 
        globalGraph={globalGraph}
        topicGraphs={topicGraphs}
        topicPositions={topicPositions}
        hoveredNode={hoveredNode}
      />
      
      {/* Управление камерой */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={12}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={0.1}
        dampingFactor={0.05}
        enableDamping={true}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />
    </>
  );
};

// Компонент для соединительных линий
const ConnectionLines = ({ 
  globalGraph, 
  topicGraphs, 
  topicPositions, 
  hoveredNode 
}: {
  globalGraph: GraphNode | undefined;
  topicGraphs: GraphNode[];
  topicPositions: [number, number, number][];
  hoveredNode: string | null;
}) => {
  if (!globalGraph || !topicGraphs.length) return null;

  return (
    <group>
      {topicGraphs.map((topic, index) => {
        const isHovered = hoveredNode === topic._id || hoveredNode === globalGraph._id;
        const position = topicPositions[index];
        
        return (
          <line key={`line-${topic._id}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, position[0], position[1], position[2]])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial 
              color={isHovered ? '#a04fff' : '#4b5563'} 
              transparent 
              opacity={isHovered ? 0.8 : 0.4}
              linewidth={isHovered ? 3 : 1}
            />
          </line>
        );
      })}
    </group>
  );
};

export const HexagonalGraph3D: React.FC<HexagonalGraph3DProps> = ({ data, searchQuery }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  console.log('HexagonalGraph3D - data:', data);
  console.log('HexagonalGraph3D - searchQuery:', searchQuery);
  console.log('HexagonalGraph3D - data.length:', data.length);

  if (!data.length) {
    return (
      <div className={styles.container}>
        <div className={styles.noData}>
          <h3>Нет данных для отображения</h3>
          <p>Данные не загружены или пусты</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.container}>
      {/* Тестовый текст для проверки рендеринга */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        fontSize: '24px',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '20px',
        borderRadius: '10px'
      }}>
        Шестиугольники загружаются...
      </div>
      
      <Canvas
        camera={{ position: [0, 15, 20], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance',
        }}
        shadows
      >
        <Scene data={data} searchQuery={searchQuery} />
      </Canvas>
      
      {/* Отладочная информация */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div>Узлов: {data.length}</div>
        <div>Глобальных: {data.filter(n => n.graphType === 'global').length}</div>
        <div>Тематических: {data.filter(n => n.graphType === 'topic').length}</div>
        <div>Поиск: {searchQuery || 'нет'}</div>
        <div>Canvas: Шестиугольники</div>
        <div>Статус: Загружаются</div>
      </div>
    </div>
  );
};
