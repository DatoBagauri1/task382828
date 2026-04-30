import type { User } from '@supabase/supabase-js';

import { demoCategories, demoProducts } from '@/lib/catalog';
import { getBankTransferAccount } from '@/lib/payments';
import { createId, readStorage, removeStorage, writeStorage } from '@/lib/storage';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type {
  CartItem,
  Category,
  CheckoutFormValues,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductGender,
  SessionUser,
  UserProfile,
} from '@/types';
import { sleep } from '@/utils/format';

export type BackendMode = 'demo' | 'supabase';

type DemoUserRecord = UserProfile & { password: string };

const productGenders: ProductGender[] = ['women', 'men', 'unisex'];

const isProductGender = (value: unknown): value is ProductGender =>
  productGenders.includes(value as ProductGender);

const getBundledProductGender = (product: Product) =>
  demoProducts.find((entry) => entry.id === product.id || entry.slug === product.slug)?.gender;

const inferProductGender = (product: Product, providedGender: unknown): ProductGender => {
  const bundledGender = getBundledProductGender(product);

  if (!isProductGender(providedGender)) {
    return bundledGender ?? (product.category === 'dresses' ? 'women' : 'unisex');
  }

  // Existing Supabase/demo rows may have the migration default even when the bundled catalog has
  // a more precise value. Prefer the bundled value for known products so filters work immediately.
  if (providedGender === 'unisex' && bundledGender && bundledGender !== 'unisex') {
    return bundledGender;
  }

  return providedGender;
};

const normalizeProduct = (product: Product): Product => ({
  ...product,
  gender: inferProductGender(product, (product as { gender?: unknown }).gender),
});

const demoAccounts: DemoUserRecord[] = [
  {
    id: 'demo-admin',
    email: 'admin@alexandralimitedcollection.com',
    password: 'Admin123!',
    fullName: 'ALEXANDRA LIMITED COLLECTION Admin',
    role: 'admin',
    createdAt: new Date('2026-01-15').toISOString(),
  },
  {
    id: 'demo-customer',
    email: 'hello@alexandralimitedcollection.com',
    password: 'Shopper123!',
    fullName: 'Nika Beridze',
    role: 'customer',
    createdAt: new Date('2026-02-02').toISOString(),
  },
];

const createStarterOrders = (): Order[] => {
  const first = demoProducts[0];
  const second = demoProducts[6];
  const third = demoProducts[22];

  return [
    {
      id: 'starter-order-1',
      userId: 'demo-customer',
      customerName: 'Nika Beridze',
      email: 'hello@alexandralimitedcollection.com',
      phone: '+995 555 11 22 33',
      address: 'Rustaveli Ave 18',
      city: 'Tbilisi',
      paymentMethod: 'cash_on_delivery',
      bankAccount: null,
      receiptImage: null,
      subtotal: first.price + second.price,
      deliveryFee: 15,
      total: first.price + second.price + 15,
      status: 'confirmed',
      createdAt: new Date('2026-04-20').toISOString(),
      items: [
        {
          id: 'starter-order-1-item-1',
          orderId: 'starter-order-1',
          productId: first.id,
          productName: first.name,
          price: first.price,
          size: first.sizes[2] ?? first.sizes[0],
          color: first.colors[0] ?? 'Black',
          quantity: 1,
          image: first.images[0] ?? '',
        },
        {
          id: 'starter-order-1-item-2',
          orderId: 'starter-order-1',
          productId: second.id,
          productName: second.name,
          price: second.price,
          size: second.sizes[1] ?? second.sizes[0],
          color: second.colors[1] ?? second.colors[0] ?? 'White',
          quantity: 1,
          image: second.images[0] ?? '',
        },
      ],
    },
    {
      id: 'starter-order-2',
      userId: 'demo-admin',
      customerName: 'ALEXANDRA LIMITED COLLECTION Admin',
      email: 'admin@alexandralimitedcollection.com',
      phone: '+995 555 44 55 66',
      address: 'M. Kostava 12',
      city: 'Tbilisi',
      paymentMethod: 'tbc_transfer',
      bankAccount: getBankTransferAccount('tbc_transfer')?.account ?? null,
      receiptImage: null,
      subtotal: third.price * 2,
      deliveryFee: 0,
      total: third.price * 2,
      status: 'shipped',
      createdAt: new Date('2026-04-18').toISOString(),
      items: [
        {
          id: 'starter-order-2-item-1',
          orderId: 'starter-order-2',
          productId: third.id,
          productName: third.name,
          price: third.price,
          size: third.sizes[1] ?? third.sizes[0],
          color: third.colors[0] ?? 'Blue',
          quantity: 2,
          image: third.images[0] ?? '',
        },
      ],
    },
  ];
};

