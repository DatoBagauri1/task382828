import { zodResolver } from '@hookform/resolvers/zod';
import { Banknote, CheckCircle2, Landmark, Upload } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/common/button';
import { EmptyState } from '@/components/common/empty-state';
import { SEO } from '@/components/common/seo';
import { useTranslation, useLocale } from '@/hooks/use-translation';
import { getBankTransferAccount } from '@/lib/payments';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useCommerceStore } from '@/store/commerce-store';
import { formatCurrency, getLocalizedText } from '@/utils/format';

const normalizeGeorgianPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');

  if (digits.startsWith('995')) {
    return `+${digits}`;
  }

  if (digits.startsWith('5') && digits.length === 9) {
    return `+995${digits}`;
  }

  return value.trim();
};

const georgianMobilePattern = /^\+9955\d{8}$/;

const checkoutSchema = z
  .object({
    name: z.string().trim().min(2),
    phone: z
      .string()
      .trim()
      .transform(normalizeGeorgianPhone)
      .refine((value) => georgianMobilePattern.test(value), {
        message: 'Use a Georgian mobile number like +995 555 999 000.',
      }),
    address: z.string().trim().min(5),
    city: z.string().trim().min(2),
    paymentMethod: z.enum(['cash_on_delivery', 'tbc_transfer', 'bog_transfer']),
    receiptImage: z.string().nullable().optional(),
  })
  .superRefine((values, context) => {
    if (values.paymentMethod !== 'cash_on_delivery' && !values.receiptImage) {
      context.addIssue({
        code: 'custom',
        path: ['receiptImage'],
        message: 'Upload a payment receipt for bank transfers.',
      });
    }
  });

type CheckoutValues = z.infer<typeof checkoutSchema>;

const compressReceiptImage = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxDimension = 1280;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('Could not prepare the receipt image.'));
          return;
        }

        canvas.width = width;
        canvas.height = height;
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.onerror = () => reject(new Error('Could not read the receipt image.'));
      image.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Could not read the image.'));
    reader.readAsDataURL(file);
  });

