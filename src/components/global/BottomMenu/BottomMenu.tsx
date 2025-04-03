"use client";

import React, { useMemo } from "react";
import styles from "./BottomMenu.module.scss";
import Link from "next/link";
import { sidebarMobile } from "@/constants/sidebar";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

const BottomMenu: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();

  // Фильтрация элементов меню
  const menuItems = useMemo(
    () => sidebarMobile.filter(({ forAuthUsers }) => !forAuthUsers || isLoggedIn),
    [isLoggedIn]
  );

  return (
    <nav className={styles.bottomSidebarWrapper}>
      <ul className={styles.listMenu}>
        {menuItems.map(({ id, icon, title, path }) => {
          const isActive = pathname === path;
          return (
            <li key={id} className={styles.listItem}>
              <Link href={path} className={`${styles.link} ${isActive ? styles.active : ""}`}>
                <span className={styles.icon}>{icon}</span>
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
