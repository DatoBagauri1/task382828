import { create } from 'zustand';

import {
  createOrder as providerCreateOrder,
  deleteCategory as providerDeleteCategory,
  deleteProduct as providerDeleteProduct,
  fetchCatalog,
  fetchOrders,
  saveCategory as providerSaveCategory,
  saveProduct as providerSaveProduct,
  seedBundledCatalog,
  type BackendMode,
  updateOrderStatus as providerUpdateOrderStatus,
} from '@/lib/data-provider';
import type {
  CartItem,
  Category,
  CheckoutFormValues,
  DashboardStats,
  Order,
  OrderStatus,
  Product,
  SessionUser,
} from '@/types';

type CommerceState = {
  backendMode: BackendMode;
  categories: Category[];
  products: Product[];
  orders: Order[];
  isLoadingCatalog: boolean;
  isLoadingOrders: boolean;
  isMutating: boolean;
  error: string | null;
  loadCatalog: () => Promise<void>;
  loadOrders: (userId?: string, isAdmin?: boolean) => Promise<void>;
  createOrder: (payload: {
    form: CheckoutFormValues;
    items: CartItem[];
    user: SessionUser | null;
    email?: string;
  }) => Promise<Order>;
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  saveCategory: (category: Category) => Promise<void>;
  deleteCategory: (slug: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  seedCatalog: () => Promise<void>;
};

export const useCommerceStore = create<CommerceState>((set, get) => ({
  backendMode: 'demo',
  categories: [],
  products: [],
  orders: [],
  isLoadingCatalog: true,
  isLoadingOrders: false,
  isMutating: false,
  error: null,
  loadCatalog: async () => {
    set({ isLoadingCatalog: true, error: null });
    try {
      const catalog = await fetchCatalog();
      set({
        backendMode: catalog.mode,
        categories: catalog.categories,
        products: catalog.products,
        isLoadingCatalog: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load catalog.',
        isLoadingCatalog: false,
      });
    }
  },
  loadOrders: async (userId, isAdmin = false) => {
    set({ isLoadingOrders: true, error: null });
    try {
      const orders = await fetchOrders(userId, isAdmin);
      set({ orders, isLoadingOrders: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load orders.',
        isLoadingOrders: false,
      });
    }
  },
  createOrder: async (payload) => {
    set({ isMutating: true, error: null });
    try {
      const order = await providerCreateOrder(payload);
      set((state) => ({
        orders: [order, ...state.orders],
        isMutating: false,
      }));
      return order;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create order.',
        isMutating: false,
      });
      throw error;
    }
  },
  saveProduct: async (product) => {
    set({ isMutating: true, error: null });
    try {
      await providerSaveProduct(product);
      await get().loadCatalog();
      set({ isMutating: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save product.',
        isMutating: false,
      });
      throw error;
    }
  },
  deleteProduct: async (productId) => {
    set({ isMutating: true, error: null });
    try {
      await providerDeleteProduct(productId);
      await get().loadCatalog();
      set({ isMutating: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete product.',
        isMutating: false,
      });
      throw error;
    }
  },
  saveCategory: async (category) => {
    set({ isMutating: true, error: null });
    try {
      await providerSaveCategory(category);
      await get().loadCatalog();
      set({ isMutating: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save category.',
        isMutating: false,
      });
      throw error;
    }
  },
  deleteCategory: async (slug) => {
    set({ isMutating: true, error: null });
    try {
      await providerDeleteCategory(slug);
      await get().loadCatalog();
      set({ isMutating: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete category.',
        isMutating: false,
      });
      throw error;
    }
  },
  updateOrderStatus: async (orderId, status) => {
    set({ isMutating: true, error: null });
    try {
      await providerUpdateOrderStatus(orderId, status);
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, status } : order,
        ),
        isMutating: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update order.',
        isMutating: false,
      });
      throw error;
    }
  },
  seedCatalog: async () => {
    set({ isMutating: true, error: null });
    try {
      await seedBundledCatalog();
      await get().loadCatalog();
      set({ isMutating: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to seed catalog.',
        isMutating: false,
      });
      throw error;
    }
  },
}));

export const getDashboardStats = (products: Product[], orders: Order[]): DashboardStats => ({
  productCount: products.length,
  orderCount: orders.length,
  revenue: orders.reduce((sum, order) => sum + order.total, 0),
  lowStock: products.filter((product) => product.stock <= 6).slice(0, 6),
});