const ensureDemoBootstrap = () => {
  const products = readStorage<Product[]>('demo-products', []);
  const categories = readStorage<Category[]>('demo-categories', []);
  const users = readStorage<DemoUserRecord[]>('demo-users', []);
  const orders = readStorage<Order[]>('demo-orders', []);

  if (!products.length) {
    writeStorage('demo-products', demoProducts);
  } else {
    const normalizedProducts = products.map(normalizeProduct);
    if (normalizedProducts.some((product, index) => product.gender !== products[index]?.gender)) {
      writeStorage('demo-products', normalizedProducts);
    }
  }
  if (!categories.length) {
    writeStorage('demo-categories', demoCategories);
  }
  if (!users.length) {
    writeStorage('demo-users', demoAccounts);
  }
  if (!orders.length) {
    writeStorage('demo-orders', createStarterOrders());
  }
};

const getDemoProfile = (userId: string) =>
  readStorage<DemoUserRecord[]>('demo-users', demoAccounts).find((user) => user.id === userId) ?? null;

const mapProfile = (record: DemoUserRecord | UserProfile | null): UserProfile | null => {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    email: record.email,
    fullName: record.fullName,
    phone: record.phone,
    role: record.role,
    avatarUrl: record.avatarUrl,
    createdAt: record.createdAt,
  };
};

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  return supabase;
};

const ensureSupabaseProfile = async (user: User): Promise<UserProfile> => {
  const client = ensureSupabase();
  const fallbackProfile: UserProfile = {
    id: user.id,
    email: user.email ?? '',
    fullName:
      (user.user_metadata.full_name as string | undefined) ??
      (user.user_metadata.name as string | undefined) ??
      user.email?.split('@')[0] ??
      'Customer',
    role: 'customer',
    createdAt: user.created_at ?? new Date().toISOString(),
  };

  try {
    const payload = {
      id: user.id,
      email: user.email ?? '',
      full_name: fallbackProfile.fullName,
      phone: null,
      role: 'customer',
      avatar_url: null,
      created_at: fallbackProfile.createdAt,
    };

    await client.from('users').upsert(payload);
    const { data } = await client.from('users').select('*').eq('id', user.id).single();

    if (!data) {
      return fallbackProfile;
    }

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      phone: data.phone ?? undefined,
      role: data.role ?? 'customer',
      avatarUrl: data.avatar_url ?? undefined,
      createdAt: data.created_at ?? fallbackProfile.createdAt,
    };
  } catch {
    return fallbackProfile;
  }
};

const mapCategoryRow = (row: Record<string, unknown>): Category => ({
  id: String(row.id),
  slug: String(row.slug),
  name: row.name as Category['name'],
  description: row.description as Category['description'],
  image: String(row.image),
  featured: Boolean(row.featured),
});

const mapProductRow = (row: Record<string, unknown>): Product =>
  normalizeProduct({
    id: String(row.id),
    slug: String(row.slug),
    sku: String(row.sku),
    name: row.name as Product['name'],
    category: String(row.category),
    gender: isProductGender(row.gender) ? row.gender : 'unisex',
    price: Number(row.price),
    oldPrice: row.old_price ? Number(row.old_price) : null,
    description: row.description as Product['description'],
    material: row.material as Product['material'],
    careInstructions: row.care_instructions as Product['careInstructions'],
    sizes: Array.isArray(row.sizes) ? row.sizes.map(String) : [],
    colors: Array.isArray(row.colors) ? row.colors.map(String) : [],
    stock: Number(row.stock),
    rating: Number(row.rating),
    reviewCount: Number(row.review_count),
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    images: Array.isArray(row.images) ? row.images.map(String) : [],
    flags: row.flags as Product['flags'],
    popularity: Number(row.popularity ?? 0),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  });

