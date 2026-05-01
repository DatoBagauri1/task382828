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
        <div className="glass-panel mx-auto max-w-3xl px-4 py-8 text-center sm:px-8 sm:py-12">
          <p className="eyebrow">{dictionary.common.order}</p>
          <h1 className="mt-3 break-words font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {dictionary.checkout.confirmationTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-neutral-600 sm:text-base">
            {dictionary.checkout.confirmationDescription}
          </p>
          {order ? (
            <div className="mx-auto mt-6 max-w-xl rounded-[20px] bg-white/70 p-4 text-left sm:mt-8 sm:rounded-[28px] sm:p-6">
              <p className="break-all text-sm font-semibold">{order.id}</p>
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
