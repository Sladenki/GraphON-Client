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

  return (
    <div className={styles.tabWrapper}>
      <div className={styles.tabHeader}>
        {tabs.map(({ name, label }) => (
          <button
            key={name}
            className={clsx(styles.tabItem, { [styles.selected]: activeTab === name })}
            onClick={handleTabClick(name)}
          >
            <span className={styles.tabName}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default memo(Tabs);