const productToRow = (product: Product) => ({
  id: product.id,
  slug: product.slug,
  sku: product.sku,
  name: product.name,
  category: product.category,
  gender: product.gender,
  price: product.price,
  old_price: product.oldPrice,
  description: product.description,
  material: product.material,
  care_instructions: product.careInstructions,
  sizes: product.sizes,
  colors: product.colors,
  stock: product.stock,
  rating: product.rating,
  review_count: product.reviewCount,
  tags: product.tags,
  images: product.images,
  flags: product.flags,
  popularity: product.popularity,
  created_at: product.createdAt,
});

const categoryToRow = (category: Category) => ({
  id: category.id,
  slug: category.slug,
  name: category.name,
  description: category.description,
  image: category.image,
  featured: category.featured ?? false,
});

const mapOrderRow = (row: Record<string, unknown>): Order => {
  const items = Array.isArray(row.order_items)
    ? (row.order_items as Record<string, unknown>[]).map(
        (item): OrderItem => ({
          id: String(item.id),
          orderId: String(item.order_id),
          productId: item.product_id ? String(item.product_id) : null,
          productName: item.product_name as OrderItem['productName'],
          price: Number(item.price),
          size: String(item.size ?? ''),
          color: String(item.color ?? ''),
          quantity: Number(item.quantity),
          image: String(item.image ?? ''),
        }),
      )
    : [];

  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : null,
    customerName: String(row.customer_name),
    email: String(row.email),
    phone: String(row.phone),
    address: String(row.address),
    city: String(row.city),
    paymentMethod: row.payment_method as Order['paymentMethod'],
    bankAccount: row.bank_account ? String(row.bank_account) : null,
    receiptImage: row.receipt_image ? String(row.receipt_image) : null,
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    status: row.status as OrderStatus,
    createdAt: String(row.created_at ?? new Date().toISOString()),
    items,
  };
};

export const restoreAuthState = async (): Promise<{
  mode: BackendMode;
  sessionUser: SessionUser | null;
  profile: UserProfile | null;
}> => {
  if (!isSupabaseConfigured) {
    ensureDemoBootstrap();
    const session = readStorage<{ userId: string; email: string } | null>('demo-session', null);
    if (!session) {
      return { mode: 'demo', sessionUser: null, profile: null };
    }

    return {
      mode: 'demo',
      sessionUser: { id: session.userId, email: session.email },
      profile: mapProfile(getDemoProfile(session.userId)),
    };
  }

  try {
    const client = ensureSupabase();
    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return { mode: 'supabase', sessionUser: null, profile: null };
    }

    const profile = await ensureSupabaseProfile(user);
    return {
      mode: 'supabase',
      sessionUser: { id: user.id, email: user.email ?? '' },
      profile,
    };
  } catch {
    return { mode: 'supabase', sessionUser: null, profile: null };
  }
};

export const subscribeToAuthChanges = (
  callback: (payload: {
    mode: BackendMode;
    sessionUser: SessionUser | null;
    profile: UserProfile | null;
  }) => void,
) => {
  if (!isSupabaseConfigured || !supabase) {
    return () => undefined;
  }

  const subscription = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) {
      callback({ mode: 'supabase', sessionUser: null, profile: null });
      return;
    }

    const profile = await ensureSupabaseProfile(session.user);
    callback({
      mode: 'supabase',
      sessionUser: { id: session.user.id, email: session.user.email ?? '' },
      profile,
    });
  });

  return () => {
    subscription.data.subscription.unsubscribe();
  };
};

export const signIn = async (email: string, password: string) => {
  if (!isSupabaseConfigured) {
    ensureDemoBootstrap();
    await sleep(250);
    const user = readStorage<DemoUserRecord[]>('demo-users', demoAccounts).find(
      (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password,
    );

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    writeStorage('demo-session', { userId: user.id, email: user.email });
    return {
      mode: 'demo' as const,
      sessionUser: { id: user.id, email: user.email },
      profile: mapProfile(user),
    };
  }

  const client = ensureSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }

  const profile = data.user ? await ensureSupabaseProfile(data.user) : null;
  return {
    mode: 'supabase' as const,
    sessionUser: data.user ? { id: data.user.id, email: data.user.email ?? '' } : null,
    profile,
  };
};

