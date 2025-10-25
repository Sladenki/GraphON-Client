import type { Metadata } from 'next';
import { inter, orbitron } from './fonts';
import '../styles/globals.scss';
import { Providers } from '@/providers/main';

export const metadata: Metadata = {
  title: 'GraphON',
  description: 'Your extracurricular guide',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${orbitron.variable}`} suppressHydrationWarning>
      <head>
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

