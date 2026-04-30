import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Locale } from '@/types';

type SettingsState = {
  locale: Locale;
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  setCartOpen: (isOpen: boolean) => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      locale: 'en',
      isCartOpen: false,
      isMobileMenuOpen: false,
      setLocale: (locale) => set({ locale }),
      toggleLocale: () =>
        set((state) => ({
          locale: state.locale === 'en' ? 'ka' : 'en',
        })),
      setCartOpen: (isCartOpen) => set({ isCartOpen }),
      setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
    }),
    {
      name: 'alexandra-limited-collection-settings',
      partialize: (state) => ({
        locale: state.locale,
      }),
    },
  ),
);
