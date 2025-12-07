import { Inter, Orbitron } from 'next/font/google';

export const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  adjustFontFallback: true,
  preload: true,
});

export const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  fallback: ['Courier New', 'monospace', 'monospace'],
  adjustFontFallback: true,
  preload: true,
});


