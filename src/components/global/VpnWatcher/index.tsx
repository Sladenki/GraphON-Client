'use client'

import { useEffect, useRef } from 'react';
import { useClearVpnSuspicion, useIsVpnSuspected } from '@/stores/useNetworkStore';
import { notifyInfo } from '@/lib/notifications';

const VPN_MESSAGE_COOLDOWN_MS = 60_000; // show at most once per minute

export default function VpnWatcher() {
  const isVpnSuspected = useIsVpnSuspected();
  const clearVpn = useClearVpnSuspicion();
  const lastShownAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isVpnSuspected) return;

    const now = Date.now();
    const canShow =
      lastShownAtRef.current === null || now - lastShownAtRef.current >= VPN_MESSAGE_COOLDOWN_MS;

    if (canShow) {
      notifyInfo(
        'Возможен включённый VPN',
        'Мы заметили медленное соединение. Отключите VPN для ускорения загрузки.'
      );
      lastShownAtRef.current = now;
    }

    // Auto-clear suspicion after notifying to avoid repeated toasts during same slow burst
    const timeout = window.setTimeout(() => {
      clearVpn();
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [isVpnSuspected, clearVpn]);

  return null;
}


