"use client";

import React, { useMemo } from "react";
import styles from "./BottomMenu.module.scss";
import Link from "next/link";
import { bottomMenuItems } from "@/constants/sidebar";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { UserRole } from "@/types/user.interface";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const BottomMenu: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 1000px)');

  // Определяем доступ к управлению
  const hasManageAccess = (() => {
    if (!user) return false
    const anyUser: any = user as any
    const managedIds = anyUser?.managed_graph_id ?? anyUser?.managedGraphIds ?? []
    return Array.isArray(managedIds) && managedIds.length > 0
  })()

  const menuItems = useMemo(() => {
    return bottomMenuItems.filter(({ forAuthUsers, path }) => {
      // Базовая проверка авторизации
      let shouldInclude = !forAuthUsers || isLoggedIn;

      // Для админки проверяем роль пользователя
      if (path === '/admin/' && user?.role === UserRole.User) {
        shouldInclude = false;
      }

      return shouldInclude;
    });
  }, [isLoggedIn, user]);

  if (isMobile && !isLoggedIn) return null;

  return (
    <nav className={styles.bottomSidebarWrapper} role="navigation" aria-label="Bottom navigation">
      <ul className={styles.listMenu}>
        {menuItems.map(({ id, icon, title, path }) => {
          const isActive = pathname === path;

          return (
            <li key={id} className={styles.listItem}>
              <Link href={path} className={`${styles.link} ${isActive ? styles.active : ""}`} aria-label={title} aria-current={isActive ? "page" : undefined} title={title}>
                <span className={styles.iconWrapper}>
                  <span className={styles.icon}>{icon}</span>
                </span>
                <span className={styles.srOnly}>{title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomMenu;

