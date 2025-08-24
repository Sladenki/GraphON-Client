import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TabType = 'events' | 'groups' | 'graphSystem' | 'subs';

interface UIState {
  // Navigation state
  activeTab: TabType;
  searchQuery: string;
  selectedGraphId: string | null;
  
  // UI state
  isMobileNavOpen: boolean;
  
  // Actions
  setActiveTab: (tab: TabType) => void;
  setSearchQuery: (query: string) => void;
  setSelectedGraphId: (id: string | null) => void;
  setMobileNavOpen: (isOpen: boolean) => void;
  clearSearch: () => void;
  
  // Computed
  hasSelectedGraph: () => boolean;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeTab: 'events',
      searchQuery: '',
      selectedGraphId: null,
      isMobileNavOpen: false,
      
      // Actions
      setActiveTab: (tab: TabType) => {
        set({ activeTab: tab });
      },
      
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },
      
      setSelectedGraphId: (id: string | null) => {
        const currentState = get();
        // Нормализация: поддержка случаев, когда приходит объект вместо строки
        const raw: any = id as any;
        const normalizedId: string | null =
          raw && typeof raw === 'object'
            ? (raw._id ?? raw.$oid ?? null)
            : (id ?? null);

        // Избегаем обновления если значение не изменилось
        if (currentState.selectedGraphId === normalizedId) return;

        set({ selectedGraphId: normalizedId });
        
        // Dispatch custom event for backward compatibility
        // (for components that haven't been migrated yet)
        // Используем setTimeout чтобы избежать синхронных обновлений
        if (typeof window !== 'undefined' && normalizedId) {
          setTimeout(() => {
            const event = new CustomEvent('graphSelected', { detail: normalizedId });
            window.dispatchEvent(event);
          }, 0);
        }
      },
      
      setMobileNavOpen: (isOpen: boolean) => {
        set({ isMobileNavOpen: isOpen });
      },
      
      clearSearch: () => {
        set({ searchQuery: '' });
      },
      
      // Computed values
      hasSelectedGraph: () => {
        const state = get();
        return !!(state.selectedGraphId);
      },
    }),
    {
      name: 'ui-store', // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        activeTab: state.activeTab,
        selectedGraphId: state.selectedGraphId,
        // Don't persist searchQuery and isMobileNavOpen
      }),
      // Добавляем версию для избежания конфликтов при изменении структуры
      version: 2,
      migrate: (persistedState: any, version) => {
        const state = { ...persistedState };
        if (version < 2) {
          const maybeId = state.selectedGraphId;
          if (maybeId && typeof maybeId === 'object') {
            state.selectedGraphId = maybeId._id ?? maybeId.$oid ?? null;
          }
        }
        return state;
      },
    }
  )
);

// Selector hooks for better performance
export const useActiveTab = () => useUIStore((state) => state.activeTab);
export const useSearchQuery = () => useUIStore((state) => state.searchQuery);
export const useSelectedGraphId = () => useUIStore((state) => state.selectedGraphId);
export const useMobileNavOpen = () => useUIStore((state) => state.isMobileNavOpen);

// Individual action hooks for better stability
export const useSetActiveTab = () => useUIStore((state) => state.setActiveTab);
export const useSetSearchQuery = () => useUIStore((state) => state.setSearchQuery);
export const useSetSelectedGraphId = () => useUIStore((state) => state.setSelectedGraphId);
export const useSetMobileNavOpen = () => useUIStore((state) => state.setMobileNavOpen);
export const useClearSearch = () => useUIStore((state) => state.clearSearch);

// Legacy action hooks (deprecated - use individual hooks above)
export const useUIActions = () => useUIStore((state) => ({
  setActiveTab: state.setActiveTab,
  setSearchQuery: state.setSearchQuery,
  setSelectedGraphId: state.setSelectedGraphId,
  setMobileNavOpen: state.setMobileNavOpen,
  clearSearch: state.clearSearch,
})); 