import type { Metadata } from "next";
import '../styles/globals.scss'

// import Sidebar from "@/components/Sidebar/Sidebar";

import styles from './layout.module.scss'

import BottomMenu from "@/components/Sidebar/BottomMenu/BottomMenu";
import { AllProvers } from "@/providers/main";
import { ProfileCorner } from "@/components/ProfileCorner/ProfileCorner";

export const metadata: Metadata = {
  title: "Sendler",
  description: "Social media app built with Next.js",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={styles.wrapper}>
        <AllProvers>

          {/* Sidebar */}
          {/* <div className={styles.sidebar}>
              <Sidebar/>
          </div> */}

          
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