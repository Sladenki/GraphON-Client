"use client";

import React, { Suspense, useEffect, useState } from "react";
import styles from "./page.module.scss";
import dynamic from "next/dynamic";
import { SpinnerLoader } from "@/components/global/SpinnerLoader/SpinnerLoader";
import { UniversitySelect } from '@/components/global/UniversitySelect/UniversitySelect';
import { AllGraphs } from "@/app/(main)/(page)/AllGraphs/AllGraphs";
import { useHomepageOptimization } from "./useHomepageOptimization";
import { useMobileOptimization } from "./useMobileOptimization";

// Оптимизированная динамическая загрузка компонентов с предзагрузкой
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

// Адаптивная предзагрузка компонентов
const preloadComponents = (mobileOptimization: any) => {
  if (typeof window === 'undefined') return;
  
  const { shouldPreloadNextTab, getPreloadDelay, getMaxPreloadComponents } = mobileOptimization;
  
  if (!shouldPreloadNextTab()) return;
  
  const delay = getPreloadDelay();
  const maxComponents = getMaxPreloadComponents();
  
  // Приоритетная загрузка наиболее часто используемых компонентов
  const componentPriority = [
    () => import("./EventsList/EventsList"),
    () => import("./AllGraphs/AllGraphs"),
    () => import("./GraphView/GraphView"),
    () => import("./Subs/Subs")
  ];
  
  componentPriority.slice(0, maxComponents).forEach((importFn, index) => {
    setTimeout(() => {
      importFn().catch(error => {
        console.warn(`Failed to preload component ${index}:`, error);
      });
    }, delay + (index * 200));
  });
};

// Мемоизированный компонент выбора университета
const UniversitySelectScreen = React.memo(() => (
  <div className={styles.universitySelectContainer} role="main">
    <UniversitySelect />
  </div>
));
UniversitySelectScreen.displayName = 'UniversitySelectScreen';

// Умное кэширование для компонентов
class SmartCache {
  private cache = new Map<string, { content: React.ReactNode; timestamp: number }>();
  private maxAge = 5 * 60 * 1000; // 5 минут
  private maxSize = 10;

  set(key: string, content: React.ReactNode) {
    // Очищаем старые записи
    this.cleanup();
    
    // Удаляем старые записи если превышен лимит
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, { content, timestamp: Date.now() });
  }

  get(key: string): React.ReactNode | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Проверяем не устарел ли элемент
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return item.content;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    }
  }
}

const tabContentCache = new SmartCache();

// Оптимизированные мемоизированные компоненты контента
const GroupsContent = React.memo<{ 
  searchQuery: string; 
  selectedGraphId: string; 
}>(({ searchQuery, selectedGraphId }) => {
  const cacheKey = `groups-${searchQuery}-${selectedGraphId}`;
  
  const cached = tabContentCache.get(cacheKey);
  if (cached) return cached as React.ReactElement;
  
  const content = (
    <AllGraphs 
      searchQuery={searchQuery} 
      selectedGraphId={selectedGraphId} 
    />
  );
  
  tabContentCache.set(cacheKey, content);
  return content;
});
GroupsContent.displayName = 'GroupsContent';

const EventsContent = React.memo<{ 
  searchQuery: string; 
}>(({ searchQuery }) => {
  const cacheKey = `events-${searchQuery}`;
  
  const cached = tabContentCache.get(cacheKey);
  if (cached) return cached as React.ReactElement;
  
  const content = <EventsList searchQuery={searchQuery} />;
  tabContentCache.set(cacheKey, content);
  return content;
});
EventsContent.displayName = 'EventsContent';

const GraphSystemContent = React.memo<{ 
  searchQuery: string; 
}>(({ searchQuery }) => {
  const cacheKey = `graph-${searchQuery}`;
  
  const cached = tabContentCache.get(cacheKey);
  if (cached) return cached as React.ReactElement;
  
  const content = <GraphView searchQuery={searchQuery} />;
  tabContentCache.set(cacheKey, content);
  return content;
});
GraphSystemContent.displayName = 'GraphSystemContent';

const SubsContent = React.memo<{ 
  searchQuery: string; 
  hasSubscriptions: boolean; 
}>(({ searchQuery, hasSubscriptions }) => {
  if (!hasSubscriptions) return null;
  
  const cacheKey = `subs-${searchQuery}`;
  
  const cached = tabContentCache.get(cacheKey);
  if (cached) return cached as React.ReactElement;
  
  const content = <Subs searchQuery={searchQuery} />;
  tabContentCache.set(cacheKey, content);
  return content;
});
SubsContent.displayName = 'SubsContent';

