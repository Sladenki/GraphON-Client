import { useMemo } from 'react';
import { useMediaQuery } from "@/hooks/useMediaQuery";

export const useLayoutOptimization = () => {
  // Мемоизированная проверка размера экрана
  const isSmallScreen = useMediaQuery('(max-width: 650px)');
  
  // Мемоизированная проверка наличия Google Analytics ID
  const hasGoogleAnalytics = useMemo(() => 
    !!process.env.NEXT_PUBLIC_GA_ID, 
    []
  );

  // Мемоизированный Google Analytics ID
  const googleAnalyticsId = useMemo(() => 
    process.env.NEXT_PUBLIC_GA_ID || '', 
    []
  );

  // Мемоизированные состояния компонентов
  const componentStates = useMemo(() => ({
    showProfileCorner: !isSmallScreen,
    showGoogleAnalytics: hasGoogleAnalytics,
  }), [isSmallScreen, hasGoogleAnalytics]);

  return {
    isSmallScreen,
    googleAnalyticsId,
    componentStates,
  };
}; 