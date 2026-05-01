import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/common/button';
import { useLocale, useTranslation } from '@/hooks/use-translation';
import { useCartStore } from '@/store/cart-store';
import { useSettingsStore } from '@/store/settings-store';
import { formatCurrency, getLocalizedText } from '@/utils/format';

export const CartDrawer = () => {
  const dictionary = useTranslation();
  const locale = useLocale();
  const isOpen = useSettingsStore((state) => state.isCartOpen);
  const setCartOpen = useSettingsStore((state) => state.setCartOpen);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 bg-neutral-950/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCartOpen(false)}
        >
          <motion.aside
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[rgb(var(--background))] p-4 shadow-soft sm:p-5"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3 sm:mb-6">
              <div>
                <p className="eyebrow">{dictionary.nav.cart}</p>
                <h3 className="mt-2 break-words font-heading text-xl font-bold leading-tight sm:text-2xl">{dictionary.cart.drawerTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-full p-3 ring-1 ring-black/10 transition can-hover:hover:bg-black/5"
                aria-label={dictionary.common.close}
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto">
              {items.length ? (
                items.map((item) => (
                  <div key={item.id} className="surface-panel flex gap-3 p-3.5 sm:gap-4 sm:p-4">
                    <img
                      src={item.product.images[0]}
                      alt={getLocalizedText(item.product.name, locale)}
                      className="h-20 w-16 shrink-0 rounded-2xl object-cover sm:h-24 sm:w-20"
                    />
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="break-words text-sm font-semibold sm:text-base">
                            {getLocalizedText(item.product.name, locale)}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {item.size} / {item.color}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded-full p-2 transition can-hover:hover:bg-black/5"
                          aria-label={dictionary.common.delete}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between text-sm">
                        <span>
                          {dictionary.common.quantity}: {item.quantity}
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(item.product.price * item.quantity, locale)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="surface-panel flex flex-col items-center gap-4 px-6 py-10 text-center">
                  <ShoppingBag className="h-10 w-10 text-neutral-400" />
                  <div>
                    <h4 className="font-heading text-xl font-bold">{dictionary.cart.emptyTitle}</h4>
                    <p className="mt-2 text-sm leading-7 text-neutral-600">
                      {dictionary.cart.emptyDescription}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-4 border-t border-black/5 pt-4 sm:mt-6 sm:pt-6">
              <div className="flex items-center justify-between text-sm">
                <span>{dictionary.common.subtotal}</span>
                <span className="font-semibold">{formatCurrency(subtotal, locale)}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link to="/cart" onClick={() => setCartOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    {dictionary.nav.cart}
                  </Button>
                </Link>
                <Link to="/checkout" onClick={() => setCartOpen(false)}>
                  <Button className="w-full" disabled={!items.length}>
                    {dictionary.common.checkout}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
