import { useEffect } from 'react';

import { subscribeToAuthChanges } from '@/lib/data-provider';
import { useAuthStore } from '@/store/auth-store';
import { useCommerceStore } from '@/store/commerce-store';

export const AppBootstrap = () => {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const syncAuth = useAuthStore((state) => state.sync);
  const loadCatalog = useCommerceStore((state) => state.loadCatalog);

  useEffect(() => {
    void initializeAuth();
    void loadCatalog();

    const unsubscribe = subscribeToAuthChanges((payload) => {
      syncAuth({
        backendMode: payload.mode,
        sessionUser: payload.sessionUser,
        profile: payload.profile,
      });
    });

    return unsubscribe;
  }, [initializeAuth, loadCatalog, syncAuth]);

  return null;
};
