"use client";

import React from 'react'
import Link from 'next/link'
import styles from './Sidebar.module.scss'

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { sidebar } from '@/constants/sidebar';
import { useAuth } from '@/providers/AuthProvider';
import { Settings, User } from 'lucide-react';

import RenderMenuList from './RenderMenuList/RenderMenuList';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { Logo } from '../Logo';


const Sidebar: React.FC<{}> = ({}) => {

  const small = useMediaQuery('(max-width: 1000px)')
  const { user, isLoggedIn } = useAuth();
  // Определяем доступ к управлению: если у пользователя есть непустой список managed_graph_id
  const hasManageAccess = (() => {
    if (!user) return false;
    const anyUser: any = user as any;
    const managedIds = anyUser?.managed_graph_id ?? anyUser?.managedGraphIds ?? [];
    return Array.isArray(managedIds) && managedIds.length > 0;
  })();

  const computedItems = (() => {
    const items = [...sidebar];
    
    // Добавляем профиль для авторизованных пользователей
    if (isLoggedIn) {
      const profileItem = {
        id: 99,
        icon: <User color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />,
        title: 'Профиль',
        forAuthUsers: true,
        path: '/profile'
      };
      items.push(profileItem);
    }
    
    if (hasManageAccess) {
      const manageItem = {
        id: 98,
        icon: <Settings color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />,
        title: 'Управление',
        forAuthUsers: true,
        path: '/manage/'
      };
      const createIndex = items.findIndex((it) => it.path === '/admin/');
      if (createIndex !== -1) {
        items.splice(createIndex, 0, manageItem);
      } else {
        items.push(manageItem);
      }
    }
    return items;
  })();

  return (
    <div className={styles.sidebar}>
      {/* Название проекта - отображается только на ПК */}
      {!small && (
        <div className={styles.projectTitle}>
          <Logo width={130} height={20} />
        </div>
      )}
        
      <div className={styles.RenderMenuList}>
        <RenderMenuList arrayItems={computedItems} small={small}  />
      </div>
     

      {/* Футер с кнопкой входа и переключателем темы - только на ПК */}
      {!small && (
        <div className={styles.footer}>
          {!isLoggedIn && (
            <Link href="/signIn" className={styles.signInLink}>
              Войти в аккаунт
            </Link>
          )}
          <div className={styles.themeToggleContainer}>
            <ThemeToggle size="sm" />
          </div>
        </div>
      )}

    </div>
  )
}


export default Sidebar