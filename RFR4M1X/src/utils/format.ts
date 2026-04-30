import type { Category, LocalizedString, Locale, OrderStatus, Product } from '@/types';

export const getLocalizedText = (value: LocalizedString, locale: Locale) => value[locale];

export const formatCurrency = (value: number, locale: Locale) =>
  new Intl.NumberFormat(locale === 'ka' ? 'ka-GE' : 'en-US', {
    style: 'currency',
    currency: 'GEL',
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === 'ka' ? 'ka-GE' : 'en-US', {
    dateStyle: 'medium',
  }).format(new Date(value));

export const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const capitalize = (value: string) =>
  value.length ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;

export const unique = <T>(items: T[]) => [...new Set(items)];

export const findCategory = (categories: Category[], slug: string) =>
  categories.find((category) => category.slug === slug);

export const getProductPrice = (product: Product) => product.price;

export const orderStatusTone: Record<OrderStatus, string> = {
  pending: 'bg-neutral-100 text-neutral-700',
  confirmed: 'bg-neutral-200 text-neutral-900',
  shipped: 'bg-neutral-900 text-white',
  delivered: 'bg-black text-white',
  cancelled: 'bg-white text-neutral-500 ring-1 ring-neutral-300',
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
