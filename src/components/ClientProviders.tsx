'use client';

import { useAuthRefresh } from '../hooks/useAuthRefresh';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  useAuthRefresh();
  return <>{children}</>;
}
