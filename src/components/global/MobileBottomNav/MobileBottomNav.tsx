"use client";

import React, { useState, useMemo } from "react";
import styles from "./MobileBottomNav.module.scss";
import Link from "next/link";
import { Newspaper, CalendarCheck2, Users, MoreHorizontal } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { UserRole } from "@/types/user.interface";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import CentralActionButton from "../CentralActionButton/CentralActionButton";
import MorePopup from "../MorePopup/MorePopup";

const MobileBottomNav: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 1000px)');
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Определяем доступ к админке
  const hasAdminAccess = user?.role !== UserRole.User;

  // Пункты навигации
  const navItems = useMemo(() => {
    const items = [
      {
        id: 'events',
        icon: <Newspaper size={20} strokeWidth={1.8} />,
        title: 'Мероприятия',
        path: '/events/',
        forAuthUsers: false,
      },
      {
        id: 'schedule',
        icon: <CalendarCheck2 size={20} strokeWidth={1.8} />,
        title: 'Расписание',
        path: '/schedule/',
        forAuthUsers: true,
      },
      {
        id: 'groups',
        icon: <Users size={20} strokeWidth={1.8} />,
        title: 'Группы',
        path: '/groups/',
        forAuthUsers: false,
      },
    ];

    return items.filter(({ forAuthUsers, path }) => {
      // Базовая проверка авторизации
      let shouldInclude = !forAuthUsers || isLoggedIn;

      // Для админки проверяем роль пользователя
      if (path === '/admin/' && !hasAdminAccess) {
        shouldInclude = false;
      }

      return shouldInclude;
    });
  }, [isLoggedIn, hasAdminAccess]);

  if (!isMobile) return null;

  return (
    <>
      <nav className={styles.bottomNav} role="navigation" aria-label="Bottom navigation">
        <ul className={styles.navList}>
          {/* Мероприятия */}
          <li className={styles.navItem}>
            <Link 
              href="/events/" 
              className={`${styles.navLink} ${pathname === '/events/' ? styles.active : ""}`} 
              aria-label="Мероприятия" 
              aria-current={pathname === '/events/' ? "page" : undefined}
            >
              <span className={styles.iconWrapper}>
                <Newspaper size={18} strokeWidth={1.5} />
              </span>
              <span className={styles.srOnly}>Мероприятия</span>
            </Link>
          </li>

          {/* Расписание */}
          <li className={styles.navItem}>
            <Link 
              href="/schedule/" 
              className={`${styles.navLink} ${pathname === '/schedule/' ? styles.active : ""}`} 
              aria-label="Расписание" 
              aria-current={pathname === '/schedule/' ? "page" : undefined}
            >
              <span className={styles.iconWrapper}>
                <CalendarCheck2 size={18} strokeWidth={1.5} />
              </span>
              <span className={styles.srOnly}>Расписание</span>
            </Link>
          </li>

          {/* Центральная кнопка */}
          <li className={styles.navItem}>
            <div className={styles.centralButtonWrapper}>
              <CentralActionButton />
            </div>
          </li>

          {/* Группы */}
          <li className={styles.navItem}>
            <Link 
              href="/groups/" 
              className={`${styles.navLink} ${pathname === '/groups/' ? styles.active : ""}`} 
              aria-label="Группы" 
              aria-current={pathname === '/groups/' ? "page" : undefined}
            >
              <span className={styles.iconWrapper}>
                <Users size={18} strokeWidth={1.5} />
              </span>
              <span className={styles.srOnly}>Группы</span>
            </Link>
          </li>

          {/* Еще */}
          <li className={styles.navItem}>
            <button
              className={`${styles.navLink} ${styles.moreButton} ${isMoreOpen ? styles.active : ""}`}
              onClick={() => setIsMoreOpen(true)}
              aria-label="Еще"
            >
              <span className={styles.iconWrapper}>
                <MoreHorizontal size={18} strokeWidth={1.5} />
              </span>
              <span className={styles.srOnly}>Еще</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Popup "Еще" */}
      <MorePopup isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </>
  );
};

export default MobileBottomNav;

