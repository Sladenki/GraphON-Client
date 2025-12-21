'use client'

import React from 'react';
import { Network, MapPinned } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useSelectedGraphId } from '@/stores/useUIStore';
import { CITY_GRAPH_ID, CITY_ROUTE, GRAPHS_ROUTE } from '@/constants/sidebar';
import { useRouter } from 'next/navigation';
import styles from './CentralActionButton.module.scss';

const CentralActionButton: React.FC = () => {
  const { user } = useAuth();
  const storeSelectedGraphId = useSelectedGraphId();
  const router = useRouter();

  const normalizeGraphId = (raw: any): string | null => {
    if (!raw) return null;
    if (typeof raw === 'string') return raw;
    if (typeof raw === 'object') {
      return raw._id ?? raw.$oid ?? null;
    }
    return null;
  };

  const effectiveGraphId = storeSelectedGraphId || normalizeGraphId(user?.selectedGraphId);
  const isCityGraph = effectiveGraphId === CITY_GRAPH_ID;

  const handleClick = () => {
    const targetPath = isCityGraph ? CITY_ROUTE : GRAPHS_ROUTE;
    router.push(targetPath);
  };

  return (
    <button 
      className={styles.centralButton}
      onClick={handleClick}
      aria-label={isCityGraph ? 'Город' : 'Графы'}
    >
      <div className={styles.buttonContent}>
        {isCityGraph ? (
          <MapPinned size={22} strokeWidth={2} />
        ) : (
          <Network size={22} strokeWidth={2} />
        )}
      </div>
    </button>
  );
};

export default CentralActionButton;

