'use client'

import { useState, useEffect } from 'react';
import Sidebar from "@/components/global/Sidebar/Sidebar";
import styles from './layout.module.scss'
import BottomMenu from "@/components/global/BottomMenu/BottomMenu";
import MobileDrawer from "@/components/global/MobileDrawer/MobileDrawer";
import TopPanel from "@/components/global/TopPanel/TopPanel";
import { AllProvers } from "@/providers/main";
import type { Metadata } from 'next';
import { inter, orbitron } from "@/app/fonts";
import '../../styles/globals.scss'
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Toaster } from "sonner";
import { HeroUIProvider } from "@heroui/react";
import { Providers } from '../providers';
import { UniversitySelect } from '@/components/global/UniversitySelect/UniversitySelect';
import { useSelectedGraphId } from '@/stores/useUIStore';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';

// Fonts are configured in server file src/app/fonts.ts

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {

  const small = useMediaQuery('(max-width: 650px)')
  const selectedGraphId = useSelectedGraphId();
  const [isHydrated, setIsHydrated] = useState(false);

  // Ждем пока Zustand загрузит данные из localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Показываем лоадер пока загружаются данные из localStorage
  if (!isHydrated) {
    return (
      <html lang="ru" className={`${inter.variable} ${orbitron.variable}`}>
        <head>
          <title>GraphON</title>
        </head>
        <body className={inter.className}>
          <Providers>
            <div style={{ 
              minHeight: '100vh', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'var(--background-color)'
            }}>
              <SpinnerLoader />
            </div>
          </Providers>
        </body>
      </html>
    );
  }

  return (
    <html lang="ru" className={`${inter.variable} ${orbitron.variable}`}>
      <head>
        <title>GraphON</title>
      </head>
      <body className={inter.className}>
        <Providers>
          <HeroUIProvider>
            <Toaster position="top-right" richColors />

            {/* Если университет не выбран - показываем экран выбора */}
            {!selectedGraphId ? (
              <div className={styles.universitySelectWrapper}>
                <UniversitySelect />
              </div>
            ) : (
              <div className={styles.wrapper}>
                <AllProvers>
                  {/* Top Panel - только для мобильных */}
                  {small && <TopPanel />}

                  {/* Mobile Drawer - только для мобильных */}
                  {small ? (
                    <MobileDrawer>
                      <div className={styles.main}>
                        <div className={styles.content}>
                          {children}
                        </div>
                      </div>
                    </MobileDrawer>
                  ) : (
                    <>
                      {/* Sidebar - только для десктопа */}
                      <div className={styles.sidebar}>
                        <Sidebar/>
                      </div>
                      
                      {/* Основная страница */}
                      <div className={styles.main}>
                        <div className={styles.content}>
                          {children}
                        </div>
                      </div>
                    </>
                  )}

                  <div className={styles.BottomMenu}>
                    <BottomMenu/>
                  </div>
                    
                </AllProvers>
              </div>
            )}
          </HeroUIProvider>
        </Providers>
      </body>
    </html>
  );
}