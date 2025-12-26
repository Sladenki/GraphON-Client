'use client'

import React from 'react'
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProviders } from "@/providers/ThemeProvider";
import { ReactQueryProvider } from './ReactQueryProvider';
import { I18nProvider } from '@react-aria/i18n';
import { WebSocketProvider } from './WebSocketProvider';
import MaintenanceWrapper from '@/components/global/MaintenanceWrapper/MaintenanceWrapper';

/**
 * Главный провайдер приложения, объединяющий все контекстные провайдеры.
 * Порядок важен:
 * 1. ReactQueryProvider - для работы с данными
 * 2. ThemeProviders - для темы (должен быть рано для предотвращения FOUC)
 * 3. I18nProvider - для локализации
 * 4. AuthProvider - для аутентификации (внутри может использовать другие провайдеры)
 * 5. WebSocketProvider - для real-time обновлений (после AuthProvider для доступа к user)
 * 6. MaintenanceWrapper - проверка технических работ (после AuthProvider для доступа к user)
 */
export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactQueryProvider>
      <ThemeProviders>
        <I18nProvider locale="ru-RU">
          <AuthProvider>
            <WebSocketProvider>
              <MaintenanceWrapper>
                {children}
              </MaintenanceWrapper>
            </WebSocketProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProviders>
    </ReactQueryProvider>
  )
}
