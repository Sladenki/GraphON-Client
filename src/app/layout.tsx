'use client'

import type { Metadata } from "next";
import '../styles/globals.scss'

import Sidebar from "@/components/Sidebar/Sidebar";

import styles from './layout.module.scss'

import BottomMenu from "@/components/Sidebar/BottomMenu/BottomMenu";
import { AllProvers } from "@/providers/main";
import { ProfileCorner } from "@/components/ProfileCorner/ProfileCorner";

import { CapacitorRedirectHandler } from "@/hooks/useAppUrlOpen";
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import LoginButton from "@/components/ProfileCorner/LoginButton/LoginButton";

// export const metadata: Metadata = {
//   title: "Sendler",
//   description: "Social media app built with Next.js",
// };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {

  // useEffect(() => {
  //   App.addListener('appUrlOpen', data => {
  //       const url = new URL(data.url);
  //       const accessToken = url.searchParams.get('accessToken');
  //       if (accessToken) {
  //           // Обработка accessToken, например, сохранение в localStorage
  //           localStorage.setItem('accessToken', accessToken);
  //           // Перенаправление на нужную страницу
  //           window.location.href = `/profile?accessToken=${accessToken}`;
  //       }
  //   });
  // }, []);

  return (
    <html lang="en">
      <body className={styles.wrapper}>
        <AllProvers>
          {/* <CapacitorRedirectHandler /> */}

          {/* Sidebar */}
          <div className={styles.sidebar}>
              <Sidebar/>
          </div>
          
          {/* Основная страница */}
          <div className={styles.main}>

            <div className={styles.roundCorners}/>
            
            <div className={styles.square}>
              {children}
            </div>
            
          </div>
          
          {/* Ава в углу */}
          <div className={styles.profileCorner}>
            <ProfileCorner/>
          </div>

          <div className={styles.BottomMenu}>
            <BottomMenu/>
          </div>
            
        </AllProvers>
      </body>
    </html>
  );
}