// Мемоизированный компонент контента с умной оптимизацией рендера
const ContentRenderer = React.memo<{
  activeTab: string;
  searchQuery: string;
  selectedGraphId: string;
  hasSubscriptions: boolean;
  mobileOptimization: any;
}>(({ activeTab, searchQuery, selectedGraphId, hasSubscriptions, mobileOptimization }) => {
  const [renderedTabs, setRenderedTabs] = useState<Set<string>>(new Set([activeTab]));
  const { shouldUseAnimations, getMaxPreloadComponents } = mobileOptimization;
  
  // Добавляем новые вкладки в рендер при их активации
  useEffect(() => {
    setRenderedTabs(prev => new Set([...prev, activeTab]));
  }, [activeTab]);
  
  // Умная предзагрузка соседних вкладок
  useEffect(() => {
    const tabOrder = ["groups", "events", "graphSystem", "subs"];
    const currentIndex = tabOrder.indexOf(activeTab);
    
    if (currentIndex !== -1) {
      const maxPreload = getMaxPreloadComponents();
      const preloadTabs: string[] = [];
      
      // Предзагружаем предыдущие и следующие вкладки в зависимости от производительности
      for (let i = 1; i <= Math.floor(maxPreload / 2); i++) {
        if (tabOrder[currentIndex - i]) preloadTabs.push(tabOrder[currentIndex - i]);
        if (tabOrder[currentIndex + i]) preloadTabs.push(tabOrder[currentIndex + i]);
      }
      
      const timer = setTimeout(() => {
        setRenderedTabs(prev => new Set([...prev, ...preloadTabs]));
      }, mobileOptimization.getPreloadDelay());
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, mobileOptimization, getMaxPreloadComponents]);

  const animationClass = shouldUseAnimations() ? '' : styles.noAnimation;

  return (
    <div className={`${styles.contentContainer} ${animationClass}`}>
      {renderedTabs.has("groups") && (
        <div 
          className={activeTab === "groups" ? styles.activeContent : styles.hiddenContent}
          aria-hidden={activeTab !== "groups"}
        >
          <GroupsContent searchQuery={searchQuery} selectedGraphId={selectedGraphId} />
        </div>
      )}
      
      {renderedTabs.has("events") && (
        <div 
          className={activeTab === "events" ? styles.activeContent : styles.hiddenContent}
          aria-hidden={activeTab !== "events"}
        >
          <EventsContent searchQuery={searchQuery} />
        </div>
      )}
      
      {renderedTabs.has("graphSystem") && (
        <div 
          className={activeTab === "graphSystem" ? styles.activeContent : styles.hiddenContent}
          aria-hidden={activeTab !== "graphSystem"}
        >
          <GraphSystemContent searchQuery={searchQuery} />
        </div>
      )}
      
      {renderedTabs.has("subs") && hasSubscriptions && (
        <div 
          className={activeTab === "subs" ? styles.activeContent : styles.hiddenContent}
          aria-hidden={activeTab !== "subs"}
        >
          <SubsContent searchQuery={searchQuery} hasSubscriptions={hasSubscriptions} />
        </div>
      )}
    </div>
  );
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

  const mobileOptimization = useMobileOptimization({ activeTab });

  // Запускаем адаптивную предзагрузку компонентов
  useEffect(() => {
    if (hasSelectedGraph) {
      preloadComponents(mobileOptimization);
    }
  }, [hasSelectedGraph, mobileOptimization]);

  // Early return для экрана выбора университета
  if (!hasSelectedGraph) {
    return <UniversitySelectScreen />;
  }

  return (
    <main className={styles.homepage}>
      {/* Шапка: Табы + Поиск */}
      <header className={styles.headerPart}>
        <Suspense fallback={<div className={styles.tabsSkeleton} />}>
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            showSearch={showSearch}
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
          />
        </Suspense>
      </header>

      {/* Контент в зависимости от активного таба */}
      <section className={styles.contentWrapper}>
        <Suspense fallback={<SpinnerLoader />}>
          <ContentRenderer
            activeTab={activeTab}
            searchQuery={searchQuery}
            selectedGraphId={selectedGraphId}
            hasSubscriptions={!!hasSubscriptions}
            mobileOptimization={mobileOptimization}
          />
        </Suspense>
      </section>
    </main>
  );
});

Homepage.displayName = 'Homepage';

export default Homepage;
