"use client";

import { HeroUIProvider } from '@heroui/react';
import { Toaster } from 'sonner';
import { Providers } from '@/providers/main';
import PasswordGate from './PasswordGate';

type Props = {
  children: React.ReactNode;
  mustAskPassword: boolean;
};

export default function MongoClientRoot({ children, mustAskPassword }: Props) {
  return (
    <Providers>
      <HeroUIProvider>
        <Toaster position="top-right" richColors />
        {mustAskPassword ? <PasswordGate /> : children}
      </HeroUIProvider>
    </Providers>
  );
}


