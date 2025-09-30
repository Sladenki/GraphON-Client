"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';

const EventsList = dynamic(() => import('./EventsList/EventsListOptimized'), { ssr: false });

export default function EventsPage() {
  return (
    <Suspense fallback={<SpinnerLoader />}> 
      <EventsList />
    </Suspense>
  );
}



