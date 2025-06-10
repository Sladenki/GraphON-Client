"use client";

import { useAuth } from "@/providers/AuthProvider";
import styles from "./page.module.scss";
import dynamic from "next/dynamic";
import { useState, useCallback, Suspense, useEffect } from "react";
import { SpinnerLoader } from "@/components/global/SpinnerLoader/SpinnerLoader";
import React from "react";
import { UniversitySelect } from '@/components/global/UniversitySelect/UniversitySelect';
import { AllGraphs } from "@/app/(main)/(page)/AllGraphs/AllGraphs";

const Tabs = dynamic(() => import("./Tabs/Tabs"), { ssr: false });
const GraphView = dynamic(() => import("./GraphView/GraphView"), { ssr: false });
const EventsList = dynamic(() => import("./EventsList/EventsList"), { ssr: false });

const Homepage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'events' | 'groups' | 'graphSystem'>('events');
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve saved tab from localStorage or default to 'events'
    const savedTab = localStorage.getItem('activeTab') as 'events' | 'groups' | 'graphSystem';
    if (savedTab) {
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

  return (
    <>
      {/* Шапка: Табы + Поиск */}
      <div className={styles.headerPart}>
        <Tabs
          tabs={[
            { name: "groups", label: "Группы" },
            { name: "events", label: "События" },
            { name: "graphSystem", label: "Графы" },
          ]}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          showSearch={activeTab === "groups" || activeTab === "events"}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Контент в зависимости от активного таба */}
      <div className={styles.contentWrapper}>
        {activeTab === "groups" && (
          <Suspense fallback={<SpinnerLoader />}>
            <AllGraphs 
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
      </div>
    </>
  );
};

export default Homepage;
