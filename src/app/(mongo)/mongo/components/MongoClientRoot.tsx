"use client";

import { HeroUIProvider } from '@heroui/react';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import PasswordGate from './PasswordGate';

type Props = {
  children: React.ReactNode;
  mustAskPassword: boolean;
};

export default function MongoClientRoot({ children, mustAskPassword }: Props) {
  // Синхронизируем класс dark с data-theme атрибутом
  useEffect(() => {
    const updateDarkClass = () => {
      const html = document.documentElement;
      const theme = html.getAttribute('data-theme');
      if (theme === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    };

    // Обновляем при загрузке
    updateDarkClass();

    // Следим за изменениями темы
    const observer = new MutationObserver(updateDarkClass);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <HeroUIProvider>
      <Toaster position="top-right" richColors />
      {mustAskPassword ? <PasswordGate /> : children}
    </HeroUIProvider>
  );
}


