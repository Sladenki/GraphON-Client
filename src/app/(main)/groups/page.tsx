"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';

const AllGraphs = dynamic(() => import('./AllGraphs').then(m => m.default), { ssr: false });

export default function GroupsPage() {
  return (
    <Suspense fallback={<SpinnerLoader />}> 
      <AllGraphs />
    </Suspense>
  );
}



