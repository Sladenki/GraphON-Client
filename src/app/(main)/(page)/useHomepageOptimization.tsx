import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from "@/providers/AuthProvider";
import { Users, Calendar, Heart, Network } from "lucide-react";

export type TabType = 'events' | 'groups' | 'graphSystem' | 'subs';

interface UseHomepageOptimizationProps {
  initialTab?: TabType;
}

export const useHomepageOptimization = ({ 
  initialTab = 'events' 
}: UseHomepageOptimizationProps = {}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null);

  // Мемоизированная проверка наличия подписок
  const hasSubscriptions = useMemo(() => {
    return user?.graphSubsNum && user.graphSubsNum > 0;
  }, [user?.graphSubsNum]);

  // Мемоизированная проверка выбранного университета
  const hasSelectedGraph = useMemo(() => {
    const savedGraphId = typeof window !== 'undefined' 
      ? localStorage.getItem('selectedGraphId') 
      : null;
    return !!(user?.selectedGraphId || savedGraphId);
  }, [user?.selectedGraphId]);

  // Мемоизированный массив табов
  const tabs = useMemo(() => {
    const baseTabs: Array<{ name: TabType; label: string; icon: React.ReactElement }> = [
      { name: "groups" as const, label: "Группы", icon: <Users size={18} /> },
      { name: "events" as const, label: "События", icon: <Calendar size={18} /> },
    ];
    if (hasSubscriptions) {
      baseTabs.push({ name: "subs" as const, label: "Подписки", icon: <Heart size={18} /> });
    }
    
    baseTabs.push({ name: "graphSystem" as const, label: "Графы", icon: <Network size={18} /> });
    return baseTabs;
  }, [hasSubscriptions]);

  // Мемоизированная проверка показа поиска
  const showSearch = useMemo(() => 
    activeTab === "groups" || activeTab === "events" || activeTab === "subs",
    [activeTab]
  );

  // Мемоизированный обработчик смены таба
  const handleTabChange = useCallback((tab: string) => {
    const newTab = tab as TabType;
    setActiveTab(newTab);
    
    // Сохраняем в localStorage только на клиенте
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeTab', newTab);
    }
  }, []);

  // Мемоизированный обработчик изменения поиска
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Эффект для восстановления состояния из localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedTab = localStorage.getItem('activeTab') as TabType;
    const savedGraphId = localStorage.getItem('selectedGraphId');
    
    // Если сохраненный таб - "subs", но у пользователя нет подписок, переключаем на "events"
    if (savedTab === 'subs' && !hasSubscriptions) {
      setActiveTab('events');
      localStorage.setItem('activeTab', 'events');
    } else if (savedTab && tabs.some(tab => tab.name === savedTab)) {
      setActiveTab(savedTab);
    }

    // Инициализация selectedGraphId
    setSelectedGraphId(user?.selectedGraphId || savedGraphId || null);
  }, [user?.selectedGraphId, hasSubscriptions, tabs]);

  // Эффект для прослушивания событий выбора графа
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleGraphSelected = (event: CustomEvent<string>) => {
      setSelectedGraphId(event.detail);
    };

    window.addEventListener('graphSelected', handleGraphSelected as EventListener);

    return () => {
      window.removeEventListener('graphSelected', handleGraphSelected as EventListener);
    };
  }, []);

  // Мемоизированные состояния
  const state = useMemo(() => ({
    searchQuery,
    activeTab,
    selectedGraphId: selectedGraphId || '',
    hasSelectedGraph,
    hasSubscriptions,
    showSearch,
  }), [searchQuery, activeTab, selectedGraphId, hasSelectedGraph, hasSubscriptions, showSearch]);

  return {
    ...state,
    tabs,
    handleTabChange,
    handleSearchChange,
  };
}; 