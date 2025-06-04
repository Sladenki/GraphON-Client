'use client'

import Sidebar from "@/components/global/Sidebar/Sidebar";
import styles from './layout.module.scss'
import BottomMenu from "@/components/global/BottomMenu/BottomMenu";
import { AllProvers } from "@/providers/main";
import { ProfileCorner } from "@/components/global/ProfileCorner/ProfileCorner";

import '../../styles/globals.scss'
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Script from "next/script";
import GoogleAnalytics from "@/components/GoogleAnalytics";


export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {

  const small = useMediaQuery(650)

  return (
    <html lang="en">
      <head>
        <title>GraphON</title>

         {/* Подключаем Google Analytics только если есть ID */}
         {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className={styles.wrapper}>
        <AllProvers>
          
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <Sidebar/>
          </div>
          
          {/* Основная страница */}
          <div className={styles.main}>
            <div className={styles.content}>
              {/* Добавляем компонент для отслеживания переходов */}
              <GoogleAnalytics /> 
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