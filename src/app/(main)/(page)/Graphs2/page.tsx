"use client";
import React from 'react';
import Graphs2View from './Graphs2View';
import { useSearchQuery } from '@/stores/useUIStore';

export default function Graphs2Page() {
  const searchQuery = useSearchQuery();
  return <Graphs2View searchQuery={searchQuery} />;
}

