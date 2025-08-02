import type { Metadata } from 'next';
import { Inter, Poppins, Montserrat, Playfair_Display } from 'next/font/google';
import '../../styles/globals.scss';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
    title: 'About - GraphON',
    description: 'Learn more about GraphON - your extracurricular guide',
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${poppins.variable} ${montserrat.variable} ${playfair.variable}`}>
                {children}
            </body>
        </html>
    );
} 