"use client";
import '../../styles/globals.scss'
import { inter, orbitron } from '@/app/fonts';
import { Providers } from '../providers';
import { HeroUIProvider } from '@heroui/react';
import { Toaster } from 'sonner';

export default function MongoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${inter.variable} ${orbitron.variable}`}>
      <body className={inter.className}>
        <Providers>
          <HeroUIProvider>
            <Toaster position="top-right" richColors />
            {children}
          </HeroUIProvider>
        </Providers>
      </body>
    </html>
  );
}


