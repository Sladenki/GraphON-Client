"use client";

import React from "react";
import styles from './BottomMenu.module.scss'

import Link from "next/link";

import { sidebarMobile } from "@/constants/sidebar";
import { usePathname } from 'next/navigation';
import { useAuth } from "@/providers/AuthProvider";

const BottomMenu = () => {

  const { isLoggedIn } = useAuth();

  const pathname  = usePathname()

  return (
    <div className={styles.BottomSidebarWrapper}>
      <div className={styles.listMenu}>
          
        {sidebarMobile.map(({ id, icon, title, forAuthUsers, path }) => {

          // Проверяем, нужно ли отображать вкладку
          const shouldRender = !forAuthUsers || (forAuthUsers && isLoggedIn);

            return shouldRender ?(
              <Link key={id} href={path}>
                <div className={styles.listLine}>
                  <span className={pathname === path ? styles.icon : undefined}>{icon}</span>
                  <span className={pathname === path ? styles.active : undefined}>{title}</span>
                </div>
              </Link>
            ) : null
        })}


      </div>

    </div>
  );
};

export default BottomMenu;