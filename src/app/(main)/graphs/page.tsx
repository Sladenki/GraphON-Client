"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import SmartGraphSystem from './GraphView/SmartGraphSystem';
import CosmicGraphExplorer from './GraphView/CosmicGraphExplorer';
import InteractivePlanetExplorer from './GraphView/InteractivePlanetExplorer';
import SporeGalacticExplorer from './GraphView/SporeGalacticExplorer';

const GraphView = dynamic(() => import('./GraphView/GraphView'), { ssr: false });

export default function GraphsPage() {
  return (
    <Suspense fallback={<SpinnerLoader />}> 
      {/* <GraphView /> */}
      {/* <SmartGraphSystem /> */}

      {/* <CosmicGraphExplorer /> */}

      {/* <InteractivePlanetExplorer /> */}

      <SporeGalacticExplorer />
    </Suspense>
  );
}

  

