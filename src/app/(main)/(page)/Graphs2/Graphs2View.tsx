'use client';

import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GraphService } from '@/services/graph.service';
import { useSelectedGraphId } from '@/stores/useUIStore';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { HexagonalGraph3D } from './HexagonalGraph3D/HexagonalGraph3D';
import styles from './Graphs2View.module.scss';

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

interface GraphResponse {
  globalGraph: GraphNode;
  topicGraphs: GraphNode[];
}

interface Graphs2ViewProps {
  searchQuery: string;
}

export default function Graphs2View({ searchQuery }: Graphs2ViewProps) {
  const selectedGraphId = useSelectedGraphId();

  const { data, isLoading, error } = useQuery<GraphResponse>({
    queryKey: ['graphWithTopics', selectedGraphId],
    queryFn: async () => {
      if (!selectedGraphId) {
        throw new Error('Не выбран граф');
      }
      const response = await GraphService.getTopicGraphsWithGlobal(selectedGraphId);
      return response.data;
    },
    enabled: !!selectedGraphId
  });

  // Блокируем скролл для 3D сцены
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  console.log('Graphs2View - selectedGraphId:', selectedGraphId);
  console.log('Graphs2View - isLoading:', isLoading);
  console.log('Graphs2View - error:', error);
  console.log('Graphs2View - data:', data);

  if (!selectedGraphId) {
    return (
      <div className={styles.noGraphSelected}>
        <h2>Выберите университет</h2>
        <p>Для просмотра графов необходимо выбрать университет в настройках профиля</p>
      </div>
    );
  }

  if (isLoading) return <SpinnerLoader />;
  if (error) return <div className={styles.error}>Ошибка при загрузке данных: {error.message}</div>;
  if (!data?.globalGraph) {
    return <div className={styles.error}>Нет данных для отображения</div>;
  }

  // Преобразуем данные в формат, ожидаемый компонентом HexagonalGraph3D
  const graphData: GraphNode[] = [
    data.globalGraph,
    ...data.topicGraphs
  ];

  console.log('Graphs2View - graphData:', graphData);
  console.log('Graphs2View - globalGraph:', data.globalGraph);
  console.log('Graphs2View - topicGraphs:', data.topicGraphs);

  return (
    <div className={styles.container}>
      <HexagonalGraph3D 
        data={graphData}
        // На случай мерцаний при гидрации: передаем пустую строку пока нет данных
        searchQuery={typeof searchQuery === 'string' ? searchQuery : ''}
      />
    </div>
  );
}
