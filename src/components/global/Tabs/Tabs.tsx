"use client";

import React, { FC, memo, useCallback, useRef, useEffect, useState, KeyboardEvent } from "react";
import clsx from "clsx";
import { Search } from "lucide-react";
import styles from "./Tabs.module.scss";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobileNav from "@/components/global/MobileNav/MobileNav";
import { useClickOutside } from "@/hooks/useClickOutside";

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
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

const Tabs: FC<TabsProps> = ({ 
  tabs, 
  activeTab, 
  setActiveTab, 
  ariaLabel = "Navigation Tabs",
  showSearch = false,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = activeTab === "events" ? "Поиск по событиям" : activeTab === "groups" ? "Поиск по группам" : activeTab === "graphSystem" ? "Поиск по графам" : "Поиск по подпискам"
}) => {
  const isMobile = useMediaQuery("(max-width: 680px)");
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

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      searchRef.current?.focus();
    }
  }, [isSearchOpen]);

  const onToggleSearch = useCallback(() => {
    setIsSearchOpen((v) => !v);
  }, []);

  useClickOutside(searchWrapRef, () => {
    if (!isSearchOpen) return;
    setIsSearchOpen(false);
    onSearchChange?.("");
  }, isSearchOpen);

  const searchInput = (
    <div ref={searchWrapRef} className={clsx(styles.searchWrapper, { [styles.open]: isSearchOpen })}>
      <button
        type="button"
        className={styles.searchButton}
        aria-label={isSearchOpen ? "Закрыть поиск" : "Открыть поиск"}
        onClick={onToggleSearch}
      >
        <Search size={18} />
      </button>
      <input
        ref={searchRef}
        type="text"
        className={styles.searchInput}
        placeholder={isSearchOpen ? searchPlaceholder : ""}
        value={searchValue}
        onChange={(e) => onSearchChange?.(e.target.value)}
        aria-label={searchPlaceholder}
      />
    </div>
  );

  if (isMobile) {
    return (
        <MobileNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
        />
    );
  }

  return (
    <div className={styles.tabWrapper}>
      <div 
        className={styles.tabHeader} 
        role="tablist"
        aria-label={ariaLabel}
      >
        <div className={styles.tabList}>
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
        {showSearch && onSearchChange && searchInput}
      </div>
    </div>
  );
};

export default memo(Tabs);