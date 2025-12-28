'use client'

import React, { useState } from 'react';
import { Bell, Settings } from 'lucide-react';
import GraphSwitcher from '../GraphSwitcher/GraphSwitcher';
import MorePopup from '../MorePopup/MorePopup';
import styles from './MobileTopBar.module.scss';

const MobileTopBar: React.FC = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <>
      <div className={styles.topBar}>
        <div className={styles.left}>
          <div className={styles.graphSwitcherWrapper}>
            <GraphSwitcher />
          </div>
        </div>

        <div className={styles.right}>
          <button type="button" className={styles.iconBtn} aria-label="Уведомления">
            <Bell size={18} strokeWidth={1.5} />
          </button>
          <button 
            type="button" 
            className={styles.iconBtn} 
            aria-label="Настройки"
            onClick={() => setIsMoreOpen(true)}
          >
            <Settings size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Popup "Еще" под иконкой шестерёнки */}
      <MorePopup isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </>
  );
};

export default MobileTopBar;

