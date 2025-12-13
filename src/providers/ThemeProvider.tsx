'use client';

import { ThemeProvider } from "next-themes";
import { useEffect } from "react";

export const ThemeProviders = ({ children }: { children: React.ReactNode }) => {
  // Синхронизируем data-theme с классом .dark для HeroUI
  useEffect(() => {
    const updateDarkClass = () => {
      const html = document.documentElement;
      const theme = html.getAttribute('data-theme');
      if (theme === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    };

    // Обновляем при загрузке
    updateDarkClass();

    // Следим за изменениями темы
    const observer = new MutationObserver(updateDarkClass);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem={true}
      storageKey="graphon-theme"
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
};