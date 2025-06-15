'use client'

import React, { memo } from "react";
import Sidebar from "@/components/global/Sidebar/Sidebar";
import styles from './layout.module.scss'
import BottomMenu from "@/components/global/BottomMenu/BottomMenu";
import { AllProvers } from "@/providers/main";


import '../../styles/globals.scss'
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Script from "next/script";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Toaster } from "sonner";
import { HeroUIProvider } from "@heroui/react";
import ProfileCorner from "@/components/global/ProfileCorner/ProfileCorner";
import { useLayoutOptimization } from "./useLayoutOptimization";


interface RootLayoutProps {
  children: React.ReactNode;
}

// Мемоизированный компонент Google Analytics скриптов
const GoogleAnalyticsScripts = memo<{ googleAnalyticsId: string }>(({ googleAnalyticsId }) => (
  <>
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
      strategy="afterInteractive"
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', '${googleAnalyticsId}', {
          page_path: window.location.pathname,
        });
      `}
    </Script>
  </>
));
GoogleAnalyticsScripts.displayName = 'GoogleAnalyticsScripts';

// Мемоизированный компонент Head
const DocumentHead = memo<{ showGoogleAnalytics: boolean; googleAnalyticsId: string }>(({ 
  showGoogleAnalytics, 
  googleAnalyticsId 
}) => (
  <head>
    <title>GraphON</title>
    {showGoogleAnalytics && (
      <GoogleAnalyticsScripts googleAnalyticsId={googleAnalyticsId} />
    )}
  </head>
));
DocumentHead.displayName = 'DocumentHead';

// Мемоизированный компонент Sidebar
const SidebarWrapper = memo(() => (
  <div className={styles.sidebar}>
    <Sidebar/>
  </div>
));
SidebarWrapper.displayName = 'SidebarWrapper';

// Мемоизированный компонент основного контента
const MainContent = memo<{ children: React.ReactNode }>(({ children }) => (
  <div className={styles.main}>
    <div className={styles.content}>
      <GoogleAnalytics />
      {children}
    </div>
  </div>
));
MainContent.displayName = 'MainContent';

// Мемоизированный компонент ProfileCorner
const ProfileCornerWrapper = memo<{ show: boolean }>(({ show }) => {
  if (!show) return null;
  
  return (
    <div className={styles.profileCorner}>
      <ProfileCorner/>
    </div>
  );
});
ProfileCornerWrapper.displayName = 'ProfileCornerWrapper';

// Мемоизированный компонент BottomMenu
const BottomMenuWrapper = memo(() => (
  <div className={styles.BottomMenu}>
    <BottomMenu/>
  </div>
));
BottomMenuWrapper.displayName = 'BottomMenuWrapper';

// Мемоизированный компонент Toaster
const ToasterWrapper = memo(() => (
  <Toaster position="top-right" richColors />
));
ToasterWrapper.displayName = 'ToasterWrapper';

// Мемоизированный компонент основной обертки
const LayoutWrapper = memo<{ children: React.ReactNode; showProfileCorner: boolean }>(({ 
  children, 
  showProfileCorner 
}) => (
  <div className={styles.wrapper}>
    <AllProvers>
      <SidebarWrapper />
      <MainContent>{children}</MainContent>
      <ProfileCornerWrapper show={showProfileCorner} />
      <BottomMenuWrapper />
    </AllProvers>
  </div>
));
LayoutWrapper.displayName = 'LayoutWrapper';

// Основной компонент Layout
const RootLayout: React.FC<RootLayoutProps> = memo(({ children }) => {
  const {
    googleAnalyticsId,
    componentStates,
  } = useLayoutOptimization();

  return (
    <html lang="en">
      <DocumentHead 
        showGoogleAnalytics={componentStates.showGoogleAnalytics}
        googleAnalyticsId={googleAnalyticsId}
      />
      <body >
        <HeroUIProvider>
          <ToasterWrapper />
          <LayoutWrapper 
            showProfileCorner={componentStates.showProfileCorner}
          >
            {children}
          </LayoutWrapper>
        </HeroUIProvider>
      </body>
    </html>
  );
});

RootLayout.displayName = 'RootLayout';

export default RootLayout;