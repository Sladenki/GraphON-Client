"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { useAuth } from '@/providers/AuthProvider';

const Subs = dynamic(() => import('../(page)/Subs/SubsOptimized'), { ssr: false });

export default function SubsPage() {
  const { user } = useAuth();
  const hasSubs = !!(user?.graphSubsNum && user.graphSubsNum > 0);
  if (!hasSubs) return null;
  return (
    <Suspense fallback={<SpinnerLoader />}> 
      <Subs />
    </Suspense>
  );
}



