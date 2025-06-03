"use client";

import React, { FC, memo, useCallback, useRef, useEffect, KeyboardEvent } from "react";
import clsx from "clsx";
import styles from "./Tabs.module.scss";

interface Tab {
  name: string;
  label: string;
  icon?: React.ReactNode; // Опциональная иконка для таба
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  ariaLabel?: string; // Добавляем aria-label для доступности
}

const Tabs: FC<TabsProps> = ({ 
  tabs, 
  activeTab, 
  setActiveTab, 
  ariaLabel = "Navigation Tabs" 
}) => {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = tabs.findIndex((tab) => tab.name === activeTab);

  const handleTabClick = useCallback((name: string) => () => {
    setActiveTab(name);
  }, [setActiveTab]);

  // Обработка клавиатурной навигации
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = tabs.length - 1;
    let newIndex = index;

    switch (event.key) {
      case 'ArrowLeft':
        newIndex = index === 0 ? lastIndex : index - 1;
        break;
      case 'ArrowRight':
        newIndex = index === lastIndex ? 0 : index + 1;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = lastIndex;
        break;
      default:
        return;
    }

    event.preventDefault();
    const newTab = tabs[newIndex];
    setActiveTab(newTab.name);
    tabsRef.current[newIndex]?.focus();
  }, [tabs, setActiveTab]);

  // Автофокус на активный таб при первом рендере
  useEffect(() => {
    if (activeIndex >= 0) {
      tabsRef.current[activeIndex]?.focus();
    }
  }, []);

  return (
    <div className={styles.tabWrapper}>
      <div 
        className={styles.tabHeader} 
        role="tablist"
        aria-label={ariaLabel}
      >
        {tabs.map(({ name, label, icon }, index) => (
          <button
            key={name}
            ref={(el: HTMLButtonElement | null) => {
              tabsRef.current[index] = el;
            }}
            role="tab"
            aria-selected={activeTab === name}
            aria-controls={`panel-${name}`}
            id={`tab-${name}`}
            tabIndex={activeTab === name ? 0 : -1}
            className={clsx(styles.tabItem, { [styles.selected]: activeTab === name })}
            onClick={handleTabClick(name)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            <span className={styles.tabName}>
              {icon && <span className={styles.tabIcon}>{icon}</span>}
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default memo(Tabs);
