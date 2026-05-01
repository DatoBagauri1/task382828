import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { Button } from '@/components/common/button';
import { EmptyState } from '@/components/common/empty-state';
import { SEO } from '@/components/common/seo';
import { useLocale, useTranslation } from '@/hooks/use-translation';
import { useAuthStore } from '@/store/auth-store';
import { useCommerceStore } from '@/store/commerce-store';
import { formatCurrency, formatDate } from '@/utils/format';
import { orderStatusTone } from '@/utils/format';

export const ProfilePage = () => {
  const dictionary = useTranslation();
  const locale = useLocale();
  const profile = useAuthStore((state) => state.profile);
  const signOut = useAuthStore((state) => state.signOut);
  const orders = useCommerceStore((state) => state.orders);
  const loadOrders = useCommerceStore((state) => state.loadOrders);

  useEffect(() => {
    if (profile) {
      void loadOrders(profile.id, profile.role === 'admin');
    }
  }, [profile, loadOrders]);

  if (!profile) {
    return null;
  }

  return (
    <>
      <SEO title={`${dictionary.profile.title} | ALEXANDRA LIMITED COLLECTION`} description={dictionary.profile.accountDetails} />
      <div className="container-shell section-space space-y-8 sm:space-y-10">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:gap-8">
          <div className="surface-panel p-4 sm:p-8">
            <p className="eyebrow">{dictionary.profile.title}</p>
            <h1 className="mt-3 break-words font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{profile.fullName}</h1>
            <p className="mt-3 break-all text-sm text-neutral-500">{profile.email}</p>
            <div className="mt-6 space-y-3 text-sm text-neutral-600">
              <p>
                <span className="font-semibold">{dictionary.profile.role}: </span>
                {profile.role}
              </p>
              <p>
                <span className="font-semibold">{dictionary.profile.memberSince}: </span>
                {formatDate(profile.createdAt, locale)}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {profile.role === 'admin' ? (
                <Link to="/admin">
                  <Button variant="secondary">{dictionary.nav.admin}</Button>
                </Link>
              ) : null}
              <Button
                variant="ghost"
                onClick={async () => {
                  await signOut();
                  toast.success(dictionary.common.logout);
                }}
              >
                {dictionary.common.logout}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="eyebrow">{dictionary.profile.orderHistory}</p>
              <h2 className="mt-3 break-words font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                {dictionary.profile.orderHistory}
              </h2>
            </div>
            {orders.length ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="surface-panel p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="break-all text-sm font-semibold">{order.id}</p>
                        <p className="mt-2 text-sm text-neutral-500">
                          {formatDate(order.createdAt, locale)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${orderStatusTone[order.status]}`}>
                          {dictionary.orderStatus[order.status]}
                        </span>
                        <span className="text-lg font-bold">{formatCurrency(order.total, locale)}</span>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                          <span className="min-w-0 break-words">{item.productName[locale]} x {item.quantity}</span>
                          <span>{formatCurrency(item.price * item.quantity, locale)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title={dictionary.profile.noOrders}
                description={dictionary.cart.emptyDescription}
                actionHref="/shop"
                actionLabel={dictionary.common.shopNow}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