export const CheckoutPage = () => {
  const dictionary = useTranslation();
  const locale = useLocale();
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const sessionUser = useAuthStore((state) => state.sessionUser);
  const createOrder = useCommerceStore((state) => state.createOrder);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      city: '',
      paymentMethod: 'cash_on_delivery',
      receiptImage: null,
    },
  });

  const paymentMethod = useWatch({ control: form.control, name: 'paymentMethod' });
  const receiptImage = useWatch({ control: form.control, name: 'receiptImage' });
  const selectedBank = getBankTransferAccount(paymentMethod);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal >= 300 || subtotal === 0 ? 0 : 15;
  const total = subtotal + deliveryFee;
  const inputClass = (hasError = false, className = '') =>
    `min-h-12 w-full rounded-[20px] border bg-transparent px-4 text-base outline-none transition focus:border-neutral-950 sm:text-sm ${
      hasError ? 'border-neutral-950 bg-neutral-950/[0.03]' : 'border-black/10'
    } ${className}`;
  const fieldError = (field: keyof Pick<CheckoutValues, 'name' | 'address' | 'city'>) =>
    form.formState.errors[field] ? (
      <p className="mt-2 text-xs font-semibold text-neutral-950">
        {dictionary.checkout.fieldRequired}
      </p>
    ) : null;

  const handleReceiptUpload = async (file: File | undefined) => {
    if (!file) {
      form.setValue('receiptImage', null, { shouldValidate: true });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error(dictionary.checkout.receiptImageOnly);
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error(dictionary.checkout.receiptTooLarge);
      return;
    }

    try {
      const dataUrl = await compressReceiptImage(file);
      form.setValue('receiptImage', dataUrl, { shouldDirty: true, shouldValidate: true });
      toast.success(dictionary.checkout.receiptUploaded);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : dictionary.misc.checkoutFailed);
    }
  };

  const handleCheckout = form.handleSubmit(async (values) => {
    try {
      const order = await createOrder({
        form: values,
        items,
        user: sessionUser,
        email: sessionUser?.email,
      });
      clearCart();
      toast.success(dictionary.misc.orderPlaced);
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : dictionary.misc.checkoutFailed);
    }
  });

  if (!items.length) {
    return (
      <div className="container-shell section-space">
        <EmptyState
          title={dictionary.cart.emptyTitle}
          description={dictionary.cart.emptyDescription}
          actionHref="/shop"
          actionLabel={dictionary.common.shopNow}
        />
      </div>
    );
  }

  return (
    <>
      <SEO title={`${dictionary.checkout.title} | ALEXANDRA LIMITED COLLECTION`} description={dictionary.checkout.description} />
      <div className="container-shell section-space">
        <div className="mb-8">
          <p className="eyebrow">{dictionary.common.checkout}</p>
          <h1 className="mt-3 break-words font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{dictionary.checkout.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-neutral-600 sm:text-base">
            {dictionary.checkout.description}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <form className="surface-panel space-y-6 p-4 sm:space-y-8 sm:p-8" onSubmit={handleCheckout}>
            <section className="space-y-4">
              <h2 className="break-words font-heading text-2xl font-bold leading-tight sm:text-3xl">{dictionary.checkout.customerDetails}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <input
                    {...form.register('name')}
                    type="text"
                    required
                    aria-invalid={Boolean(form.formState.errors.name)}
                    placeholder={dictionary.checkout.fields.name}
                    className={inputClass(Boolean(form.formState.errors.name))}
                  />
                  {fieldError('name')}
                </div>
                <div>
                  <input
                    {...form.register('phone')}
                    type="tel"
                    required
                    inputMode="tel"
                    aria-invalid={Boolean(form.formState.errors.phone)}
                    placeholder={dictionary.checkout.fields.phone}
                    className={inputClass(Boolean(form.formState.errors.phone))}
                  />
                  <p className="mt-2 text-xs text-neutral-500">
                    {dictionary.checkout.phoneHint}
                  </p>
                  {form.formState.errors.phone ? (
                    <p className="mt-2 text-xs font-semibold text-neutral-950">
                      {dictionary.checkout.phoneInvalid}
                    </p>
                  ) : null}
                </div>
                <div className="sm:col-span-2">
                  <input
                    {...form.register('address')}
                    type="text"
                    required
                    aria-invalid={Boolean(form.formState.errors.address)}
                    placeholder={dictionary.checkout.fields.address}
                    className={inputClass(Boolean(form.formState.errors.address), 'w-full')}
                  />
                  {fieldError('address')}
                </div>
                <div>
                  <input
                    {...form.register('city')}
                    type="text"
                    required
                    aria-invalid={Boolean(form.formState.errors.city)}
                    placeholder={dictionary.checkout.fields.city}
                    className={inputClass(Boolean(form.formState.errors.city))}
                  />
                  {fieldError('city')}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="break-words font-heading text-2xl font-bold leading-tight sm:text-3xl">{dictionary.checkout.payment}</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="surface-panel flex cursor-pointer flex-col gap-3 p-4 sm:p-5">
                  <input
                    {...form.register('paymentMethod')}
                    type="radio"
                    value="cash_on_delivery"
                    className="accent-black"
                  />
                  <div>
                    <Banknote className="mb-3 h-5 w-5 text-neutral-950" />
                    <p className="font-semibold">{dictionary.checkout.paymentCod}</p>
                    <p className="mt-2 text-sm text-neutral-500">
                      {dictionary.checkout.paymentCodHint}
                    </p>
                  </div>
                </label>
                <label className="surface-panel flex cursor-pointer flex-col gap-3 p-4 sm:p-5">
                  <input
                    {...form.register('paymentMethod')}
                    type="radio"
                    value="tbc_transfer"
                    className="accent-black"
                  />
                  <div>
                    <Landmark className="mb-3 h-5 w-5 text-neutral-950" />
                    <p className="font-semibold">{dictionary.checkout.paymentTbc}</p>
                    <p className="mt-2 text-sm text-neutral-500">
                      {dictionary.checkout.paymentTransferHint}
                    </p>
                  </div>
                </label>
                <label className="surface-panel flex cursor-pointer flex-col gap-3 p-4 sm:p-5">
                  <input
                    {...form.register('paymentMethod')}
                    type="radio"
                    value="bog_transfer"
                    className="accent-black"
                  />
                  <div>
                    <Landmark className="mb-3 h-5 w-5 text-neutral-950" />
                    <p className="font-semibold">{dictionary.checkout.paymentBog}</p>
                    <p className="mt-2 text-sm text-neutral-500">
                      {dictionary.checkout.paymentTransferHint}
                    </p>
                  </div>
                </label>
              </div>

              {selectedBank ? (
                <div className="rounded-[20px] border border-black/10 bg-black/[0.03] p-4 sm:rounded-[28px] sm:p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                        {dictionary.checkout.bankReceiver}
                      </p>
                      <p className="mt-2 font-semibold">{selectedBank.receiver}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                        {dictionary.checkout.bankAccount}
                      </p>
                      <p className="mt-2 break-all font-semibold">{selectedBank.account}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-neutral-600">
                    {dictionary.checkout.bankInstruction} {formatCurrency(total, locale)}.
                  </p>

                  <input type="hidden" {...form.register('receiptImage')} />
                  <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_180px]">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed border-black/20 p-4 text-center transition can-hover:hover:border-neutral-950 sm:rounded-[24px] sm:p-6">
                      <Upload className="mb-3 h-6 w-6 text-neutral-950" />
                      <span className="font-semibold">{dictionary.checkout.receiptUpload}</span>
                      <span className="mt-2 text-sm leading-7 text-neutral-500">
                        {dictionary.checkout.receiptInstructions}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(event) => void handleReceiptUpload(event.target.files?.[0])}
                      />
                    </label>
                    <div className="min-h-36 overflow-hidden rounded-[24px] bg-black/5">
                      {receiptImage ? (
                        <img
                          src={receiptImage}
                          alt={dictionary.checkout.receiptPreview}
                          className="h-full min-h-36 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full min-h-36 items-center justify-center p-4 text-center text-sm text-neutral-500">
                          {dictionary.checkout.receiptMissing}
                        </div>
                      )}
                    </div>
                  </div>
                  {receiptImage ? (
                    <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-neutral-950">
                      <CheckCircle2 className="h-4 w-4" />
                      {dictionary.checkout.receiptUploaded}
                    </p>
                  ) : null}
                  {form.formState.errors.receiptImage ? (
                    <p className="mt-3 text-sm text-neutral-950">
                      {dictionary.checkout.receiptRequired}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </section>

            <Button type="submit" size="lg" className="w-full">
              {dictionary.checkout.placeOrder}
            </Button>
          </form>

          <aside className="surface-panel h-fit space-y-5 p-4 sm:space-y-6 sm:p-6">
            <h2 className="break-words font-heading text-2xl font-bold leading-tight sm:text-3xl">{dictionary.checkout.summary}</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.product.images[0]}
                    alt={getLocalizedText(item.product.name, locale)}
                    className="h-16 w-14 shrink-0 rounded-2xl object-cover sm:h-20 sm:w-16"
                  />
                  <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{getLocalizedText(item.product.name, locale)}</p>
                      <p className="text-sm text-neutral-500">
                        {item.quantity} x {item.size}
                      </p>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(item.product.price * item.quantity, locale)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 border-t border-black/5 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span>{dictionary.common.subtotal}</span>
                <span>{formatCurrency(subtotal, locale)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{dictionary.common.delivery}</span>
                <span>{formatCurrency(deliveryFee, locale)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-bold">
                <span>{dictionary.common.total}</span>
                <span>{formatCurrency(total, locale)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};
