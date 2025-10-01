'use client'

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
import ProfileCorner from "@/components/global/ProfileCorner/ProfileCorner";
import { Providers } from '../providers';

// Fonts are configured in server file src/app/fonts.ts

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {

  const small = useMediaQuery('(max-width: 650px)')

  return (
    <html lang="ru" className={`${inter.variable} ${orbitron.variable}`}>
      <head>
        <title>GraphON</title>
      </head>
      <body className={inter.className}>
        <Providers>
          <HeroUIProvider>
            <Toaster position="top-right" richColors /> 

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
                    
                    {/* Ава в углу */}
                    <div className={styles.profileCorner}>
                      <ProfileCorner/>
                    </div>
                  </>
                )}

                <div className={styles.BottomMenu}>
                  <BottomMenu/>
                </div>
                  
              </AllProvers>
            </div>
          </HeroUIProvider>
        </Providers>
      </body>
    </html>
  );
}