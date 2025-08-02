'use client'

import React from 'react'
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProviders } from "@/providers/ThemeProvider";
import { ReactQueryProvider } from './ReactQueryProvider';


export const AllProvers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <ThemeProviders>
          {children}
        </ThemeProviders>
      </AuthProvider>
    </ReactQueryProvider>
  )
}
