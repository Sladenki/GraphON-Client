import type { Metadata, Viewport } from 'next';
import { inter, orbitron } from './fonts';
import '../styles/tailwind.css';
import '../styles/globals.scss';
import { Providers } from '@/providers/main';

export const metadata: Metadata = {
  title: 'GraphON',
  description: 'Your extracurricular guide',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${orbitron.variable}`} suppressHydrationWarning>
      <head>
        {/* Telegram WebApp Script - загружаем синхронно для корректной работы */}
        {/* <script src="https://telegram.org/js/telegram-web-app.js" /> */}
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storageKey = 'graphon-theme';
                  var theme = localStorage.getItem(storageKey);
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var appliedTheme = theme === 'system' || !theme ? systemTheme : theme;
                  document.documentElement.setAttribute('data-theme', appliedTheme);
                  // Синхронизируем с классом .dark для HeroUI
                  if (appliedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

