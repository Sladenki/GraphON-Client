"use client";

import React, { useMemo } from "react";
import styles from "./BottomMenu.module.scss";
import Link from "next/link";
import { sidebarMobile } from "@/constants/sidebar";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { UserRole } from "@/types/user.interface";

const BottomMenu: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const pathname = usePathname();
  const showProfileBadge = isLoggedIn && !user?.selectedGraphId;

  const menuItems = useMemo(() => {
    return sidebarMobile.filter(({ forAuthUsers, path }) => {
      // Базовая проверка авторизации
      let shouldInclude = !forAuthUsers || isLoggedIn;

      // 🔐 Дополнительное ограничение для "Создать"
      if (path === '/createPost/' && user?.role === UserRole.User) {
        shouldInclude = false;
      }

      return shouldInclude;
    });
  }, [isLoggedIn, user]);

  return (
    <nav className={styles.bottomSidebarWrapper}>
      <ul className={styles.listMenu}>
        {menuItems.map(({ id, icon, title, path }) => {
          const isActive = pathname === path;

          return (
            <li key={id} className={styles.listItem}>
              <Link href={path} className={`${styles.link} ${isActive ? styles.active : ""}`}>
                <span className={styles.iconWrapper}>
                  <span className={styles.icon}>{icon}</span>
                  {showProfileBadge && path === '/profile/' && (
                    <span className={styles.iconBadge} aria-hidden="true" />
                  )}
                </span>
                {/* <span className={styles.title}>{title}</span> */}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomMenu;

