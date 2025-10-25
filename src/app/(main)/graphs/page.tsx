"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';

const GraphView = dynamic(() => import('./GraphView/GraphView'), { ssr: false });

export default function GraphsPage() {
  return (
    <Suspense fallback={<SpinnerLoader />}> 
      <GraphView />
    </Suspense>
  );
}



