import { useEffect } from 'react';

import { Badge } from '@/components/common/badge';
import { SectionHeading } from '@/components/common/section-heading';
import { useLocale, useTranslation } from '@/hooks/use-translation';
import { getDashboardStats, useCommerceStore } from '@/store/commerce-store';
import { formatCurrency, getLocalizedText } from '@/utils/format';

export const AdminDashboardPage = () => {
  const dictionary = useTranslation();
  const locale = useLocale();
  const products = useCommerceStore((state) => state.products);
  const orders = useCommerceStore((state) => state.orders);
  const loadOrders = useCommerceStore((state) => state.loadOrders);
  const backendMode = useCommerceStore((state) => state.backendMode);

  useEffect(() => {
    void loadOrders(undefined, true);
  }, [loadOrders]);

  const stats = getDashboardStats(products, orders);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow={backendMode === 'supabase' ? dictionary.misc.supabaseBadge : dictionary.misc.demoBadge}
        title={dictionary.admin.overview}
        description={dictionary.admin.seedHint}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        <div className="surface-panel p-4 sm:p-6">
          <p className="text-sm text-neutral-500">{dictionary.admin.stats.products}</p>
          <p className="mt-3 font-heading text-3xl font-bold sm:text-4xl">{stats.productCount}</p>
        </div>
        <div className="surface-panel p-4 sm:p-6">
          <p className="text-sm text-neutral-500">{dictionary.admin.stats.orders}</p>
          <p className="mt-3 font-heading text-3xl font-bold sm:text-4xl">{stats.orderCount}</p>
        </div>
        <div className="surface-panel p-4 sm:p-6">
          <p className="text-sm text-neutral-500">{dictionary.admin.stats.revenue}</p>
          <p className="mt-3 break-words font-heading text-3xl font-bold sm:text-4xl">{formatCurrency(stats.revenue, locale)}</p>
        </div>
        <div className="surface-panel p-4 sm:p-6">
          <p className="text-sm text-neutral-500">{dictionary.admin.stats.lowStock}</p>
          <p className="mt-3 font-heading text-3xl font-bold sm:text-4xl">{stats.lowStock.length}</p>
        </div>
      </div>

      <div className="surface-panel p-4 sm:p-6">
        <h2 className="break-words font-heading text-2xl font-bold leading-tight sm:text-3xl">{dictionary.common.lowStock}</h2>
        <div className="mt-6 grid gap-4">
          {stats.lowStock.map((product) => (
            <div key={product.id} className="flex flex-col gap-4 rounded-[20px] bg-black/5 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:rounded-[24px] sm:p-4">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <img src={product.images[0]} alt={product.name.en} className="h-16 w-14 rounded-2xl object-cover" />
                <div className="min-w-0">
                  <p className="break-words font-semibold">{getLocalizedText(product.name, locale)}</p>
                  <p className="text-sm text-neutral-500">
                    {dictionary.common.stock}: {product.stock}
                  </p>
                </div>
              </div>
              <Badge className="bg-neutral-900 text-white">{dictionary.product.lowStock}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
