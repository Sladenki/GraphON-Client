'use client';

import React from 'react';
import styles from './PillTabs.module.scss';

export type PillTabKey = string | number;

export interface PillTabOption {
  key: PillTabKey;
  label: string;
  badge?: string | number;
}

interface PillTabsProps {
  options: PillTabOption[];
  activeKey: PillTabKey;
  onChange: (key: PillTabKey) => void;
  className?: string;
  'aria-label'?: string;
}

const PillTabs: React.FC<PillTabsProps> = ({ options, activeKey, onChange, className = '', 'aria-label': ariaLabel }) => {
  return (
    <div className={`${styles.rail} ${className}`} role="tablist" aria-label={ariaLabel}>
      {options.map((opt) => {
        const isActive = opt.key === activeKey;
        return (
          <button
            key={opt.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            onClick={() => onChange(opt.key)}
          >
            <span>{opt.label}</span>
            {opt.badge !== undefined ? <span className={styles.badge}>{opt.badge}</span> : null}
          </button>
        );
      })}
    </div>
  );
};

export default PillTabs;

