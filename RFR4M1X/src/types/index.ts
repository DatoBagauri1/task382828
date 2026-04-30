export type Locale = 'en' | 'ka';

export type CategorySlug =
  | 'hoodies'
  | 't-shirts'
  | 'jeans'
  | 'jackets'
  | 'pants'
  | 'shorts'
  | 'dresses'
  | 'accessories'
  | 'shoes';

export type ProductFlag = {
  isFeatured: boolean;
  isNew: boolean;
  isSale: boolean;
};

export type ProductGender = 'women' | 'men' | 'unisex';

export type LocalizedString = {
  en: string;
  ka: string;
};

export type Category = {
  id: string;
  slug: CategorySlug | string;
  name: LocalizedString;
  description: LocalizedString;
  image: string;
  featured?: boolean;
};

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: LocalizedString;
  category: CategorySlug | string;
  gender: ProductGender;
  price: number;
  oldPrice: number | null;
  description: LocalizedString;
  material: LocalizedString;
  careInstructions: LocalizedString;
  sizes: string[];
  colors: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  images: string[];
  flags: ProductFlag;
  popularity: number;
  createdAt: string;
};

export type Review = {
  id: string;
  author: string;
  title: LocalizedString;
  body: LocalizedString;
  rating: number;
};

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  size: string;
  color: string;
  product: Product;
};

export type WishlistEntry = {
  productId: string;
  createdAt: string;
};

export type PaymentMethod = 'cash_on_delivery' | 'tbc_transfer' | 'bog_transfer';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string | null;
  productName: LocalizedString;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
};

export type Order = {
  id: string;
  userId: string | null;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: PaymentMethod;
  bankAccount: string | null;
  receiptImage: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
};

export type UserRole = 'customer' | 'admin';

export type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
};

export type SessionUser = {
  id: string;
  email: string;
};

export type CheckoutFormValues = {
  name: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: PaymentMethod;
  receiptImage?: string | null;
};

export type AuthFormValues = {
  fullName?: string;
  email: string;
  password: string;
};

export type ProductFormValues = {
  id?: string;
  slug?: string;
  sku?: string;
  nameEn: string;
  nameKa: string;
  category: string;
  gender: ProductGender;
  price: number;
  oldPrice?: number | null;
  descriptionEn: string;
  descriptionKa: string;
  materialEn: string;
  materialKa: string;
  careEn: string;
  careKa: string;
  sizes: string;
  colors: string;
  stock: number;
  rating: number;
  reviewCount: number;
  tags: string;
  images: string;
  isFeatured: boolean;
  isNew: boolean;
  isSale: boolean;
};

export type CategoryFormValues = {
  id?: string;
  slug: string;
  nameEn: string;
  nameKa: string;
  descriptionEn: string;
  descriptionKa: string;
  image: string;
  featured: boolean;
};

export type DashboardStats = {
  productCount: number;
  orderCount: number;
  revenue: number;
  lowStock: Product[];
};

export type ShopFilters = {
  search: string;
  category: string;
  gender: ProductGender | '';
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular';
  page: number;
};
