'use client';

import { ThemeProvider } from "next-themes";

export const ThemeProviders = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};