import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { WishlistEntry } from '@/types';

type WishlistState = {
  items: WishlistEntry[];
  toggleWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (productId) =>
        set((state) => {
          const exists = state.items.some((item) => item.productId === productId);
          if (exists) {
            return {
              items: state.items.filter((item) => item.productId !== productId),
            };
          }

          return {
            items: [...state.items, { productId, createdAt: new Date().toISOString() }],
          };
        }),
      removeFromWishlist: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      isWishlisted: (productId) => get().items.some((item) => item.productId === productId),
    }),
    {
      name: 'alexandra-limited-collection-wishlist',
    },
  ),
);
