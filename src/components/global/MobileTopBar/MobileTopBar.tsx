'use client'

import React, { useState } from 'react';
import { Bell, User, Settings } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';
import GraphSwitcher from '../GraphSwitcher/GraphSwitcher';
import MorePopup from '../MorePopup/MorePopup';
import styles from './MobileTopBar.module.scss';

const MobileTopBar: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const initial =
    user?.firstName?.[0] ||
    user?.lastName?.[0] ||
    user?.username?.[0] ||
    'U';

  return (
    <>
      <div className={styles.topBar}>
        <div className={styles.left}>
          {isLoggedIn && user ? (
            <Link href="/profile" className={styles.avatar}>
              {user.avaPath ? (
                <img 
                  src={user.avaPath} 
                  alt={user.username || 'Пользователь'}
                  className={styles.avatarImage}
                />
              ) : (
                <span className={styles.avatarInitial}>{initial}</span>
              )}
            </Link>
          ) : (
            <Link href="/signIn" className={styles.signInPill}>
              <User size={18} />
              <span>Войти</span>
            </Link>
          )}
        </div>

        <div className={styles.centerSection}>
          <GraphSwitcher />
        </div>

        <div className={styles.right}>
          <button type="button" className={styles.iconBtn} aria-label="Уведомления">
            <Bell size={18} />
          </button>
          <button 
            type="button" 
            className={styles.iconBtn} 
            aria-label="Настройки"
            onClick={() => setIsMoreOpen(true)}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Popup "Еще" под иконкой шестерёнки */}
      <MorePopup isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </>
  );
};

export default MobileTopBar;