export const signUp = async (fullName: string, email: string, password: string) => {
  if (!isSupabaseConfigured) {
    ensureDemoBootstrap();
    await sleep(300);
    const users = readStorage<DemoUserRecord[]>('demo-users', demoAccounts);
    const exists = users.some((entry) => entry.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error('An account with this email already exists.');
    }

    const user: DemoUserRecord = {
      id: createId('demo-user'),
      email,
      password,
      fullName,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    writeStorage('demo-users', [...users, user]);
    writeStorage('demo-session', { userId: user.id, email: user.email });

    return {
      mode: 'demo' as const,
      sessionUser: { id: user.id, email: user.email },
      profile: mapProfile(user),
    };
  }

  const client = ensureSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: import.meta.env.VITE_SITE_URL,
    },
  });

  if (error) {
    throw error;
  }

  const profile = data.user ? await ensureSupabaseProfile(data.user) : null;
  return {
    mode: 'supabase' as const,
    sessionUser: data.user ? { id: data.user.id, email: data.user.email ?? '' } : null,
    profile,
  };
};

export const signOut = async () => {
  if (!isSupabaseConfigured) {
    removeStorage('demo-session');
    return;
  }

  const client = ensureSupabase();
  await client.auth.signOut();
};

export const fetchCatalog = async (): Promise<{
  mode: BackendMode;
  categories: Category[];
  products: Product[];
}> => {
  if (!isSupabaseConfigured) {
    ensureDemoBootstrap();
    await sleep(450);
    return {
      mode: 'demo',
      categories: readStorage('demo-categories', demoCategories),
      products: readStorage<Product[]>('demo-products', demoProducts).map(normalizeProduct),
    };
  }

  try {
    const client = ensureSupabase();
    const [{ data: categoryRows, error: categoryError }, { data: productRows, error: productError }] =
      await Promise.all([
        client.from('categories').select('*').order('slug'),
        client.from('products').select('*').order('created_at', { ascending: false }),
      ]);

    if (categoryError) {
      throw categoryError;
    }
    if (productError) {
      throw productError;
    }

    return {
      mode: 'supabase',
      categories:
        categoryRows && categoryRows.length
          ? categoryRows.map((row) => mapCategoryRow(row as Record<string, unknown>))
          : demoCategories,
      products:
        productRows && productRows.length
          ? productRows.map((row) => mapProductRow(row as Record<string, unknown>))
          : demoProducts.map(normalizeProduct),
    };
  } catch {
    return {
      mode: 'supabase',
      categories: demoCategories,
      products: demoProducts.map(normalizeProduct),
    };
  }
};

export const fetchOrders = async (
  userId?: string,
  isAdmin = false,
): Promise<Order[]> => {
  if (!isSupabaseConfigured) {
    ensureDemoBootstrap();
    await sleep(250);
    const orders = readStorage<Order[]>('demo-orders', createStarterOrders());
    return isAdmin || !userId ? orders : orders.filter((order) => order.userId === userId);
  }

  const client = ensureSupabase();
  let query = client
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (userId && !isAdmin) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapOrderRow(row as Record<string, unknown>));
};

export const createOrder = async (payload: {
  form: CheckoutFormValues;
  items: CartItem[];
  user: SessionUser | null;
  email?: string;
}) => {
  const subtotal = payload.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal >= 300 ? 0 : 15;
  const total = subtotal + deliveryFee;
  const orderId = createId('order');

  const order: Order = {
    id: orderId,
    userId: payload.user?.id ?? null,
    customerName: payload.form.name,
    email: payload.email ?? payload.user?.email ?? 'guest@alexandralimitedcollection.com',
    phone: payload.form.phone,
    address: payload.form.address,
    city: payload.form.city,
    paymentMethod: payload.form.paymentMethod,
    bankAccount: getBankTransferAccount(payload.form.paymentMethod)?.account ?? null,
    receiptImage: payload.form.receiptImage ?? null,
    subtotal,
    deliveryFee,
    total,
    status: 'pending',
    createdAt: new Date().toISOString(),
    items: payload.items.map((item) => ({
      id: createId('order-item'),
      orderId,
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      image: item.product.images[0] ?? '',
    })),
  };

  if (!isSupabaseConfigured) {
    ensureDemoBootstrap();
    const orders = readStorage<Order[]>('demo-orders', createStarterOrders());
    writeStorage('demo-orders', [order, ...orders]);
    return order;
  }

  const client = ensureSupabase();
  const { error: orderError } = await client.from('orders').insert({
    id: order.id,
    user_id: order.userId,
    customer_name: order.customerName,
    email: order.email,
    phone: order.phone,
    address: order.address,
    city: order.city,
    payment_method: order.paymentMethod,
    bank_account: order.bankAccount,
    receipt_image: order.receiptImage,
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    total: order.total,
    status: order.status,
    created_at: order.createdAt,
  });

  if (orderError) {
    throw orderError;
  }

  const { error: itemsError } = await client.from('order_items').insert(
    order.items.map((item) => ({
      id: item.id,
      order_id: item.orderId,
      product_id: item.productId,
      product_name: item.productName,
      price: item.price,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      image: item.image,
    })),
  );

  if (itemsError) {
    throw itemsError;
  }

  return order;
};

