"use client";

import React, { FC, memo, useCallback } from "react";
import clsx from "clsx";
import styles from "./Tabs.module.scss";

interface Tab {
  name: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Tabs: FC<TabsProps> = ({ tabs, activeTab, setActiveTab }) => {
  const handleTabClick = useCallback((name: string) => () => setActiveTab(name), [setActiveTab]);

  const activeIndex = tabs.findIndex((tab) => tab.name === activeTab);

  return (
    <div className={styles.tabWrapper}>
      <div className={styles.tabHeader} style={{ "--tab-count": tabs.length } as React.CSSProperties}>
        {tabs.map(({ name, label }) => (
          <button
            key={name}
            className={clsx(styles.tabItem, { [styles.selected]: activeTab === name })}
            onClick={handleTabClick(name)}
          >
            <span className={styles.tabName}>{label}</span>
          </button>
        ))}
        {/* Индикатор активного таба (в крайних положениях) */}
        <div className={styles.tabIndicator} style={{ "--active-index": activeIndex } as React.CSSProperties} />
      </div>
    </div>
  );
};

export default memo(Tabs);
