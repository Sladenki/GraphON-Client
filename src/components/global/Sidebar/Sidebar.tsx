"use client";

import React from 'react'
import Link from 'next/link'

import styles from './Sidebar.module.scss'

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { sidebar } from '@/constants/sidebar';
import { useAuth } from '@/providers/AuthProvider';
import { Settings } from 'lucide-react';

import RenderMenuList from './RenderMenuList/RenderMenuList';


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
    if (hasManageAccess) {
      const manageItem = {
        id: 98,
        icon: <Settings color="rgb(var(--main-Color))" size={24} strokeWidth={0.9} />,
        title: 'Управление',
        forAuthUsers: true,
        path: '/manage/'
      };
      const createIndex = items.findIndex((it) => it.path === '/createPost/');
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
          GraphON
          <div className={styles.betaLabel}>
            Альфа версия
          </div>
        </div>
      )}
        
      {/* @ts-expect-error типизация */}
      <RenderMenuList arrayItems={computedItems} small={small}  />

      {/* Футер с кнопкой входа - только на ПК и для неавторизованных */}
      {!small && !isLoggedIn && (
        <div className={styles.footer}>
          <Link href="/signIn" className={styles.signInLink}>
            Войти в аккаунт
          </Link>
        </div>
      )}

      {/* Информация о пользователе - только на ПК и для авторизованных */}
      {!small && isLoggedIn && (
        <div className={styles.footer}>
          <div className={styles.userInfo}>
            Привет, {user?.username || 'пользователь'}!
          </div>
        </div>
      )}

    </div>
  )
}


export default Sidebar