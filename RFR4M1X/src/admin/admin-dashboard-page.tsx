import { useEffect } from 'react';
import toast from 'react-hot-toast';

import { Badge } from '@/components/common/badge';
import { Button } from '@/components/common/button';
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
  const seedCatalog = useCommerceStore((state) => state.seedCatalog);
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
        action={
          <Button
            variant="secondary"
            onClick={async () => {
              try {
                await seedCatalog();
                toast.success(dictionary.misc.seeded);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : dictionary.misc.seedFailed);
              }
            }}
          >
            {dictionary.admin.seedCatalog}
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="surface-panel p-6">
          <p className="text-sm text-neutral-500">{dictionary.admin.stats.products}</p>
          <p className="mt-3 font-heading text-4xl font-bold">{stats.productCount}</p>
        </div>
        <div className="surface-panel p-6">
          <p className="text-sm text-neutral-500">{dictionary.admin.stats.orders}</p>
          <p className="mt-3 font-heading text-4xl font-bold">{stats.orderCount}</p>
        </div>
        <div className="surface-panel p-6">
          <p className="text-sm text-neutral-500">{dictionary.admin.stats.revenue}</p>
          <p className="mt-3 font-heading text-4xl font-bold">{formatCurrency(stats.revenue, locale)}</p>
        </div>
        <div className="surface-panel p-6">
          <p className="text-sm text-neutral-500">{dictionary.admin.stats.lowStock}</p>
          <p className="mt-3 font-heading text-4xl font-bold">{stats.lowStock.length}</p>
        </div>
      </div>

      <div className="surface-panel p-6">
        <h2 className="font-heading text-3xl font-bold">{dictionary.common.lowStock}</h2>
        <div className="mt-6 grid gap-4">
          {stats.lowStock.map((product) => (
            <div key={product.id} className="flex flex-col gap-4 rounded-[24px] bg-black/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <img src={product.images[0]} alt={product.name.en} className="h-16 w-14 rounded-2xl object-cover" />
                <div>
                  <p className="font-semibold">{getLocalizedText(product.name, locale)}</p>
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
