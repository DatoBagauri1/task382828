import { useEffect } from 'react';
import { ExternalLink, ReceiptText } from 'lucide-react';
import toast from 'react-hot-toast';

import { Select } from '@/components/common/input';
import { useLocale, useTranslation } from '@/hooks/use-translation';
import { useCommerceStore } from '@/store/commerce-store';
import type { OrderStatus, PaymentMethod } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { orderStatusTone } from '@/utils/format';

export const AdminOrdersPage = () => {
  const dictionary = useTranslation();
  const locale = useLocale();
  const orders = useCommerceStore((state) => state.orders);
  const loadOrders = useCommerceStore((state) => state.loadOrders);
  const updateOrderStatus = useCommerceStore((state) => state.updateOrderStatus);
  const paymentLabels: Record<PaymentMethod, string> = {
    cash_on_delivery: dictionary.checkout.paymentCod,
    tbc_transfer: dictionary.checkout.paymentTbc,
    bog_transfer: dictionary.checkout.paymentBog,
  };

  useEffect(() => {
    void loadOrders(undefined, true);
  }, [loadOrders]);

  if (!orders.length) {
    return (
      <div className="surface-panel p-8 text-center">
        <p className="font-heading text-3xl font-bold">{dictionary.common.empty}</p>
        <p className="mt-3 text-sm text-neutral-500">{dictionary.admin.manageOrders}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {orders.map((order) => (
        <div
          key={order.id}
          className="overflow-hidden rounded-[34px] border border-black/10 bg-white shadow-[0_24px_80px_rgba(10,10,10,0.08)]"
        >
          <div className="border-b border-black/5 bg-gradient-to-r from-neutral-950 to-neutral-800 p-6 text-white">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/55">{dictionary.common.order}</p>
                <p className="mt-2 font-heading text-2xl font-bold">{order.id}</p>
                <p className="mt-2 text-sm text-white/65">
                  {order.customerName} / {order.city} / {formatDate(order.createdAt, locale)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-950">
                  {dictionary.orderStatus[order.status]}
                </span>
                <Select
                  value={order.status}
                  onChange={async (event) => {
                    try {
                      await updateOrderStatus(order.id, event.target.value as OrderStatus);
                      toast.success(dictionary.misc.saved);
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : dictionary.misc.updateFailed);
                    }
                  }}
                  className="h-11 min-w-40 border-white/20 bg-white text-neutral-950"
                >
                  {(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((status) => (
                    <option key={status} value={status}>
                      {dictionary.orderStatus[status]}
                    </option>
                  ))}
                </Select>
                <span className="font-heading text-2xl font-bold">{formatCurrency(order.total, locale)}</span>
              </div>
            </div>
          </div>
          <div className="p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{dictionary.common.details}</p>
              <p className="mt-3 font-semibold">{order.customerName}</p>
              <p className="mt-1 text-sm text-neutral-500">{order.phone}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${orderStatusTone[order.status]}`}>
                {dictionary.orderStatus[order.status]}
              </span>
            </div>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_0.9fr_1.2fr]">
            <div className="rounded-[26px] bg-black/[0.035] p-5 text-sm ring-1 ring-black/5">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                {dictionary.common.details}
              </p>
              <p className="mt-3 font-semibold">{order.customerName}</p>
              <p className="mt-1 text-neutral-500">{order.phone}</p>
              <p className="mt-1 text-neutral-500">
                {order.address}, {order.city}
              </p>
            </div>
            <div className="rounded-[26px] bg-black/[0.035] p-5 text-sm ring-1 ring-black/5">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                {dictionary.checkout.payment}
              </p>
              <p className="mt-3 font-semibold">
                {paymentLabels[order.paymentMethod] ?? order.paymentMethod.replace(/_/g, ' ')}
              </p>
              {order.bankAccount ? (
                <p className="mt-2 break-all text-neutral-500">
                  {dictionary.checkout.bankAccount}: {order.bankAccount}
                </p>
              ) : (
                <p className="mt-2 text-neutral-500">
                  {dictionary.checkout.paymentCodHint}
                </p>
              )}
            </div>
            <div className="rounded-[26px] bg-black/[0.035] p-5 text-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                  {dictionary.checkout.receiptUpload}
                </p>
                <ReceiptText className="h-4 w-4 text-neutral-500" />
              </div>
              {order.receiptImage ? (
                <a
                  href={order.receiptImage}
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-4 block overflow-hidden rounded-[24px] border border-black/10 bg-white"
                  aria-label={dictionary.checkout.receiptPreview}
                >
                  <img
                    src={order.receiptImage}
                    alt={dictionary.checkout.receiptPreview}
                    className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="flex items-center justify-between gap-3 border-t border-black/5 px-4 py-3 font-semibold">
                    {dictionary.checkout.receiptPreview}
                    <ExternalLink className="h-4 w-4" />
                  </span>
                </a>
              ) : (
                <p className="mt-4 rounded-[20px] border border-dashed border-black/15 bg-white p-4 leading-7 text-neutral-500">
                  {order.paymentMethod === 'cash_on_delivery'
                    ? dictionary.checkout.paymentCodHint
                    : dictionary.checkout.receiptMissing}
                </p>
              )}
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-[24px] bg-black/[0.035] px-4 py-3 text-sm">
                <span>
                  {item.productName[locale]} / {item.size} / {item.color} x {item.quantity}
                </span>
                <span>{formatCurrency(item.price * item.quantity, locale)}</span>
              </div>
            ))}
          </div>
          </div>
        </div>
      ))}
    </div>
  );
};
