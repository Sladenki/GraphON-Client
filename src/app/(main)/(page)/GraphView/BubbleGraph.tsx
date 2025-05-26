import { Stage, Layer, Circle, Text, Group } from 'react-konva';
import { useState, useCallback, useMemo } from 'react';

interface Node {
  _id: { $oid: string };
  name: string;
  imgPath?: string;
  parentGraphId?: { $oid: string };
  directorName?: string;
  vkLink?: string;
  children?: Node[];
}

interface BubbleGraphProps {
  searchQuery: string;
}

function Bubble({ x, y, radius, text, onClick, isActive }: { 
  x: number; 
  y: number; 
  radius: number; 
  text: string; 
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <Group x={x} y={y} onClick={onClick}>
      <Circle
        radius={radius}
        fill={isActive ? '#4CAF50' : '#2196F3'}
        shadowColor="black"
        shadowBlur={10}
        shadowOpacity={0.3}
        shadowOffset={{ x: 5, y: 5 }}
      />
      <Text
        text={text}
        fontSize={16}
        fill="white"
        align="center"
        width={radius * 2}
        x={-radius}
        y={-10}
      />
    </Group>
  );
}

function BubbleGraph({ searchQuery }: BubbleGraphProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const data = useMemo(() => {
    const root = {
      _id: { $oid: "67a499dd08ac3c0df94d6ab7" },
      name: "КГТУ",
      children: [
        {
          _id: { $oid: "67bcde0b5bc6b1601911698e" },
          name: "Наука и интеллект",
          children: [
            {
              _id: { $oid: "67be1a6138db96e59ae8c147" },
              name: "Что? Где? Когда?",
              directorName: "Степанищев Вадим Геннадьевич",
              vkLink: "https://vk.com/chtogdekogdakstu"
            }
          ]
        },
        {
          _id: { $oid: "67bcde0b5bc6b1601911698f" },
          name: "Студенческое самоуправление",
          children: [
            {
              _id: { $oid: "67be1a6138db96e59ae8c149" },
              name: "Студенческий совет КГТУ",
              directorName: "Макаров Роман Леонидович",
              vkLink: "https://vk.com/students_council"
            }
          ]
        }
      ]
    };
    return root;
  }, []);

  const handleBubbleClick = useCallback((node: Node) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(node._id.$oid)) {
        newSet.delete(node._id.$oid);
      } else {
        newSet.add(node._id.$oid);
      }
      return newSet;
    });
  }, []);

  const renderNode = (node: Node, x: number, y: number, level: number = 0) => {
    const radius = 60 - level * 10;
    const isExpanded = expandedNodes.has(node._id.$oid);
    
    return (
      <Group key={node._id.$oid}>
        <Bubble
          x={x}
          y={y}
          radius={radius}
          text={node.name}
          onClick={() => handleBubbleClick(node)}
          isActive={isExpanded}
        />
        {isExpanded && node.children && node.children.map((child, index) => {
          // @ts-expect-error 123
          const angle = (index / node.children.length) * Math.PI * 2;
          const childX = x + Math.cos(angle) * (150 + level * 50);
          const childY = y + Math.sin(angle) * (150 + level * 50);
          
          return renderNode(child, childX, childY, level + 1);
        })}
      </Group>
    );
  };

  return (
    <div style={{ width: '100%', height: '100vh', background: '#f0f0f0' }}>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          {renderNode(data, window.innerWidth / 2, window.innerHeight / 2)}
        </Layer>
      </Stage>
    </div>
  );
}

export default BubbleGraph; 