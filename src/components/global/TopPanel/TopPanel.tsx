'use client'

import React from 'react';
import { Menu, User } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useUIStore } from '@/stores/useUIStore';
import Link from 'next/link';
import styles from './TopPanel.module.scss';

const TopPanel: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const { setMobileNavOpen } = useUIStore();

  const handleMenuClick = () => {
    setMobileNavOpen(true);
  };

  return (
    <div className={styles.topPanel}>
      {/* Левая часть - кнопка меню */}
      <button 
        className={styles.menuButton}
        onClick={handleMenuClick}
        aria-label="Открыть меню"
      >
        <Menu size={24} />
      </button>

      {/* Правая часть - аватарка пользователя */}
      <div className={styles.userSection}>
        {isLoggedIn && user ? (
          <Link href="/profile" className={styles.userAvatar}>
            {user.avaPath ? (
              <img 
                src={user.avaPath} 
                alt={user.username || 'Пользователь'}
                className={styles.avatarImage}
              />
            ) : (
              <div className={styles.avatarFallback}>
                <User size={20} />
              </div>
            )}
          </Link>
        ) : (
          <Link href="/signIn" className={styles.signInButton}>
            <User size={20} />
            <span>Войти</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default TopPanel;
