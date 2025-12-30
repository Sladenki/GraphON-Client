'use client'

import React from 'react';
import { Network, MapPinned } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useSelectedGraphId } from '@/stores/useUIStore';
import { CITY_GRAPH_ID, CITY_ROUTE, GRAPHS_ROUTE } from '@/constants/sidebar';
import { useRouter, usePathname } from 'next/navigation';
import styles from './CentralActionButton.module.scss';

const CentralActionButton: React.FC = () => {
  const { user } = useAuth();
  const storeSelectedGraphId = useSelectedGraphId();
  const router = useRouter();
  const pathname = usePathname();

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
  const targetPath = isCityGraph ? CITY_ROUTE : GRAPHS_ROUTE;
  const isActive = pathname === targetPath;

  const handleClick = () => {
    router.push(targetPath);
  };

  return (
    <button 
      className={`${styles.centralButton} ${isActive ? styles.active : ''}`}
      onClick={handleClick}
      aria-label={isCityGraph ? 'Город' : 'Графы'}
    >
      <div className={styles.buttonContent}>
        {isCityGraph ? (
          <MapPinned size={18} strokeWidth={1.5} />
        ) : (
          <Network size={18} strokeWidth={1.5} />
        )}
      </div>
    </button>
  );
};

export default CentralActionButton;