export const saveProduct = async (product: Product) => {
  if (!isSupabaseConfigured) {
    ensureDemoBootstrap();
    const products = readStorage<Product[]>('demo-products', demoProducts);
    const next = [...products.filter((entry) => entry.id !== product.id), normalizeProduct(product)].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    writeStorage('demo-products', next);
    return product;
  }

  const client = ensureSupabase();
  const { error } = await client.from('products').upsert(productToRow(product));
  if (error) {
    throw error;
  }

  return product;
};

export const deleteProduct = async (productId: string) => {
  if (!isSupabaseConfigured) {
    ensureDemoBootstrap();
    const products = readStorage<Product[]>('demo-products', demoProducts).filter(
      (product) => product.id !== productId,
    );
    writeStorage('demo-products', products);
    return;
  }

  const client = ensureSupabase();
  const { error } = await client.from('products').delete().eq('id', productId);
  if (error) {
    throw error;
  }
};

export const saveCategory = async (category: Category) => {
  if (!isSupabaseConfigured) {
    ensureDemoBootstrap();
    const categories = readStorage<Category[]>('demo-categories', demoCategories);
    const next = [...categories.filter((entry) => entry.slug !== category.slug), category].sort((a, b) =>
      a.slug.localeCompare(b.slug),
    );
    writeStorage('demo-categories', next);
    return category;
  }

  const client = ensureSupabase();
  const { error } = await client.from('categories').upsert(categoryToRow(category));
  if (error) {
    throw error;
  }

  return category;
};

export const deleteCategory = async (slug: string) => {
  if (!isSupabaseConfigured) {
    ensureDemoBootstrap();
    const products = readStorage<Product[]>('demo-products', demoProducts);
    if (products.some((product) => product.category === slug)) {
      throw new Error('Remove or move products in this category before deleting it.');
    }
    const categories = readStorage<Category[]>('demo-categories', demoCategories).filter(
      (category) => category.slug !== slug,
    );
    writeStorage('demo-categories', categories);
    return;
  }

  const client = ensureSupabase();
  const { data: productRows } = await client.from('products').select('id').eq('category', slug);
  if (productRows && productRows.length > 0) {
    throw new Error('Remove or move products in this category before deleting it.');
  }

  const { error } = await client.from('categories').delete().eq('slug', slug);
  if (error) {
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  if (!isSupabaseConfigured) {
    ensureDemoBootstrap();
    const orders = readStorage<Order[]>('demo-orders', createStarterOrders()).map((order) =>
      order.id === orderId ? { ...order, status } : order,
    );
    writeStorage('demo-orders', orders);
    return;
  }

  const client = ensureSupabase();
  const { error } = await client.from('orders').update({ status }).eq('id', orderId);
  if (error) {
    throw error;
  }
};

export const seedBundledCatalog = async () => {
  if (!isSupabaseConfigured) {
    ensureDemoBootstrap();
    return;
  }

  const client = ensureSupabase();
  const { error: categoryError } = await client
    .from('categories')
    .upsert(demoCategories.map(categoryToRow));
  if (categoryError) {
    throw categoryError;
  }

  const { error: productError } = await client
    .from('products')
    .upsert(demoProducts.map(productToRow));
  if (productError) {
    throw productError;
  }
};
