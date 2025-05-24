import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, useTexture } from '@react-three/drei';
import { useMemo, useState } from 'react';
import * as THREE from 'three';

interface Node {
  _id: { $oid: string };
  name: string;
  imgPath?: string;
  parentGraphId?: { $oid: string };
  directorName?: string;
  vkLink?: string;
}

interface BiomeSceneProps {
  searchQuery: string;
}

function Island({ position, data, onClick }: { position: [number, number, number], data: Node, onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  // const texture = useTexture(data.imgPath);
  
  return (
    <group position={position} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh>
        <cylinderGeometry args={[1, 1.5, 0.5, 32]} />
        <meshStandardMaterial 
          color={hovered ? '#ffd700' : '#4CAF50'} 
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
      <Text
        position={[0, 1, 0]}
        fontSize={0.3}
        color={hovered ? '#ffd700' : '#ffffff'}
        anchorX="center"
        anchorY="middle"
      >
        {data.name}
      </Text>
    </group>
  );
}

function BiomeScene({ searchQuery }: BiomeSceneProps) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  // Mock data structure based on the provided data
  const data = useMemo(() => {
    const root = {
      _id: { $oid: "67a499dd08ac3c0df94d6ab7" },
      name: "КГТУ",
      imgPath: "images/graphAva/klgtu.jpg",
      children: [
        {
          _id: { $oid: "67bcde0b5bc6b1601911698e" },
          name: "Наука и интеллект",
          // imgPath: "images/graphAva/Science.jpg",
          children: [
            {
              _id: { $oid: "67be1a6138db96e59ae8c147" },
              name: "Что? Где? Когда?",
              // imgPath: "images/graphAva/WhereWho.jpg",
              directorName: "Степанищев Вадим Геннадьевич",
              vkLink: "https://vk.com/chtogdekogdakstu"
            }
          ]
        },
        {
          _id: { $oid: "67bcde0b5bc6b1601911698f" },
          name: "Студенческое самоуправление",
          // imgPath: "images/graphAva/StudentGov.jpg",
          children: [
            {
              _id: { $oid: "67be1a6138db96e59ae8c149" },
              name: "Студенческий совет КГТУ",
              // imgPath: "images/graphAva/StudentCouncil.jpg",
              directorName: "Макаров Роман Леонидович",
              vkLink: "https://vk.com/students_council"
            }
          ]
        }
      ]
    };
    return root;
  }, []);

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas camera={{ position: [0, 5, 10], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />
        
        {/* Render root node */}
        <Island 
          position={[0, 0, 0]} 
          data={data} 
          onClick={() => handleNodeClick(data)}
        />
        
        {/* Render first level children */}
        {data.children?.map((child, index) => {
          const angle = (index / data.children.length) * Math.PI * 2;
          const radius = 4;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          return (
            <Island 
              key={child._id.$oid}
              position={[x, 0, z]} 
              data={child}
              onClick={() => handleNodeClick(child)}
            />
          );
        })}
      </Canvas>
      
      {/* Modal for displaying node details */}
      {selectedNode && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 0 10px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          <h2>{selectedNode.name}</h2>
          {selectedNode.directorName && <p>Руководитель: {selectedNode.directorName}</p>}
          {selectedNode.vkLink && (
            <a href={selectedNode.vkLink} target="_blank" rel="noopener noreferrer">
              VK группа
            </a>
          )}
          <button onClick={() => setSelectedNode(null)}>Закрыть</button>
        </div>
      )}
    </div>
  );
}

export default BiomeScene; 