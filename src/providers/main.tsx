'use client'

import React from 'react'
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProviders } from "@/providers/ThemeProvider";
import { ReactQueryProvider } from './ReactQueryProvider';
import { I18nProvider } from '@react-aria/i18n';

/**
 * Главный провайдер приложения, объединяющий все контекстные провайдеры.
 * Порядок важен:
 * 1. ReactQueryProvider - для работы с данными
 * 2. ThemeProviders - для темы (должен быть рано для предотвращения FOUC)
 * 3. I18nProvider - для локализации
 * 4. AuthProvider - для аутентификации (внутри может использовать другие провайдеры)
 */
export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactQueryProvider>
      <ThemeProviders>
        <I18nProvider locale="ru-RU">
          <AuthProvider>
            {children}
          </AuthProvider>
        </I18nProvider>
      </ThemeProviders>
    </ReactQueryProvider>
  )
}
