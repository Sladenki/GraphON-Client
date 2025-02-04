'use client'

import Sidebar from "@/components/Sidebar/Sidebar";
import styles from './layout.module.scss'
import BottomMenu from "@/components/Sidebar/BottomMenu/BottomMenu";
import { AllProvers } from "@/providers/main";
import { ProfileCorner } from "@/components/ProfileCorner/ProfileCorner";

import '../styles/globals.scss'
import { useMediaQuery } from "@/hooks/useMediaQuery";


export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {

  const small = useMediaQuery(650)

  return (
    <html lang="en">
      <head>
        <title>GraphON</title>
      </head>
      <body className={styles.wrapper}>
        <AllProvers>
          
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
          {!small && (
            <div className={styles.profileCorner}>
              <ProfileCorner/>
            </div>
          )}

          <div className={styles.BottomMenu}>
            <BottomMenu/>
          </div>
            
        </AllProvers>
      </body>
    </html>
  );
}
