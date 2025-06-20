"use client";

import { useAuth } from "@/providers/AuthProvider";
import styles from "./page.module.scss";
import dynamic from "next/dynamic";
import { useState, useCallback, Suspense, useEffect } from "react";
import { SpinnerLoader } from "@/components/global/SpinnerLoader/SpinnerLoader";
import React from "react";
import { UniversitySelect } from '@/components/global/UniversitySelect/UniversitySelect';
import { AllGraphsOptimized } from "@/app/(main)/(page)/AllGraphs/AllGraphsOptimized";
import { Users, Calendar, Heart, Network } from "lucide-react";
const Subs = dynamic(() => import("./Subs/SubsOptimized"), { ssr: false });

const Tabs = dynamic(() => import("./Tabs/Tabs"), { ssr: false });
const GraphView = dynamic(() => import("./GraphView/GraphView"), { ssr: false });
const EventsList = dynamic(() => import("./EventsList/EventsListOptimized"), { ssr: false });

const Homepage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'events' | 'groups' | 'graphSystem' | 'subs'>('events');
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve saved tab from localStorage or default to 'events'
    const savedTab = localStorage.getItem('activeTab') as 'events' | 'groups' | 'graphSystem' | 'subs';
    
    // Если сохраненный таб - "subs", но у пользователя нет подписок, переключаем на "events"
    if (savedTab === 'subs' && (!user?.graphSubsNum || user.graphSubsNum === 0)) {
      setActiveTab('events');
      localStorage.setItem('activeTab', 'events');
    } else if (savedTab) {
      setActiveTab(savedTab);
    }

    // Initialize selectedGraphId
    const savedGraphId = localStorage.getItem('selectedGraphId');
    setSelectedGraphId(user?.selectedGraphId || savedGraphId || null);

    // Listen for graph selection event
    const handleGraphSelected = (event: CustomEvent<string>) => {
      setSelectedGraphId(event.detail);
    };

    window.addEventListener('graphSelected', handleGraphSelected as EventListener);

    return () => {
      window.removeEventListener('graphSelected', handleGraphSelected as EventListener);
    };
  }, [user]);

  const handleTabChange = useCallback((tab: string) => {
    const newTab = tab as 'events' | 'groups' | 'graphSystem';
    setActiveTab(newTab);
    // Save active tab to localStorage
    localStorage.setItem('activeTab', newTab);
  }, []);

  // Проверяем наличие выбранного университета как у авторизованного пользователя, так и в localStorage
  const savedGraphId = localStorage.getItem('selectedGraphId');
  if (!user?.selectedGraphId && !savedGraphId) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--primary-bg) 0%, #2a2b5d 100%)'
      }}>
        <UniversitySelect />
      </div>
    );
  }

  // Создаем массив табов с условным включением подписок
  const tabs = [
    { name: "groups", label: "Группы", icon: <Users size={18} /> },
    { name: "events", label: "События", icon: <Calendar size={18} /> },
    ...(user?.graphSubsNum && user.graphSubsNum > 0 ? [{ name: "subs", label: "Подписки", icon: <Heart size={18} /> }] : []),
    { name: "graphSystem", label: "Графы", icon: <Network size={18} /> },
  ];

  return (
    <div className={styles.mainPage}>
      {/* Шапка: Табы + Поиск */}
      <div className={styles.headerPart}>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          showSearch={activeTab === "groups" || activeTab === "events" || activeTab === "subs"}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Контент в зависимости от активного таба */}
      <div className={styles.pageContent}>
        {activeTab === "groups" && (
          <Suspense fallback={<SpinnerLoader />}>
            <AllGraphsOptimized 
              searchQuery={searchQuery} 
              selectedGraphId={selectedGraphId || ''} 
            />
          </Suspense>
        )}

        {activeTab === 'events' && (
          <Suspense fallback={<SpinnerLoader />}>
            <EventsList searchQuery={searchQuery} />
          </Suspense>
        )}

        {activeTab === 'graphSystem' && (
          <Suspense fallback={<SpinnerLoader />}>
            <GraphView searchQuery={searchQuery}  />
          </Suspense>
        )}

        {activeTab === 'subs' && user?.graphSubsNum && user.graphSubsNum > 0 && (
          <Suspense fallback={<SpinnerLoader />}>
            <Subs searchQuery={searchQuery} />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default Homepage;