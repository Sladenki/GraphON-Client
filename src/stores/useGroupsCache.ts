import { create } from 'zustand';

// Stable empty array to avoid returning a new reference on each getSnapshot
const EMPTY: any[] = [];

interface GroupsCacheState {
  cache: Record<string, any[]>; // key: selectedGraphId
  getCached: (graphId: string | null | undefined) => any[];
  setCached: (graphId: string, graphs: any[]) => void;
  hasCache: (graphId: string | null | undefined) => boolean;
  clear: (graphId?: string) => void;
}

export const useGroupsCache = create<GroupsCacheState>((set, get) => ({
  cache: {},
  getCached: (graphId) => {
    if (!graphId) return EMPTY;
    const cached = get().cache[graphId];
    return cached ?? EMPTY;
  },
  setCached: (graphId, graphs) => {
    if (!graphId) return;
    set((state) => {
      const current = state.cache[graphId];
      if (current === graphs) return state; // no change
      // optional shallow length check to reduce unnecessary updates
      if (Array.isArray(current) && Array.isArray(graphs) && current.length === graphs.length) {
        // leave as-is to avoid churn
        return state;
      }
      return { cache: { ...state.cache, [graphId]: graphs } } as GroupsCacheState;
    });
  },
  hasCache: (graphId) => {
    if (!graphId) return false;
    const cached = get().cache[graphId];
    return Array.isArray(cached) && cached.length > 0;
  },
  clear: (graphId) => {
    if (!graphId) {
      set({ cache: {} });
      return;
    }
    set((state) => {
      const next = { ...state.cache };
      delete next[graphId];
      return { cache: next } as GroupsCacheState;
    });
  }
}));


