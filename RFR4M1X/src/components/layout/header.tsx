import { Heart, Languages, Menu, Search, Shield, ShoppingBag, User2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { Badge } from '@/components/common/badge';
import { Button } from '@/components/common/button';
import { useTranslation } from '@/hooks/use-translation';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useSettingsStore } from '@/store/settings-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { cn } from '@/utils/cn';

const navLinkBase =
  'rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100';

export const Header = () => {
  const dictionary = useTranslation();
  const location = useLocation();
  const [brandPrimary, brandSecondary = ''] = dictionary.brand.split(' LIMITED ');
  const locale = useSettingsStore((state) => state.locale);
  const toggleLocale = useSettingsStore((state) => state.toggleLocale);
  const setCartOpen = useSettingsStore((state) => state.setCartOpen);
  const isMobileMenuOpen = useSettingsStore((state) => state.isMobileMenuOpen);
  const setMobileMenuOpen = useSettingsStore((state) => state.setMobileMenuOpen);
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const profile = useAuthStore((state) => state.profile);

  const navItems = [
    { href: '/', label: dictionary.nav.home },
    { href: '/shop', label: dictionary.nav.shop },
    { href: '/shop?flag=new', label: dictionary.nav.newArrivals },
    { href: '/shop?flag=sale', label: dictionary.nav.sale },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur-xl">
      <div className="container-shell flex min-h-16 items-center justify-between gap-2 py-2 sm:min-h-20 sm:gap-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-full p-2.5 ring-1 ring-neutral-200 transition hover:bg-neutral-100 sm:p-3 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label={dictionary.brand}>
            <img
              src="/brand-logo.png"
              alt={dictionary.brand}
              className="h-10 w-10 shrink-0 rounded-full bg-black object-cover ring-1 ring-neutral-200 sm:h-12 sm:w-12"
            />
            <div className="hidden min-w-0 md:block">
              <p className="font-heading text-base font-bold leading-none">{brandPrimary}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase leading-none text-neutral-500">
                {brandSecondary ? `LIMITED ${brandSecondary}` : dictionary.misc.headerTagline}
              </p>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(navLinkBase, isActive && 'bg-neutral-100 text-neutral-950')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={toggleLocale}
            className="hidden rounded-full p-3 ring-1 ring-neutral-200 transition hover:bg-neutral-100 sm:flex"
            aria-label="Toggle language"
          >
            <Languages className="h-5 w-5" />
          </button>
          <Link
            to="/shop"
            className="hidden rounded-full p-3 ring-1 ring-neutral-200 transition hover:bg-neutral-100 sm:flex"
            aria-label={dictionary.common.search}
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            to="/wishlist"
            className="relative rounded-full p-2.5 ring-1 ring-neutral-200 transition hover:bg-neutral-100 sm:p-3"
            aria-label={dictionary.nav.wishlist}
          >
            <Heart className="h-5 w-5" />
            {wishlistCount ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[11px] font-bold text-white">
                {wishlistCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative rounded-full p-2.5 ring-1 ring-neutral-200 transition hover:bg-neutral-100 sm:p-3"
            aria-label={dictionary.nav.cart}
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </button>
          <Link
            to={profile ? '/profile' : '/auth'}
            className="rounded-full p-2.5 ring-1 ring-neutral-200 transition hover:bg-neutral-100 sm:p-3"
            aria-label={profile ? dictionary.nav.profile : dictionary.common.login}
          >
            <User2 className="h-5 w-5" />
          </Link>
          {profile?.role === 'admin' ? (
            <Link
              to="/admin"
              className="hidden rounded-full p-3 ring-1 ring-neutral-200 transition hover:bg-neutral-100 sm:flex"
              aria-label={dictionary.nav.admin}
            >
              <Shield className="h-5 w-5" />
            </Link>
          ) : null}
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{
          height: isMobileMenuOpen ? 'auto' : 0,
          opacity: isMobileMenuOpen ? 1 : 0,
        }}
        className="overflow-hidden border-t border-neutral-200 lg:hidden"
      >
        <div className="container-shell flex flex-col gap-3 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{locale.toUpperCase()}</Badge>
          </div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                navLinkBase,
                location.pathname === item.href && 'bg-neutral-100 text-neutral-950',
              )}
            >
              {item.label}
            </Link>
          ))}
          {profile?.role === 'admin' ? (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className={navLinkBase}>
              {dictionary.nav.admin}
            </Link>
          ) : null}
          <div className="pt-2">
            <Button size="sm" variant="secondary" onClick={toggleLocale}>
              {locale === 'en' ? 'KA' : 'EN'}
            </Button>
          </div>
        </div>
      </motion.div>
    </header>
  );
};
