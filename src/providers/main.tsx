'use client'

import React from 'react'
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProviders } from "@/providers/ThemeProvider";
import { ReactQueryProvider } from './ReactQueryProvider';
import { UIStateProvider } from '@/contexts/UIStateContext';


export const AllProvers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
        <ReactQueryProvider>
            <ThemeProviders>
              <UIStateProvider>
                {children}
              </UIStateProvider>
            </ThemeProviders>
        </ReactQueryProvider>
    </AuthProvider>
  )
}
