'use client'

import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';
import GraphSwitcher from '../GraphSwitcher/GraphSwitcher';
import styles from './MobileTopBar.module.scss';

const MobileTopBar: React.FC = () => {
  const { user, isLoggedIn } = useAuth();

  return (
    <div className={styles.topBar}>
      {/* Центральная часть - переключатель университетов */}
      <div className={styles.centerSection}>
        <GraphSwitcher />
      </div>

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

export default MobileTopBar;

