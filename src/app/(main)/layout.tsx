'use client'

import Sidebar from "@/components/global/Sidebar/Sidebar";
import styles from './layout.module.scss'
import BottomMenu from "@/components/global/BottomMenu/BottomMenu";
import { AllProvers } from "@/providers/main";
import type { Metadata } from 'next';
import { Inter, Orbitron } from 'next/font/google';
import '../../styles/globals.scss'
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Script from "next/script";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Toaster } from "sonner";
import { HeroUIProvider } from "@heroui/react";
import ProfileCorner from "@/components/global/ProfileCorner/ProfileCorner";
import { Providers } from '../providers';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {

  const small = useMediaQuery('(max-width: 650px)')

  return (
    <html lang="ru" className={`${inter.variable} ${orbitron.variable}`}>
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
      <body className={inter.className}>
        <Providers>
          <HeroUIProvider>
            <Toaster position="top-right" richColors /> 

            <div className={styles.wrapper}>
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
            </div>
          </HeroUIProvider>
        </Providers>
      </body>
    </html>
  );
}