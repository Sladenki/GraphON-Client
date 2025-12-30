'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3-force';
import { select } from 'd3-selection';
import { zoom, ZoomBehavior, ZoomTransform } from 'd3-zoom';
import { generateMockData } from './mockData';
import { LifeTraceData, EventNode, FriendNode, CATEGORY_COLORS } from './types';
import { useAuth } from '@/providers/AuthProvider';
import { UserNode } from './UserNode';
import { EventNodeComponent } from './EventNode';
import { FriendNodeComponent } from './FriendNode';
import { PathLine } from './PathLine';
import { EventModal } from './EventModal';
import styles from './LifeTrace2D.module.scss';

export function LifeTrace2D() {
  const { user } = useAuth();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [data] = useState<LifeTraceData>(() => generateMockData());
  const [selectedEvent, setSelectedEvent] = useState<EventNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  
  // Обновляем данные пользователя
  const userData = useMemo(() => ({
    ...data.userNode,
    avatarUrl: user?.avaPath,
    firstName: user?.firstName,
    lastName: user?.lastName,
    username: user?.username,
  }), [data.userNode, user]);
  // Создаем identity transform вручную
  const [transform, setTransform] = useState<ZoomTransform>({ x: 0, y: 0, k: 1 } as ZoomTransform);
  const simulationRef = useRef<d3.Simulation<any, undefined> | null>(null);
  const nodesRef = useRef<Array<EventNode | FriendNode>>([]);
  const [nodes, setNodes] = useState<Array<EventNode | FriendNode>>([...data.events, ...data.friends]);

  // Центральная позиция (центр экрана)
  const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 800;
  const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 600;

  // Инициализация симуляции d3-force
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = select(svgRef.current);
    const width = containerRef.current.clientWidth || 1920;
    const height = containerRef.current.clientHeight || 1080;

    // Обновляем ссылку на узлы
    const allNodes = [...data.events, ...data.friends];
    nodesRef.current = allNodes;
    setNodes(allNodes);

    // Создаем связи между событиями и друзьями
    const links: Array<{ source: string | EventNode | FriendNode; target: string | EventNode | FriendNode }> = [];
    data.friends.forEach((friend) => {
      links.push({
        source: friend.eventId,
        target: friend.id,
      });
    });

    // Создаем симуляцию
    const simulation = d3
      .forceSimulation(allNodes as any)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: any) => (typeof d === 'string' ? d : d.id))
          .distance(60)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(centerX, centerY))
      .force('collision', d3.forceCollide().radius(25))
      .alphaDecay(0.05)
      .on('tick', () => {
        // Обновляем состояние узлов для перерисовки
        setNodes([...allNodes]);
      });

    simulationRef.current = simulation;

    // Настройка zoom и pan
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        setTransform(event.transform);
      });

    svg.call(zoomBehavior as any);

    // Начальное масштабирование
    svg
      .transition()
      .duration(750)
      .call(zoomBehavior.scaleTo as any, 1);

    return () => {
      simulation.stop();
    };
  }, [data, centerX, centerY]);

  const handleEventClick = useCallback((event: EventNode) => {
    setSelectedEvent(event);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  // Вычисляем позиции для хронологической линии с категориями
  const pathPoints = useMemo(() => {
    const sortedEvents = nodes
      .filter((n): n is EventNode => 'category' in n)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return sortedEvents.map((event) => ({
      x: (event.x || 0) + centerX,
      y: (event.y || 0) + centerY,
      category: event.category,
    }));
  }, [nodes, centerX, centerY]);

  return (
    <div className={styles.container} ref={containerRef}>
      <svg
        ref={svgRef}
        className={styles.svg}
        width="100%"
        height="100%"
      >
        <g
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
            transformOrigin: '0 0',
          }}
        >
        <defs>
          {/* Фильтр для свечения линий */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Хронологическая линия с градиентами */}
        <PathLine points={pathPoints} events={data.events} />

        {/* Центральный узел пользователя */}
        <UserNode
          x={centerX}
          y={centerY}
          isHovered={hoveredNode === 'user-core'}
          onHover={(hovered) => setHoveredNode(hovered ? 'user-core' : null)}
          avatarUrl={userData.avatarUrl}
          firstName={userData.firstName}
          lastName={userData.lastName}
          username={userData.username}
        />

        {/* Узлы событий */}
        {nodes
          .filter((n): n is EventNode => 'category' in n)
          .map((event) => {
            const eventData = data.events.find((e) => e.id === event.id) || event;
            return (
              <EventNodeComponent
                key={event.id}
                event={eventData}
                x={(event.x || 0) + centerX}
                y={(event.y || 0) + centerY}
                isHovered={hoveredNode === event.id}
                isSelected={selectedEvent?.id === event.id}
                onHover={(hovered) => setHoveredNode(hovered ? event.id : null)}
                onClick={() => handleEventClick(eventData)}
              />
            );
          })}

        {/* Узлы друзей */}
        {nodes
          .filter((n): n is FriendNode => 'userId' in n)
          .map((friend) => {
            const friendData = data.friends.find((f) => f.id === friend.id) || friend;
            const parentEvent = nodes.find((n) => 'category' in n && n.id === friend.eventId) as EventNode | undefined;
            if (!parentEvent) return null;

            return (
              <FriendNodeComponent
                key={friend.id}
                friend={friendData}
                x={(friend.x || 0) + centerX}
                y={(friend.y || 0) + centerY}
                parentX={(parentEvent.x || 0) + centerX}
                parentY={(parentEvent.y || 0) + centerY}
                isHovered={hoveredNode === friend.id}
                onHover={(hovered) => setHoveredNode(hovered ? friend.id : null)}
              />
            );
          })}
        </g>
      </svg>

      {/* Модальное окно события */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={handleCloseModal} />
      )}
    </div>
  );
}

