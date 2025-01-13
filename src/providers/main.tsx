'use client'

import React from 'react'
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProviders } from "@/providers/ThemeProvider";
import { ReactQueryProvider } from './ReactQueryProvider';
import { ReactFlowProvider } from '@xyflow/react';


export const AllProvers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
        <ReactQueryProvider>
            <ThemeProviders>
              <ReactFlowProvider>
                {children}
              </ReactFlowProvider>
            </ThemeProviders>
        </ReactQueryProvider>
    </AuthProvider>
  )
}
