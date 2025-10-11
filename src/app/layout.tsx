import type { Metadata } from 'next';
import { inter, orbitron } from './fonts';
import '../styles/globals.scss';

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
    <html lang="ru" className={`${inter.variable} ${orbitron.variable}`}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}

