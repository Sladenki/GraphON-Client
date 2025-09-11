import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NetworkState {
  pendingRequestCount: number;
  lastRequestStartedAtMs: number | null;
  lastSlowResponseMs: number | null;
  isVpnSuspected: boolean;
  lastVpnSuspectedAtMs: number | null;
  slowResponseThresholdMs: number; // configurable threshold for slow response
  longPendingThresholdMs: number; // configurable threshold for pending without response

  markRequestStart: () => void;
  markRequestEnd: (durationMs: number) => void;
  tickPendingWatchdog: () => void;
  clearVpnSuspicion: () => void;
}

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set, get) => ({
      pendingRequestCount: 0,
      lastRequestStartedAtMs: null,
      lastSlowResponseMs: null,
      isVpnSuspected: false,
      lastVpnSuspectedAtMs: null,
      slowResponseThresholdMs: 2500,
      longPendingThresholdMs: 7000,

      markRequestStart: () => {
        const now = Date.now();
        set((state) => ({
          pendingRequestCount: state.pendingRequestCount + 1,
          // Preserve the earliest start when multiple requests are pending
          lastRequestStartedAtMs:
            state.pendingRequestCount === 0 ? now : state.lastRequestStartedAtMs,
        }));
      },

      markRequestEnd: (durationMs: number) => {
        const state = get();
        const isSlow = durationMs >= state.slowResponseThresholdMs;
        set({
          pendingRequestCount: Math.max(0, state.pendingRequestCount - 1),
          lastSlowResponseMs: isSlow ? durationMs : state.lastSlowResponseMs,
          isVpnSuspected: isSlow ? true : state.isVpnSuspected,
          lastVpnSuspectedAtMs: isSlow ? Date.now() : state.lastVpnSuspectedAtMs,
        });
      },

      tickPendingWatchdog: () => {
        const state = get();
        if (state.pendingRequestCount > 0 && state.lastRequestStartedAtMs) {
          const pendingForMs = Date.now() - state.lastRequestStartedAtMs;
          if (pendingForMs >= state.longPendingThresholdMs) {
            set({ isVpnSuspected: true, lastVpnSuspectedAtMs: Date.now() });
          }
        }
      },

      clearVpnSuspicion: () => set({ isVpnSuspected: false }),
    }),
    {
      name: 'network-store',
      partialize: (state) => ({
        slowResponseThresholdMs: state.slowResponseThresholdMs,
        longPendingThresholdMs: state.longPendingThresholdMs,
      }),
      version: 1,
    }
  )
);

export const useIsVpnSuspected = () => useNetworkStore((s) => s.isVpnSuspected);
export const useMarkRequestStart = () => useNetworkStore((s) => s.markRequestStart);
export const useMarkRequestEnd = () => useNetworkStore((s) => s.markRequestEnd);
export const useTickPendingWatchdog = () => useNetworkStore((s) => s.tickPendingWatchdog);
export const useClearVpnSuspicion = () => useNetworkStore((s) => s.clearVpnSuspicion);

