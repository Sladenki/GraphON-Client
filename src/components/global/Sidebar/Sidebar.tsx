"use client";

import React, { useMemo } from 'react'
import Link from 'next/link'
import styles from './Sidebar.module.scss'

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { CITY_GRAPH_ID, CITY_ROUTE, GRAPHS_ROUTE, profileSubMenu, sidebar } from '@/constants/sidebar';
import { useAuth } from '@/providers/AuthProvider';
import { MapPinned, User, FileText, HelpCircle } from 'lucide-react';

import RenderMenuList from './RenderMenuList/RenderMenuList';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { Logo } from '../Logo';
import { useSelectedGraphId } from '@/stores/useUIStore';


const Sidebar: React.FC<{}> = ({}) => {

  const small = useMediaQuery('(max-width: 1000px)')
  const { user, isLoggedIn } = useAuth();
  const storeSelectedGraphId = useSelectedGraphId();

  const normalizeGraphId = (raw: any): string | null => {
    if (!raw) return null;
    if (typeof raw === 'string') return raw;
    if (typeof raw === 'object') {
      return raw._id ?? raw.$oid ?? null;
    }
    return null;
  };

  const effectiveGraphId = storeSelectedGraphId || normalizeGraphId(user?.selectedGraphId);
  const isCityGraph = effectiveGraphId === CITY_GRAPH_ID;
  const baseNavigationItems = useMemo(() => {
    return sidebar.map((item) => {
      if (item.path !== GRAPHS_ROUTE) return item;
      return {
        ...item,
        title: isCityGraph ? 'Город' : 'Графы',
        path: isCityGraph ? CITY_ROUTE : GRAPHS_ROUTE,
        icon: isCityGraph
          ? <MapPinned color="rgb(var(--main-Color))" size={21} strokeWidth={1} />
          : item.icon,
      };
    });
  }, [isCityGraph]);

  const computedItems = useMemo(() => {
    const items = [...baseNavigationItems];

    // Профиль + подпункты (Друзья, Уведомления) — только для авторизованных
    if (isLoggedIn) {
      items.push({
        id: 99,
        icon: <User color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />,
        title: 'Профиль',
        forAuthUsers: true,
        path: '/profile',
      } as any);
      profileSubMenu.forEach((it) => items.push(it as any));
    }

    return items;
  }, [baseNavigationItems, isLoggedIn]);

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
          <Link href="/help" className={styles.helpLink}>
            <HelpCircle size={14} />
            <span>Помощь</span>
          </Link>
          <Link href="/docs" className={styles.docsLink}>
            <FileText size={14} />
            <span>Документы</span>
          </Link>
        </div>
      )}

    </div>
  )
}


export default Sidebar