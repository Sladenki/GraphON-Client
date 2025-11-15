"use client";

import React, { useMemo } from "react";
import styles from "./BottomMenu.module.scss";
import Link from "next/link";
import { CITY_GRAPH_ID, CITY_ROUTE, GRAPHS_ROUTE, bottomMenuItems } from "@/constants/sidebar";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { UserRole } from "@/types/user.interface";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSelectedGraphId } from "@/stores/useUIStore";
import { MapPinned } from "lucide-react";

const BottomMenu: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 1000px)');
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

  // Определяем доступ к управлению
  const hasManageAccess = (() => {
    if (!user) return false
    const anyUser: any = user as any
    const managedIds = anyUser?.managed_graph_id ?? anyUser?.managedGraphIds ?? []
    return Array.isArray(managedIds) && managedIds.length > 0
  })()

  const graphAwareItems = useMemo(() => {
    return bottomMenuItems.map((item) => {
      if (item.path !== GRAPHS_ROUTE) return item;
      return {
        ...item,
        title: isCityGraph ? 'Город' : 'Графы',
        path: isCityGraph ? CITY_ROUTE : GRAPHS_ROUTE,
        icon: isCityGraph
          ? <MapPinned color="rgb(var(--main-Color))" size={18} strokeWidth={0.9} />
          : item.icon,
      };
    });
  }, [isCityGraph]);

  const menuItems = useMemo(() => {
    return graphAwareItems.filter(({ forAuthUsers, path }) => {
      // Базовая проверка авторизации
      let shouldInclude = !forAuthUsers || isLoggedIn;

      // Для админки проверяем роль пользователя
      if (path === '/admin/' && user?.role === UserRole.User) {
        shouldInclude = false;
      }

      return shouldInclude;
    });
  }, [graphAwareItems, isLoggedIn, user]);

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

