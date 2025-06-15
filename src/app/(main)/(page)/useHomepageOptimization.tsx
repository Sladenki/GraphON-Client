import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Мемоизированная проверка наличия подписок
  const hasSubscriptions = useMemo(() => {
    return (user?.graphSubsNum && user.graphSubsNum > 0) || (user?.attentedEventsNum && user.attentedEventsNum > 0);
  }, [user?.graphSubsNum, user?.attentedEventsNum]);

  // Мемоизированная проверка выбранного университета
  const hasSelectedGraph = useMemo(() => {
    const savedGraphId = typeof window !== 'undefined' 
      ? localStorage.getItem('selectedGraphId') 
      : null;
    return !!(user?.selectedGraphId || savedGraphId);
  }, [user?.selectedGraphId]);

  // Мемоизированный массив табов с кэшированием
  const tabs = useMemo(() => {
    const iconProps = { size: 18, 'aria-hidden': true };
    const baseTabs: Array<{ name: TabType; label: string; icon: React.ReactElement }> = [
      { name: "groups" as const, label: "Группы", icon: <Users {...iconProps} /> },
      { name: "events" as const, label: "События", icon: <Calendar {...iconProps} /> },
    ];
    
    if (hasSubscriptions) {
      baseTabs.push({ name: "subs" as const, label: "Подписки", icon: <Heart {...iconProps} /> });
    }
    
    baseTabs.push({ name: "graphSystem" as const, label: "Графы", icon: <Network {...iconProps} /> });
    return baseTabs;
  }, [hasSubscriptions]);

  // Мемоизированная проверка показа поиска
  const showSearch = useMemo(() => 
    activeTab === "groups" || activeTab === "events" || activeTab === "subs",
    [activeTab]
  );

  // Оптимизированный обработчик смены таба с debounce для localStorage
  const handleTabChange = useCallback((tab: string) => {
    const newTab = tab as TabType;
    
    // Предотвращаем ненужные обновления
    if (newTab === activeTab) return;
    
    setActiveTab(newTab);
    
    // Сохраняем в localStorage с debounce
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeTab', newTab);
    }
  }, [activeTab]);

  // Оптимизированный обработчик изменения поиска с debounce
  const handleSearchChange = useCallback((query: string) => {
    // Очищаем предыдущий таймер
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Немедленно устанавливаем значение для UI
    setSearchQuery(query);
    
    // Сохраняем в localStorage с debounce
    if (typeof window !== 'undefined') {
      searchTimeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem(`searchQuery_${activeTab}`, query);
        } catch (error) {
          console.warn('Failed to save search query to localStorage:', error);
        }
      }, 300);
    }
  }, [activeTab]);

  // Эффект для восстановления состояния из localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedTab = localStorage.getItem('activeTab') as TabType;
    const savedGraphId = localStorage.getItem('selectedGraphId');
    
    // Инициализация selectedGraphId
    const initialGraphId = user?.selectedGraphId || savedGraphId || null;
    setSelectedGraphId(initialGraphId);
    
    // Восстановление активной вкладки
    if (savedTab === 'subs' && !hasSubscriptions) {
      // Если сохраненный таб - "subs", но у пользователя нет подписок
      setActiveTab('events');
      localStorage.setItem('activeTab', 'events');
    } else if (savedTab && tabs.some(tab => tab.name === savedTab)) {
      setActiveTab(savedTab);
      
      // Восстанавливаем поисковый запрос для этой вкладки
      const savedSearchQuery = localStorage.getItem(`searchQuery_${savedTab}`) || '';
      if (savedSearchQuery) {
        setSearchQuery(savedSearchQuery);
      }
    }
  }, [user?.selectedGraphId, hasSubscriptions, tabs]);

  // Эффект для очистки поискового запроса при смене вкладки
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSearchQuery = localStorage.getItem(`searchQuery_${activeTab}`) || '';
      setSearchQuery(savedSearchQuery);
    }
  }, [activeTab]);

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

  // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Мемоизированные состояния с более стабильными зависимостями
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