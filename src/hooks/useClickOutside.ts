import { useEffect } from 'react';

/**
 * Calls onOutside when a click/touch happens outside of the provided element.
 * Usage:
 * const ref = useRef<HTMLDivElement>(null)
 * useClickOutside(ref, () => setOpen(false), open)
 */
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onOutside: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el) return;
      const target = e.target as Node | null;
      if (target && !el.contains(target)) {
        onOutside(e);
      }
    };

    document.addEventListener('mousedown', handler, { passive: true } as any);
    document.addEventListener('touchstart', handler, { passive: true } as any);
    return () => {
      document.removeEventListener('mousedown', handler as any);
      document.removeEventListener('touchstart', handler as any);
    };
  }, [ref, onOutside, enabled]);
}


