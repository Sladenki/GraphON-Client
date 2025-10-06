'use client'

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Text, Html } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { useAuth } from '@/providers/AuthProvider';
import { GraphService } from '@/services/graph.service';
import { useQuery } from '@tanstack/react-query';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { useSearchQuery, useSelectedGraphId, useSetSelectedGraphId } from '@/stores/useUIStore';
import { Search, Filter, Grid, List, ChevronDown, ChevronUp, Star, Users, Calendar, BookOpen, Code, Music, Camera, Gamepad2, Heart, GraduationCap, MapPin } from 'lucide-react';
import styles from './SmartGraphSystem.module.scss';

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

interface TopicNode {
  id: string;
  name: string;
  subsNum: number;
  childGraphNum: number;
  imgPath?: string;
  icon: React.ReactNode;
  color: string;
  category: string;
  priority: number;
}

const SmartGraphSystem: React.FC = () => {
  const { user } = useAuth();
  const isInitialized = useRef(false);
  
  // Zustand store
  const searchQuery = useSearchQuery();
  const selectedGraphId = useSelectedGraphId();
  const setSelectedGraphId = useSetSelectedGraphId();

  // Состояния
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'hierarchy' | 'timeline'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'subscribers' | 'priority'>('priority');
  const [showFavorites, setShowFavorites] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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

  // Конфигурация тематик с категориями и приоритетами
  const TOPIC_CONFIG: Record<string, { icon: React.ReactNode; color: string; category: string; priority: number }> = {
    "Наука": { icon: <GraduationCap size={20} />, color: "#3B82F6", category: "Образование", priority: 1 },
    "Самоуправление": { icon: <Users size={20} />, color: "#10B981", category: "Социальное", priority: 2 },
    "Творчество": { icon: <Music size={20} />, color: "#F59E0B", category: "Культура", priority: 3 },
    "Спорт": { icon: <Heart size={20} />, color: "#EF4444", category: "Здоровье", priority: 4 },
    "Волонтерство": { icon: <Heart size={20} />, color: "#8B5CF6", category: "Социальное", priority: 5 },
    "Волонтёрство": { icon: <Heart size={20} />, color: "#8B5CF6", category: "Социальное", priority: 5 },
    "Медиа": { icon: <Camera size={20} />, color: "#06B6D4", category: "Технологии", priority: 6 },
    "Отряды": { icon: <Users size={20} />, color: "#84CC16", category: "Социальное", priority: 7 },
    "Литература": { icon: <BookOpen size={20} />, color: "#F97316", category: "Культура", priority: 8 },
    "Трудоустройство": { icon: <Code size={20} />, color: "#EC4899", category: "Карьера", priority: 9 },
    "Военно-патриотизм": { icon: <Star size={20} />, color: "#6366F1", category: "Патриотизм", priority: 10 }
  };

  // Создание узлов тематик
  const topicNodes = useMemo(() => {
    if (!data?.topicGraphs) return [];

    return data.topicGraphs.map((topic) => {
      const config = TOPIC_CONFIG[topic.name] || TOPIC_CONFIG["Наука"];
      
      return {
        id: topic._id,
        name: topic.name,
        subsNum: topic.subsNum,
        childGraphNum: topic.childGraphNum,
        imgPath: topic.imgPath,
        icon: config.icon,
        color: config.color,
        category: config.category,
        priority: config.priority
      } as TopicNode;
    });
  }, [data?.topicGraphs]);

  // Фильтрация и сортировка тематик
  const filteredTopics = useMemo(() => {
    let filtered = topicNodes;

    // Поиск по названию
    if (searchTerm) {
      filtered = filtered.filter(topic => 
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фильтр по категории
    if (filterCategory !== 'all') {
      filtered = filtered.filter(topic => topic.category === filterCategory);
    }

    // Показать только избранные
    if (showFavorites) {
      filtered = filtered.filter(topic => topic.priority <= 3);
    }

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'subscribers':
          return b.subsNum - a.subsNum;
        case 'priority':
        default:
          return a.priority - b.priority;
      }
    });

    return filtered;
  }, [topicNodes, searchTerm, filterCategory, showFavorites, sortBy]);

  // Группировка по категориям
  const groupedTopics = useMemo(() => {
    const groups: Record<string, TopicNode[]> = {};
    
    filteredTopics.forEach(topic => {
      if (!groups[topic.category]) {
        groups[topic.category] = [];
      }
      groups[topic.category].push(topic);
    });

    return groups;
  }, [filteredTopics]);

  // Получение всех категорий
  const categories = useMemo(() => {
    const cats = Array.from(new Set(topicNodes.map(t => t.category)));
    return ['all', ...cats];
  }, [topicNodes]);

  // Обработчики
  const handleTopicClick = useCallback((topicId: string) => {
    setSelectedTopic(topicId === selectedTopic ? null : topicId);
  }, [selectedTopic]);

  const handleCategoryToggle = useCallback((category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  }, [expandedCategories]);

  if (isLoading) return <SpinnerLoader />;
  if (error) return <div>Ошибка при загрузке данных</div>;
  if (!isLoading && data?.globalGraph === null) {
    return <div>Нет данных для отображения</div>;
  }

  if (!data) return null;

  return (
    <div className={styles.smartGraphContainer}>
      {/* Панель управления */}
      <div className={styles.controlPanel}>
        <div className={styles.searchSection}>
          <div className={styles.searchInput}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Поиск тематик..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className={styles.filterControls}>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className={styles.categoryFilter}
            >
              <option value="all">Все категории</option>
              {categories.slice(1).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className={styles.sortFilter}
            >
              <option value="priority">По приоритету</option>
              <option value="name">По названию</option>
              <option value="subscribers">По подписчикам</option>
            </select>

            <button
              className={`${styles.favoritesToggle} ${showFavorites ? styles.active : ''}`}
              onClick={() => setShowFavorites(!showFavorites)}
            >
              <Star size={16} />
              Избранные
            </button>
          </div>
        </div>

        <div className={styles.viewControls}>
          <div className={styles.viewModeButtons}>
            <button
              className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
              Сетка
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'hierarchy' ? styles.active : ''}`}
              onClick={() => setViewMode('hierarchy')}
            >
              <List size={16} />
              Иерархия
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'timeline' ? styles.active : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              <Calendar size={16} />
              Временная линия
            </button>
          </div>
        </div>
      </div>

      {/* Основная область контента */}
      <div className={styles.contentArea}>
        {viewMode === 'grid' && (
          <div className={styles.gridView}>
            {Object.entries(groupedTopics).map(([category, topics]) => (
              <div key={category} className={styles.categoryGroup}>
                <div 
                  className={styles.categoryHeader}
                  onClick={() => handleCategoryToggle(category)}
                >
                  <h3>{category}</h3>
                  <span className={styles.topicCount}>({topics.length})</span>
                  {expandedCategories.has(category) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                
                {expandedCategories.has(category) && (
                  <div className={styles.topicsGrid}>
                    {topics.map((topic) => (
                      <div
                        key={topic.id}
                        className={`${styles.topicCard} ${selectedTopic === topic.id ? styles.selected : ''}`}
                        onClick={() => handleTopicClick(topic.id)}
                        onMouseEnter={() => setHoveredTopic(topic.id)}
                        onMouseLeave={() => setHoveredTopic(null)}
                        style={{ '--topic-color': topic.color } as React.CSSProperties}
                      >
                        <div className={styles.topicIcon} style={{ color: topic.color }}>
                          {topic.icon}
                        </div>
                        <div className={styles.topicInfo}>
                          <h4 className={styles.topicName}>{topic.name}</h4>
                          <div className={styles.topicStats}>
                            <span className={styles.subscribers}>
                              <Users size={12} />
                              {topic.subsNum}
                            </span>
                            <span className={styles.subtopics}>
                              <BookOpen size={12} />
                              {topic.childGraphNum}
                            </span>
                          </div>
                        </div>
                        <div className={styles.topicPriority}>
                          <Star size={12} />
                          {topic.priority}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {viewMode === 'hierarchy' && (
          <div className={styles.hierarchyView}>
            <div className={styles.hierarchyTree}>
              {Object.entries(groupedTopics).map(([category, topics]) => (
                <div key={category} className={styles.hierarchyCategory}>
                  <div className={styles.categoryNode}>
                    <div className={styles.categoryIcon}>📁</div>
                    <span className={styles.categoryName}>{category}</span>
                    <span className={styles.categoryCount}>({topics.length})</span>
                  </div>
                  <div className={styles.topicNodes}>
                    {topics.map((topic) => (
                      <div
                        key={topic.id}
                        className={`${styles.hierarchyTopic} ${selectedTopic === topic.id ? styles.selected : ''}`}
                        onClick={() => handleTopicClick(topic.id)}
                        style={{ '--topic-color': topic.color } as React.CSSProperties}
                      >
                        <div className={styles.topicIcon} style={{ color: topic.color }}>
                          {topic.icon}
                        </div>
                        <span className={styles.topicName}>{topic.name}</span>
                        <div className={styles.topicBadges}>
                          <span className={styles.priorityBadge}>P{topic.priority}</span>
                          <span className={styles.subscribersBadge}>{topic.subsNum}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className={styles.timelineView}>
            <div className={styles.timelineContainer}>
              {filteredTopics.map((topic, index) => (
                <div
                  key={topic.id}
                  className={`${styles.timelineItem} ${selectedTopic === topic.id ? styles.selected : ''}`}
                  onClick={() => handleTopicClick(topic.id)}
                  style={{ 
                    '--topic-color': topic.color,
                    '--delay': `${index * 0.1}s`
                  } as React.CSSProperties}
                >
                  <div className={styles.timelineMarker} style={{ backgroundColor: topic.color }}>
                    {topic.icon}
                  </div>
                  <div className={styles.timelineContent}>
                    <h4 className={styles.topicName}>{topic.name}</h4>
                    <p className={styles.topicCategory}>{topic.category}</p>
                    <div className={styles.topicMetrics}>
                      <span>{topic.subsNum} подписчиков</span>
                      <span>{topic.childGraphNum} подтем</span>
                    </div>
                  </div>
                  <div className={styles.timelinePriority}>
                    Приоритет: {topic.priority}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Панель деталей */}
      {selectedTopic && (
        <div className={styles.detailsPanel}>
          <div className={styles.detailsHeader}>
            <h3>Детали тематики</h3>
            <button onClick={() => setSelectedTopic(null)}>✕</button>
          </div>
          <div className={styles.detailsContent}>
            {(() => {
              const topic = topicNodes.find(t => t.id === selectedTopic);
              if (!topic) return null;
              
              return (
                <>
                  <div className={styles.topicHeader}>
                    <div className={styles.topicIcon} style={{ color: topic.color }}>
                      {topic.icon}
                    </div>
                    <div>
                      <h4>{topic.name}</h4>
                      <p className={styles.topicCategory}>{topic.category}</p>
                    </div>
                  </div>
                  
                  <div className={styles.topicMetrics}>
                    <div className={styles.metric}>
                      <Users size={16} />
                      <span>{topic.subsNum} подписчиков</span>
                    </div>
                    <div className={styles.metric}>
                      <BookOpen size={16} />
                      <span>{topic.childGraphNum} подтем</span>
                    </div>
                    <div className={styles.metric}>
                      <Star size={16} />
                      <span>Приоритет: {topic.priority}</span>
                    </div>
                  </div>
                  
                  <div className={styles.topicActions}>
                    <button className={styles.primaryButton}>
                      Подписаться
                    </button>
                    <button className={styles.secondaryButton}>
                      Изучить подтемы
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartGraphSystem;
