"use client";

import { useAuth } from "@/providers/AuthProvider";
import styles from "./page.module.scss";
import dynamic from "next/dynamic";
import { useState, useCallback, Suspense } from "react";
import { SpinnerLoader } from "@/components/global/SpinnerLoader/SpinnerLoader";
import React from "react";
import { UniversitySelect } from '@/components/global/UniversitySelect/UniversitySelect';
import { AllGraphs } from "@/app/(main)/(page)/AllGraphs/AllGraphs";

const Tabs = dynamic(() => import("./Tabs/Tabs"), { ssr: false });
const GraphView = dynamic(() => import("./GraphView/GraphView"), { ssr: false });
const EventsList = dynamic(() => import("./EventsList/EventsList"), { ssr: false });

const Homepage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"events" | "groups" | "graphSystem">("events");
  const [searchQuery, setSearchQuery] = useState("");

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as "events" | "groups" | "graphSystem");
  }, []);

  // Если нет выбранного университета, показываем компонент выбора
  if (!user?.selectedGraphId) {
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
        />

        {activeTab !== "graphSystem" && (
          <div className={styles.inputBlock}>
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Контент в зависимости от активного таба */}
      <div className={styles.contentWrapper}>
        {activeTab === "groups" && (
          <Suspense fallback={<SpinnerLoader />}>
            <AllGraphs searchQuery={searchQuery} selectedGraphId={user?.selectedGraphId} />
          </Suspense>
        )}

        {activeTab === 'graphSystem' && (
          <Suspense fallback={<SpinnerLoader />}>
            <GraphView searchQuery={searchQuery} />
          </Suspense>
        )}

        {activeTab === 'events' && (
          <Suspense fallback={<SpinnerLoader />}>
            <EventsList searchQuery={searchQuery} />
          </Suspense>
        )}
      </div>
    </>
  );
};

export default Homepage;
