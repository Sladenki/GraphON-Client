'use client'

import React from 'react'
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProviders } from "@/providers/ThemeProvider";
import { ReactQueryProvider } from './ReactQueryProvider';


export const AllProvers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
        <ReactQueryProvider>
            <ThemeProviders>
                {children}
            </ThemeProviders>
        </ReactQueryProvider>
    </AuthProvider>
  )
}
