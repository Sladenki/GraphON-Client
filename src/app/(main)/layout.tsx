'use client'

import { useState, useEffect } from 'react';
import Sidebar from "@/components/global/Sidebar/Sidebar";
import styles from './layout.module.scss'
import BottomMenu from "@/components/global/BottomMenu/BottomMenu";
import MobileDrawer from "@/components/global/MobileDrawer/MobileDrawer";
import TopPanel from "@/components/global/TopPanel/TopPanel";
import { AllProvers } from "@/providers/main";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Toaster } from "sonner";
import { HeroUIProvider } from "@heroui/react";
import { Providers } from '../providers';
import { UniversitySelect } from '@/components/global/UniversitySelect/UniversitySelect';
import { useSelectedGraphId } from '@/stores/useUIStore';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {

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
    );
  }

  return (
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
  );
}