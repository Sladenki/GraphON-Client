'use client';

import { ThemeProvider } from "next-themes";

export const ThemeProviders = ({ children }: { children: React.ReactNode }) => {
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