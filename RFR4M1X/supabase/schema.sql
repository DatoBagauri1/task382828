create extension if not exists pgcrypto;

create or replace function public.is_admin(check_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = coalesce(check_user, auth.uid())
      and role = 'admin'
  );
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.categories (
  id text primary key,
  slug text not null unique,
  name jsonb not null,
  description jsonb not null,
  image text not null,
  featured boolean not null default false
);

create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  sku text not null unique,
  name jsonb not null,
  category text not null references public.categories(slug) on update cascade,
  gender text not null default 'unisex' check (gender in ('women', 'men', 'unisex')),
  price numeric(10, 2) not null,
  old_price numeric(10, 2),
  description jsonb not null,
  material jsonb not null,
  care_instructions jsonb not null,
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  rating numeric(2, 1) not null default 4.5,
  review_count integer not null default 0,
  tags text[] not null default '{}',
  images text[] not null default '{}',
  flags jsonb not null default '{"isFeatured":false,"isNew":false,"isSale":false}'::jsonb,
  popularity integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.products
add column if not exists gender text not null default 'unisex'
check (gender in ('women', 'men', 'unisex'));

update public.products
set gender = 'unisex'
where gender is null or gender not in ('women', 'men', 'unisex');

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_gender_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
    add constraint products_gender_check
    check (gender in ('women', 'men', 'unisex'));
  end if;
end $$;

create table if not exists public.orders (
  id text primary key,
  user_id uuid references public.users(id) on delete set null,
  customer_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  payment_method text not null check (payment_method in ('cash_on_delivery', 'tbc_transfer', 'bog_transfer')),
  bank_account text,
  receipt_image text,
  subtotal numeric(10, 2) not null,
  delivery_fee numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.orders
add column if not exists bank_account text;

alter table public.orders
add column if not exists receipt_image text;

alter table public.orders
drop constraint if exists orders_payment_method_check;

alter table public.orders
add constraint orders_payment_method_check
check (payment_method in ('cash_on_delivery', 'tbc_transfer', 'bog_transfer'));

create table if not exists public.order_items (
  id text primary key,
  order_id text not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  product_name jsonb not null,
  price numeric(10, 2) not null,
  size text,
  color text,
  quantity integer not null check (quantity > 0),
  image text
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'customer'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.users.full_name, excluded.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

grant execute on function public.is_admin(uuid) to anon, authenticated;

drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
on public.users
for select
to authenticated
using (id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users
for update
to authenticated
using (id = auth.uid() or public.is_admin(auth.uid()))
with check (id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "Admin can manage users" on public.users;
create policy "Admin can manage users"
on public.users
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Categories are public" on public.categories;
create policy "Categories are public"
on public.categories
for select
to anon, authenticated
using (true);

drop policy if exists "Admin can manage categories" on public.categories;
create policy "Admin can manage categories"
on public.categories
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Products are public" on public.products;
create policy "Products are public"
on public.products
for select
to anon, authenticated
using (true);

drop policy if exists "Admin can manage products" on public.products;
create policy "Admin can manage products"
on public.products
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders"
on public.orders
for select
to authenticated
using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "Guests and users can create orders" on public.orders;
create policy "Guests and users can create orders"
on public.orders
for insert
to anon, authenticated
with check (user_id is null or user_id = auth.uid());

drop policy if exists "Admin can update orders" on public.orders;
create policy "Admin can update orders"
on public.orders
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Admin can delete orders" on public.orders;
create policy "Admin can delete orders"
on public.orders
for delete
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "Users can read own order items" on public.order_items;
create policy "Users can read own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where public.orders.id = order_items.order_id
      and (public.orders.user_id = auth.uid() or public.is_admin(auth.uid()))
  )
);

drop policy if exists "Guests and users can create order items" on public.order_items;
create policy "Guests and users can create order items"
on public.order_items
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.orders
    where public.orders.id = order_items.order_id
      and (public.orders.user_id is null or public.orders.user_id = auth.uid() or public.is_admin(auth.uid()))
  )
);

drop policy if exists "Admin can update order items" on public.order_items;
create policy "Admin can update order items"
on public.order_items
for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Admin can delete order items" on public.order_items;
create policy "Admin can delete order items"
on public.order_items
for delete
to authenticated
using (public.is_admin(auth.uid()));
