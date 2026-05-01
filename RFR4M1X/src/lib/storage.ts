import type { Category, Order, Product, UserProfile } from '@/types';

type StorageKey =
  | 'demo-products'
  | 'demo-categories'
  | 'demo-orders'
  | 'demo-users'
  | 'demo-session'
  | 'demo-catalog-version';

const storageKeys: Record<StorageKey, string> = {
  'demo-products': 'alexandra-limited-collection-demo-products',
  'demo-categories': 'alexandra-limited-collection-demo-categories',
  'demo-orders': 'alexandra-limited-collection-demo-orders',
  'demo-users': 'alexandra-limited-collection-demo-users',
  'demo-session': 'alexandra-limited-collection-demo-session',
  'demo-catalog-version': 'alexandra-limited-collection-demo-catalog-version',
};

export const readStorage = <T>(key: StorageKey, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const raw = window.localStorage.getItem(storageKeys[key]);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const writeStorage = <T>(key: StorageKey, value: T) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(storageKeys[key], JSON.stringify(value));
};

export const removeStorage = (key: StorageKey) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(storageKeys[key]);
};

export const createId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;

export type DemoSession = {
  userId: string;
  email: string;
} | null;

export type DemoDatabase = {
  products: Product[];
  categories: Category[];
  orders: Order[];
  users: Array<UserProfile & { password: string }>;
};
