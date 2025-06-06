'use client'

import WaterGraph3D from './WaterGraph3D/WaterGraph3D';
import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { GraphService } from '@/services/graph.service';
import { useQuery } from '@tanstack/react-query';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';

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

interface GraphNode {
  _id: { $oid: string };
  name: string;
  ownerUserId: { $oid: string };
  subsNum: number;
  childGraphNum: number;
  imgPath?: string;
  parentGraphId?: { $oid: string };
  graphType: 'global' | 'topic';
  city?: string;
}


export default function GraphView({ searchQuery }: { searchQuery: string }) {
  const { user } = useAuth();
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null);

  // Блокируем скролл
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    // Инициализация selectedGraphId
    const savedGraphId = localStorage.getItem('selectedGraphId');
    setSelectedGraphId(user?.selectedGraphId || savedGraphId || null);

    // Слушаем событие изменения графа
    const handleGraphSelected = (event: CustomEvent<string>) => {
      setSelectedGraphId(event.detail);
    };

    window.addEventListener('graphSelected', handleGraphSelected as EventListener);

    return () => {
      window.removeEventListener('graphSelected', handleGraphSelected as EventListener);
    };
  }, [user]);

  const { data, isLoading, error } = useQuery<GraphResponse>({
    queryKey: ['graphWithTopics', selectedGraphId],
    queryFn: async () => {
      if (!selectedGraphId) return { globalGraph: null, topicGraphs: [] };
      const response = await GraphService.getTopicGraphsWithGlobal(selectedGraphId);
      return response.data;
    },
    enabled: !!selectedGraphId
  });

  if (isLoading) return <SpinnerLoader />;
  if (error) return <div>Ошибка при загрузке данных</div>;
  if (!data?.globalGraph) return <div>Нет данных для отображения</div>;

  // Преобразуем данные в формат, ожидаемый компонентом WaterGraph3D
  const graphData: GraphNode[] = [
    {
      ...data.globalGraph,
      _id: { $oid: data.globalGraph._id },
      ownerUserId: { $oid: data.globalGraph.ownerUserId }
    },
    ...data.topicGraphs.map(graph => ({
      ...graph,
      _id: { $oid: graph._id },
      ownerUserId: { $oid: graph.ownerUserId },
      parentGraphId: { $oid: graph.parentGraphId }
    }))
  ];

  return <WaterGraph3D data={graphData} searchQuery={searchQuery} />;
}