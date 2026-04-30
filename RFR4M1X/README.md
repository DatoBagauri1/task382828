# ALEXANDRA LIMITED COLLECTION

Production-ready fashion e-commerce storefront built with React, Vite, TypeScript, Tailwind CSS, Framer Motion, Zustand, React Router, and Supabase.

The app ships with a polished demo mode out of the box, then upgrades cleanly to a real Supabase-backed store once environment variables and database tables are connected.

## Highlights

- Bilingual storefront with English and Georgian UI
- 45 realistic fashion products across 9 categories
- Hero landing page, category discovery, trending, sale, gallery, testimonials, and newsletter
- Shop page with live search, gender/category filters, sorting, pagination, and quick view
- Product page with gallery, stock state, material and care details, wishlist, and related products
- Cart drawer, full cart page, Georgian phone validation, checkout, order confirmation, and order history
- Checkout supports cash on delivery plus TBC and Bank of Georgia transfer flows with receipt image upload for admin review
- Supabase auth integration with protected profile and admin routes
- Admin dashboard for products, categories, orders, revenue, and low-stock alerts
- Fixed premium white, black, and grey visual system
- Netlify-ready SPA routing and production build config

## Tech Stack

- React 19
- Vite 8
- TypeScript 6
- Tailwind CSS 3
- Framer Motion
- Zustand
- React Router
- Supabase JS
- React Hook Form + Zod
- React Helmet Async
- React Hot Toast

## Demo Mode

If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are not set, the app runs in local demo mode using bundled catalog data and localStorage persistence.

Demo accounts:

- Admin: `admin@alexandralimitedcollection.com` / `Admin123!`
- Customer: `hello@alexandralimitedcollection.com` / `Shopper123!`

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SITE_URL=http://localhost:5173
VITE_ADMIN_EMAILS=admin@alexandralimitedcollection.com
```

`VITE_SITE_URL` should match your local or deployed frontend URL for auth redirects.

### 3. Run locally

```bash
npm run dev
```

### 4. Production build

```bash
npm run build
```

### 5. Lint

```bash
npm run lint
```

## Supabase Setup

### 1. Create a Supabase project

- Create a new Supabase project
- Open the SQL Editor
- [schema.sql](/c:/RFR4M1X/supabase/schema.sql)

### 2. Create your first admin

The schema creates customer profiles automatically after signup. To promote an account to admin after registering, run:

```sql
update public.users
set role = 'admin'
where email = 'your-admin@email.com';
```

### 3. Seed products

There are two ways to seed products:

- Keep demo mode for browsing without a database catalog
- Sign in as an admin and use the `Seed bundled catalog` action in the admin dashboard

### 4. Auth notes

- The app uses Supabase Auth directly from the client
- New users are mirrored into `public.users`
- Profile and admin access are controlled through row-level security policies

## Database Tables

The schema includes the required tables:

- `users`
- `products`
- `orders`
- `order_items`

It also includes:

- `categories`
- bank transfer fields on orders: `bank_account` and `receipt_image`
- helper functions and RLS policies
- trigger for syncing `auth.users` into `public.users`

## Checkout Payments

- Buyer phone numbers are required in Georgian mobile format: `+995 555 999 000`
- Cash on delivery stays available and does not require a receipt
- TBC and Bank of Georgia transfer orders require a receipt screenshot or photo before checkout can submit
- Admins can open the uploaded receipt from the order card and compare it against the receiver account and order total
- Demo bank receiver details live in [payments.ts](/c:/RFR4M1X/src/lib/payments.ts) and should be replaced with real merchant account numbers before live use

## Netlify Deployment

### Option 1. Deploy from Git

- Push the repo to GitHub, GitLab, or Bitbucket
- Import the project into Netlify
- Set build command to `npm run build`
- Set publish directory to `dist`
- Add the same Vite environment variables in Netlify

The repo already includes:

- [netlify.toml](/c:/RFR4M1X/netlify.toml)
- [public/_redirects](/c:/RFR4M1X/public/_redirects)

These handle SPA redirects for React Router.

### Option 2. Manual deploy

```bash
npm run build
```

Upload the generated `dist/` folder to Netlify.

## Project Structure

```text
src/
  admin/
  assets/
  components/
  hooks/
  i18n/
  layouts/
  lib/
  pages/
  store/
  types/
  utils/
supabase/
  schema.sql
```

## Verified

- `npm install` completed successfully
- `npm run dev` responded successfully on `http://127.0.0.1:5173`
- `npm run build` completed successfully
- `npm run lint` completed successfully

## Notes

- Product images use Unsplash URLs only
- Cart, language, wishlist, and demo mode persistence use localStorage
