import { Link, useParams } from 'react-router-dom';

import { Button } from '@/components/common/button';
import { SEO } from '@/components/common/seo';
import { useLocale, useTranslation } from '@/hooks/use-translation';
import { useCommerceStore } from '@/store/commerce-store';

export const OrderConfirmationPage = () => {
  const dictionary = useTranslation();
  const locale = useLocale();
  const { orderId } = useParams();
  const orders = useCommerceStore((state) => state.orders);
  const order = orders.find((entry) => entry.id === orderId);

  return (
    <>
      <SEO
        title={`${dictionary.checkout.confirmationTitle} | ALEXANDRA LIMITED COLLECTION`}
        description={dictionary.checkout.confirmationDescription}
      />
      <div className="container-shell section-space">
        <div className="glass-panel mx-auto max-w-3xl px-8 py-12 text-center">
          <p className="eyebrow">{dictionary.common.order}</p>
          <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight">
            {dictionary.checkout.confirmationTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-neutral-600 sm:text-base">
            {dictionary.checkout.confirmationDescription}
          </p>
          {order ? (
            <div className="mx-auto mt-8 max-w-xl rounded-[28px] bg-white/70 p-6 text-left">
              <p className="text-sm font-semibold">{order.id}</p>
              <p className="mt-2 text-sm text-neutral-500">{order.customerName}</p>
              <p className="mt-2 text-sm text-neutral-500">
                {order.items.length} {locale === 'ka' ? 'ნივთი' : 'items'} / {order.city}
              </p>
            </div>
          ) : null}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/profile">
              <Button>{dictionary.profile.orderHistory}</Button>
            </Link>
            <Link to="/shop">
              <Button variant="secondary">{dictionary.common.continueShopping}</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
