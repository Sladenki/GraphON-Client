import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../../styles/globals.scss';

const inter = Inter({ subsets: ['latin'] });

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
            <body className={inter.className}>{children}</body>
        </html>
    );
} 