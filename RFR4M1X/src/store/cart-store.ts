import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CartItem, Product } from '@/types';

type CartState = {
  items: CartItem[];
  addItem: (product: Product, size: string, color: string, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, size, color, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (item) =>
              item.productId === product.id && item.size === size && item.color === color,
          );

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === existing.id
                  ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                id: `${product.id}-${size}-${color}`,
                productId: product.id,
                quantity,
                size,
                color,
                product,
              },
            ],
          };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item,
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'alexandra-limited-collection-cart',
    },
  ),
);
