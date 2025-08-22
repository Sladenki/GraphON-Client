'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';

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

interface HexagonalNodeProps {
  node: GraphNode;
  position: [number, number, number];
  scale: number;
  isGlobal: boolean;
  onHover: (nodeId: string | null) => void;
  isHovered: boolean;
  onClick?: (node: GraphNode) => void;
}

export const HexagonalNode: React.FC<HexagonalNodeProps> = ({ 
  node, 
  position, 
  scale, 
  isGlobal,
  onHover,
  isHovered,
  onClick
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [clicked, setClicked] = useState(false);

  // Анимация пульсации (без вращения)
  useFrame((state) => {
    if (meshRef.current) {
      // Пульсация при наведении
      if (isHovered) {
        meshRef.current.scale.setScalar(scale * 1.2);
        meshRef.current.position.y = position[1] + 0.5;
      } else {
        meshRef.current.scale.setScalar(scale);
        meshRef.current.position.y = position[1];
      }
      
      // Легкое покачивание для глобального графа
      if (isGlobal) {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
      }
    }
  });

  // Обработчики событий
  const handlePointerOver = () => onHover(node._id);
  const handlePointerOut = () => onHover(null);
  const handleClick = () => {
    setClicked(!clicked);
    if (onClick) onClick(node);
  };

  // Цвета и материалы для игрового вида
  const material = useMemo(() => {
    if (isGlobal) {
      return new THREE.MeshPhongMaterial({
        color: isHovered ? '#ff6b6b' : '#ff4757',
        transparent: true,
        opacity: 0.95,
        shininess: 200,
        emissive: isHovered ? '#ff6b6b' : '#ff4757',
        emissiveIntensity: isHovered ? 0.8 : 0.4,
        specular: '#ffffff',
        specularIntensity: isHovered ? 1.5 : 0.8
      });
    } else {
      return new THREE.MeshPhongMaterial({
        color: isHovered ? '#2ed573' : '#1e90ff',
        transparent: true,
        opacity: 0.9,
        shininess: 150,
        emissive: isHovered ? '#2ed573' : '#1e90ff',
        emissiveIntensity: isHovered ? 0.6 : 0.3,
        specular: '#ffffff',
        specularIntensity: isHovered ? 1.2 : 0.6
      });
    }
  }, [isGlobal, isHovered]);

  // Обводка при наведении
  const outlineMaterial = useMemo(() => {
    if (isHovered) {
      return new THREE.MeshBasicMaterial({
        color: isGlobal ? '#ff6b6b' : '#2ed573',
        transparent: true,
        opacity: 0.8
      });
    }
    return null;
  }, [isHovered, isGlobal]);

  // Энергетическое поле вокруг узла
  const energyField = useMemo(() => {
    if (isHovered) {
      return new THREE.MeshBasicMaterial({
        color: isGlobal ? '#ff6b6b' : '#2ed573',
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide
      });
    }
    return null;
  }, [isHovered, isGlobal]);

  // Основание шестиугольника
  const baseMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: isGlobal ? '#c44569' : '#2f3542',
      transparent: true,
      opacity: 0.5
    });
  }, [isGlobal]);

  return (
    <group position={position}>
      {/* Основание шестиугольника */}
      <mesh material={baseMaterial}>
        <cylinderGeometry args={[scale * 0.6, scale * 0.6, 0.05, 6]} />
      </mesh>
      
      {/* Энергетическое поле вокруг узла */}
      {energyField && (
        <mesh material={energyField}>
          <sphereGeometry args={[scale * 1.8, 16, 16]} />
        </mesh>
      )}
      
      {/* Обводка при наведении */}
      {outlineMaterial && (
        <mesh
          material={outlineMaterial}
          scale={[1.3, 1.3, 1.3]}
        >
          <cylinderGeometry args={[scale * 0.5, scale * 0.5, 0.1, 6]} />
        </mesh>
      )}
      
      {/* Основной шестиугольник - используем готовую геометрию */}
      <mesh
        ref={meshRef}
        material={material}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        userData={{ nodeId: node._id }}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[scale * 0.5, scale * 0.5, 0.1, 6]} />
      </mesh>
      
      {/* Игровые частицы вокруг узла */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[scale * 0.8, 8, 8]} />
        <meshBasicMaterial 
          color={isGlobal ? '#ff6b6b' : '#2ed573'} 
          transparent 
          opacity={0.1}
          wireframe
        />
      </mesh>
      
      {/* Текст названия */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={isGlobal ? 0.9 : 0.7}
        color={isHovered ? '#ffffff' : '#2c3e50'}
        anchorX="center"
        anchorY="middle"
        maxWidth={3}
        textAlign="center"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {node.name}
      </Text>
      
      {/* Информация о графе */}
      <Html
        position={[0, -2, 0]}
        center
        style={{
          background: 'rgba(44, 62, 80, 0.95)',
          color: 'white',
          padding: '12px 18px',
          borderRadius: '15px',
          fontSize: '13px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          border: `3px solid ${isGlobal ? '#ff6b6b' : '#2ed573'}`,
          boxShadow: '0 6px 25px rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div>
          <div style={{ 
            fontWeight: 'bold', 
            marginBottom: '8px', 
            fontSize: '14px',
            color: isGlobal ? '#ff6b6b' : '#2ed573'
          }}>
            {isGlobal ? '🏛️ Университет' : '🎯 Тема'}
          </div>
          <div>👥 Подписчики: {node.subsNum}</div>
          <div>🔗 Дочерние: {node.childGraphNum}</div>
          {node.city && <div>🌍 Город: {node.city}</div>}
        </div>
      </Html>
    </group>
  );
};
