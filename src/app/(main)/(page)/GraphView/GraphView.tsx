'use client'

import WaterGraph3D from './WaterGraph3D/WaterGraph3D';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { GraphService } from '@/services/graph.service';
import { useQuery } from '@tanstack/react-query';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { useSearchQuery, useSelectedGraphId, useSetSelectedGraphId } from '@/stores/useUIStore';

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


export default function GraphView() {
  const { user } = useAuth();
  const isInitialized = useRef(false);
  
  // Используем Zustand store
  const searchQuery = useSearchQuery();
  const selectedGraphId = useSelectedGraphId();
  const setSelectedGraphId = useSetSelectedGraphId();

  // Блокируем скролл
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    // Инициализация selectedGraphId из пользователя только один раз и только если разные
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
  if (!isLoading && data?.globalGraph === null) {
    return <div>Нет данных для отображения</div>;
  }

  if (!data) return null;

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