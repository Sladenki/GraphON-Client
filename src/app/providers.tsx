'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { I18nProvider } from '@react-aria/i18n';

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <I18nProvider locale="ru-RU">
                {children}
            </I18nProvider>
        </QueryClientProvider>
    );
} 