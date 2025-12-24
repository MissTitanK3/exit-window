// Helper hook to wait for app store hydration before reading persisted values.
'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from './appStore';

export const useAppStoreHydration = (): boolean => {
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    const persistApi = useAppStore.persist;
    if (!persistApi) return;
    if (persistApi.hasHydrated()) {
      setHydrated(true);
      return;
    }

    const unsub = persistApi.onFinishHydration(() => setHydrated(true));
    persistApi.rehydrate();
    return () => {
      unsub?.();
    };
  }, []);

  return hydrated;
};
