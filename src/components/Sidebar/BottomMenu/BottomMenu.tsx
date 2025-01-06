"use client";

import React from "react";
import styles from './BottomMenu.module.scss'

import Link from "next/link";

import { sidebarMobile } from "@/constants/sidebar";
import { usePathname } from 'next/navigation';

const BottomMenu = () => {


    const pathname  = usePathname()

  return (
    <div className={styles.BottomSidebarWrapper}>
        <div className={styles.listMenu}>
          
          {
            sidebarMobile.map(({ id, icon, title, path }) => (
            
          
                  <Link key={id} href={path}>
                    <div className={styles.listLine}>
                      <span className={pathname === path ? styles.icon : undefined}>{icon}</span>
                      <span className={pathname === path ? styles.active : undefined}>{title}</span>
                    </div>
                  </Link>
                
    
            ))
          }

          
        </div>




    </div>
  );
};

export default BottomMenu;