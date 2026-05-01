import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/common/button';
import { EmptyState } from '@/components/common/empty-state';
import { SEO } from '@/components/common/seo';
import { useLocale, useTranslation } from '@/hooks/use-translation';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency, getLocalizedText } from '@/utils/format';

export const CartPage = () => {
  const dictionary = useTranslation();
  const locale = useLocale();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal >= 300 || subtotal === 0 ? 0 : 15;
  const total = subtotal + deliveryFee;

  return (
    <>
      <SEO title={`${dictionary.cart.title} | ALEXANDRA LIMITED COLLECTION`} description={dictionary.cart.emptyDescription} />
      <div className="container-shell section-space">
        <div className="mb-6 flex items-center gap-3 sm:mb-8">
          <ShoppingBag className="h-7 w-7 sm:h-8 sm:w-8" />
          <div>
            <p className="eyebrow">{dictionary.nav.cart}</p>
            <h1 className="mt-2 break-words font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {dictionary.cart.title}
            </h1>
          </div>
        </div>

        {items.length ? (
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="surface-panel flex flex-col gap-4 p-4 sm:flex-row sm:p-5">
                  <img
                    src={item.product.images[0]}
                    alt={getLocalizedText(item.product.name, locale)}
                    className="h-32 w-full rounded-[22px] object-cover sm:h-36 sm:w-32 sm:rounded-[28px]"
                  />
                  <div className="flex flex-1 flex-col gap-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                          {item.product.category}
                        </p>
                        <h2 className="mt-2 break-words font-heading text-xl font-bold leading-tight sm:text-2xl">
                          {getLocalizedText(item.product.name, locale)}
                        </h2>
                        <p className="mt-2 text-sm text-neutral-500">
                          {item.size} / {item.color}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-black/10 transition hover:bg-black/5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="inline-flex items-center gap-2 rounded-full ring-1 ring-black/10">
                        <button
                          type="button"
                          className="p-3"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          className="p-3"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-xl font-bold">
                        {formatCurrency(item.product.price * item.quantity, locale)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="surface-panel h-fit space-y-5 p-4 sm:space-y-6 sm:p-6">
              <h2 className="break-words font-heading text-2xl font-bold leading-tight sm:text-3xl">{dictionary.checkout.summary}</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>{dictionary.common.subtotal}</span>
                  <span>{formatCurrency(subtotal, locale)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{dictionary.common.delivery}</span>
                  <span>{formatCurrency(deliveryFee, locale)}</span>
                </div>
                <div className="rounded-[24px] bg-black/5 p-4">
                  <p className="font-semibold">{dictionary.cart.discount}</p>
                  <input
                    type="text"
                    placeholder={dictionary.cart.discountPlaceholder}
                    className="mt-3 min-h-11 w-full rounded-full border border-black/10 bg-transparent px-4 text-base outline-none sm:text-sm"
                  />
                  <p className="mt-2 text-xs text-neutral-500">
                    {dictionary.cart.discountHint}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-black/5 pt-4 text-base font-bold">
                  <span>{dictionary.common.total}</span>
                  <span>{formatCurrency(total, locale)}</span>
                </div>
              </div>
              <div className="grid gap-3">
                <Link to="/checkout">
                  <Button size="lg" className="w-full">
                    {dictionary.common.checkout}
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button size="lg" variant="secondary" className="w-full">
                    {dictionary.common.continueShopping}
                  </Button>
                </Link>
              </div>
            </aside>
          </div>
        ) : (
          <EmptyState
            title={dictionary.cart.emptyTitle}
            description={dictionary.cart.emptyDescription}
            actionHref="/shop"
            actionLabel={dictionary.common.shopNow}
          />
        )}
      </div>
    </>
  );
};
