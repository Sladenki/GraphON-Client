"use client";

import { useAuth } from "@/providers/AuthProvider";
import styles from "./page.module.scss";
import dynamic from "next/dynamic";
import { useCallback, Suspense, useEffect, useMemo, useRef } from "react";
import { SpinnerLoader } from "@/components/global/SpinnerLoader/SpinnerLoader";
import React from "react";
import { UniversitySelect } from '@/components/global/UniversitySelect/UniversitySelect';
import { AllGraphsOptimized } from "@/app/(main)/(page)/AllGraphs/AllGraphsOptimized";
import { Users, Calendar, Heart, Network } from "lucide-react";
import { useActiveTab, useSearchQuery, useSelectedGraphId, useSetActiveTab, useSetSearchQuery, useSetSelectedGraphId, TabType } from "@/stores/useUIStore";
import Tabs from "./Tabs/Tabs";

// Lazy loading только для контента табов
const Subs = dynamic(() => import("./Subs/SubsOptimized"), { ssr: false });
const GraphView = dynamic(() => import("./GraphView/GraphView"), { ssr: false });
const EventsList = dynamic(() => import("./EventsList/EventsListOptimized"), { ssr: false });

const Homepage = () => {
  const { user } = useAuth();
  const isInitialized = useRef(false);
  
  // Zustand state
  const activeTab = useActiveTab();
  const searchQuery = useSearchQuery();
  const selectedGraphId = useSelectedGraphId();
  const setActiveTab = useSetActiveTab();
  const setSearchQuery = useSetSearchQuery();
  const setSelectedGraphId = useSetSelectedGraphId();

  useEffect(() => {
    // Initialize selectedGraphId from user only once and only if different
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

  useEffect(() => {
    // Если активный таб - "subs", но у пользователя нет подписок, переключаем на "events"
    if (activeTab === 'subs' && (!user?.graphSubsNum || user.graphSubsNum === 0)) {
      setActiveTab('events');
    }
  }, [activeTab, user?.graphSubsNum, setActiveTab]);

  const handleTabChange = useCallback((tab: string) => {
    const newTab = tab as TabType;
    setActiveTab(newTab);
  }, [setActiveTab]);

  // Мемоизированный массив табов с условным включением подписок (ДОЛЖЕН быть до раннего возврата)
  const tabs = useMemo(() => [
    { name: "groups", label: "Группы", icon: <Users size={18} /> },
    { name: "events", label: "События", icon: <Calendar size={18} /> },
    ...(user?.graphSubsNum && user.graphSubsNum > 0 ? [{ name: "subs", label: "Подписки", icon: <Heart size={18} /> }] : []),
    { name: "graphSystem", label: "Графы", icon: <Network size={18} /> },
  ], [user?.graphSubsNum]);

  // Проверяем наличие выбранного университета
  if (!user?.selectedGraphId && !selectedGraphId) {
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
            <AllGraphsOptimized />
          </Suspense>
        )}

        {activeTab === 'events' && (
          <Suspense fallback={<SpinnerLoader />}>
            <EventsList />
          </Suspense>
        )}

        {activeTab === 'graphSystem' && (
          <Suspense fallback={<SpinnerLoader />}>
            <GraphView />
          </Suspense>
        )}

        {activeTab === 'subs' && user?.graphSubsNum && user.graphSubsNum > 0 && (
          <Suspense fallback={<SpinnerLoader />}>
            <Subs />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default Homepage;