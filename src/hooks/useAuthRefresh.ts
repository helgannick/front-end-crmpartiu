'use client';

import { useEffect } from 'react';
import { refreshToken } from '../lib/auth';

const REFRESH_INTERVAL_MS = 50 * 60 * 1000; // 50 minutos

export function useAuthRefresh() {
  useEffect(() => {
    const interval = setInterval(async () => {
      const ok = await refreshToken();
      if (!ok && typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);
}
