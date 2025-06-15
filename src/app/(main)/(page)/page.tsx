"use client";

import React, { Suspense } from "react";
import styles from "./page.module.scss";
import dynamic from "next/dynamic";
import { SpinnerLoader } from "@/components/global/SpinnerLoader/SpinnerLoader";
import { UniversitySelect } from '@/components/global/UniversitySelect/UniversitySelect';
import { AllGraphs } from "@/app/(main)/(page)/AllGraphs/AllGraphs";
import { useHomepageOptimization } from "./useHomepageOptimization";

// Оптимизированная динамическая загрузка компонентов
const Tabs = dynamic(() => import("./Tabs/Tabs"), { 
  ssr: false,
  loading: () => <div className={styles.tabsSkeleton} />
});

const GraphView = dynamic(() => import("./GraphView/GraphView"), { 
  ssr: false,
  loading: () => <SpinnerLoader />
});

const EventsList = dynamic(() => import("./EventsList/EventsList"), { 
  ssr: false,
  loading: () => <SpinnerLoader />
});

const Subs = dynamic(() => import("./Subs/Subs"), { 
  ssr: false,
  loading: () => <SpinnerLoader />
});

// Мемоизированный компонент выбора университета
const UniversitySelectScreen = React.memo(() => (
  <div className={styles.universitySelectContainer} role="main">
    <UniversitySelect />
  </div>
));
UniversitySelectScreen.displayName = 'UniversitySelectScreen';

// Мемоизированные компоненты контента
const GroupsContent = React.memo<{ 
  searchQuery: string; 
  selectedGraphId: string; 
}>(({ searchQuery, selectedGraphId }) => (
  <Suspense fallback={<SpinnerLoader />}>
    <AllGraphs 
      searchQuery={searchQuery} 
      selectedGraphId={selectedGraphId} 
    />
  </Suspense>
));
GroupsContent.displayName = 'GroupsContent';

const EventsContent = React.memo<{ 
  searchQuery: string; 
}>(({ searchQuery }) => (
  <Suspense fallback={<SpinnerLoader />}>
    <EventsList searchQuery={searchQuery} />
  </Suspense>
));
EventsContent.displayName = 'EventsContent';

const GraphSystemContent = React.memo<{ 
  searchQuery: string; 
}>(({ searchQuery }) => (
  <Suspense fallback={<SpinnerLoader />}>
    <GraphView searchQuery={searchQuery} />
  </Suspense>
));
GraphSystemContent.displayName = 'GraphSystemContent';

const SubsContent = React.memo<{ 
  searchQuery: string; 
  hasSubscriptions: boolean; 
}>(({ searchQuery, hasSubscriptions }) => {
  if (!hasSubscriptions) return null;
  
  return (
    <Suspense fallback={<SpinnerLoader />}>
      <Subs searchQuery={searchQuery} />
    </Suspense>
  );
});
SubsContent.displayName = 'SubsContent';

// Мемоизированный компонент контента
const ContentRenderer = React.memo<{
  activeTab: string;
  searchQuery: string;
  selectedGraphId: string;
  hasSubscriptions: boolean;
}>(({ activeTab, searchQuery, selectedGraphId, hasSubscriptions }) => {
  switch (activeTab) {
    case "groups":
      return <GroupsContent searchQuery={searchQuery} selectedGraphId={selectedGraphId} />;
    case "events":
      return <EventsContent searchQuery={searchQuery} />;
    case "graphSystem":
      return <GraphSystemContent searchQuery={searchQuery} />;
    case "subs":
      return <SubsContent searchQuery={searchQuery} hasSubscriptions={hasSubscriptions} />;
    default:
      return <EventsContent searchQuery={searchQuery} />;
  }
});
ContentRenderer.displayName = 'ContentRenderer';

// Основной компонент Homepage
const Homepage: React.FC = React.memo(() => {
  const {
    searchQuery,
    activeTab,
    selectedGraphId,
    hasSelectedGraph,
    hasSubscriptions,
    showSearch,
    tabs,
    handleTabChange,
    handleSearchChange,
  } = useHomepageOptimization();

  // Early return для экрана выбора университета
  if (!hasSelectedGraph) {
    return <UniversitySelectScreen />;
  }

  return (
    <main className={styles.homepage}>
      {/* Шапка: Табы + Поиск */}
      <header className={styles.headerPart}>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          showSearch={showSearch}
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
        />
      </header>

      {/* Контент в зависимости от активного таба */}
      <section className={styles.contentWrapper}>
        <ContentRenderer
          activeTab={activeTab}
          searchQuery={searchQuery}
          selectedGraphId={selectedGraphId}
          hasSubscriptions={!!hasSubscriptions}
        />
      </section>
    </main>
  );
});

Homepage.displayName = 'Homepage';

export default Homepage;
