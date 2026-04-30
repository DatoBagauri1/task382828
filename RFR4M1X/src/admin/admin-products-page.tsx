import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { Button } from '@/components/common/button';
import { Input, Select, Textarea } from '@/components/common/input';
import { Modal } from '@/components/common/modal';
import { useLocale, useTranslation } from '@/hooks/use-translation';
import { createId } from '@/lib/storage';
import { useCommerceStore } from '@/store/commerce-store';
import type { Product } from '@/types';
import { cn } from '@/utils/cn';
import { formatCurrency, toSlug } from '@/utils/format';

const splitList = (value: string) =>
  value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const productSchema = z.object({
  slug: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  nameEn: z.string().trim().min(2, 'Add the English product name.'),
  nameKa: z.string().trim().min(2, 'Add the Georgian product name.'),
  category: z.string().trim().min(1, 'Select a category.'),
  gender: z.enum(['women', 'men', 'unisex']),
  price: z.number().min(1, 'Price must be greater than 0.'),
  oldPrice: z.number().nullable().optional(),
  descriptionEn: z.string().trim().min(10, 'Add an English description.'),
  descriptionKa: z.string().trim().min(10, 'Add a Georgian description.'),
  materialEn: z.string().trim().min(3, 'Add English material details.'),
  materialKa: z.string().trim().min(3, 'Add Georgian material details.'),
  careEn: z.string().trim().min(3, 'Add English care instructions.'),
  careKa: z.string().trim().min(3, 'Add Georgian care instructions.'),
  sizes: z.string().trim().min(1, 'Add at least one size.'),
  colors: z.string().trim().min(1, 'Add at least one color.'),
  stock: z.number().min(0, 'Stock cannot be negative.'),
  rating: z.number().min(0).max(5, 'Rating must be between 0 and 5.'),
  reviewCount: z.number().min(0, 'Review count cannot be negative.'),
  popularity: z.number().min(0, 'Popularity cannot be negative.'),
  tags: z.string().trim().min(1, 'Add at least one tag.'),
  images: z
    .string()
    .trim()
    .min(5, 'Add at least one image URL.')
    .refine((value) => splitList(value).every(isValidUrl), 'Use valid image URLs only.'),
  isFeatured: z.boolean(),
  isNew: z.boolean(),
  isSale: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const defaultValues: ProductFormValues = {
  slug: '',
  sku: '',
  nameEn: '',
  nameKa: '',
  category: '',
  gender: 'unisex',
  price: 100,
  oldPrice: null,
  descriptionEn: '',
  descriptionKa: '',
  materialEn: '',
  materialKa: '',
  careEn: '',
  careKa: '',
  sizes: 'S, M, L',
  colors: 'Black, White',
  stock: 10,
  rating: 4.8,
  reviewCount: 24,
  popularity: 120,
  tags: 'clothing, collection',
  images: '',
  isFeatured: false,
  isNew: true,
  isSale: false,
};

const createProductIdentity = (baseSlug: string) => {
  const token = createId(baseSlug);
  return {
    id: token,
    slug: `${baseSlug}-${token.slice(-6)}`,
    sku: `SKU-${token.slice(-8).toUpperCase()}`,
  };
};

const FormSection = ({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => (
  <section className={cn('rounded-[28px] border border-neutral-200 bg-neutral-50 p-4 sm:p-5', className)}>
    <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
      {title}
    </h4>
    {children}
  </section>
);

const Field = ({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) => (
  <label className={cn('block space-y-2', className)}>
    <span className="text-sm font-semibold text-neutral-900">{label}</span>
    {children}
    {error ? <span className="block text-xs font-semibold text-neutral-950">{error}</span> : null}
  </label>
);

const listToText = (items: string[]) => items.join('\n');

export const AdminProductsPage = () => {
  const dictionary = useTranslation();
  const locale = useLocale();
  const products = useCommerceStore((state) => state.products);
  const categories = useCommerceStore((state) => state.categories);
  const saveProduct = useCommerceStore((state) => state.saveProduct);
  const deleteProduct = useCommerceStore((state) => state.deleteProduct);
  const loadCatalog = useCommerceStore((state) => state.loadCatalog);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
    mode: 'onBlur',
  });
  const watchedImages = useWatch({ control: form.control, name: 'images' });
  const imagePreviewUrls = splitList(watchedImages ?? '').filter(isValidUrl).slice(0, 4);
  const flagFields = [
    { name: 'isFeatured', label: dictionary.admin.form.featured },
    { name: 'isNew', label: dictionary.admin.form.isNew },
    { name: 'isSale', label: dictionary.admin.form.isSale },
  ] as const;

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const errorFor = (name: keyof ProductFormValues) =>
    form.formState.errors[name]?.message?.toString();

  const openCreate = () => {
    setEditingProduct(null);
    form.reset(defaultValues);
    setIsOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      slug: product.slug,
      sku: product.sku,
      nameEn: product.name.en,
      nameKa: product.name.ka,
      category: String(product.category),
      gender: product.gender,
      price: product.price,
      oldPrice: product.oldPrice,
      descriptionEn: product.description.en,
      descriptionKa: product.description.ka,
      materialEn: product.material.en,
      materialKa: product.material.ka,
      careEn: product.careInstructions.en,
      careKa: product.careInstructions.ka,
      sizes: listToText(product.sizes),
      colors: listToText(product.colors),
      stock: product.stock,
      rating: product.rating,
      reviewCount: product.reviewCount,
      popularity: product.popularity,
      tags: listToText(product.tags),
      images: listToText(product.images),
      isFeatured: product.flags.isFeatured,
      isNew: product.flags.isNew,
      isSale: product.flags.isSale,
    });
    setIsOpen(true);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const requestedSlug = toSlug(values.slug || values.nameEn) || 'product';
    const identity = createProductIdentity(requestedSlug);
    const nextProduct: Product = {
      id: editingProduct?.id ?? identity.id,
      slug: values.slug ? requestedSlug : editingProduct?.slug ?? identity.slug,
      sku: values.sku?.trim() || editingProduct?.sku || identity.sku,
      name: { en: values.nameEn.trim(), ka: values.nameKa.trim() },
      category: values.category,
      gender: values.gender,
      price: values.price,
      oldPrice: values.oldPrice ?? (values.isSale ? Math.round(values.price * 1.14) : null),
      description: { en: values.descriptionEn.trim(), ka: values.descriptionKa.trim() },
      material: { en: values.materialEn.trim(), ka: values.materialKa.trim() },
      careInstructions: { en: values.careEn.trim(), ka: values.careKa.trim() },
      sizes: splitList(values.sizes),
      colors: splitList(values.colors),
      stock: values.stock,
      rating: values.rating,
      reviewCount: values.reviewCount,
      popularity: values.popularity,
      tags: splitList(values.tags),
      images: splitList(values.images),
      flags: {
        isFeatured: values.isFeatured,
        isNew: values.isNew,
        isSale: values.isSale,
      },
      createdAt: editingProduct?.createdAt ?? new Date().toISOString(),
    };

    try {
      await saveProduct(nextProduct);
      toast.success(dictionary.misc.saved);
      setIsOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : dictionary.misc.saveFailed);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreate}>{dictionary.admin.addProduct}</Button>
      </div>
      <div className="grid gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="surface-panel flex flex-col gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-glass xl:flex-row xl:items-center xl:justify-between"
          >
            <div className="flex items-center gap-4">
              <img
                src={product.images[0] ?? '/brand-logo.png'}
                alt={product.name.en}
                className="h-24 w-20 rounded-2xl object-cover"
              />
              <div>
                <p className="font-heading text-xl font-bold">{product.name.en}</p>
                <p className="mt-1 text-sm text-neutral-500">
                  {product.category} / {dictionary.gender[product.gender]} / {product.sku}
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {formatCurrency(product.price, locale)} · {dictionary.common.stock}: {product.stock}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => openEdit(product)}>
                {dictionary.common.edit}
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  try {
                    await deleteProduct(product.id);
                    toast.success(dictionary.misc.deleted);
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : dictionary.misc.deleteFailed);
                  }
                }}
              >
                {dictionary.common.delete}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingProduct ? dictionary.admin.editProduct : dictionary.admin.addProduct}
        className="max-w-5xl"
      >
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <FormSection title={dictionary.admin.formSections.productBasics}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={dictionary.admin.form.nameEn} error={errorFor('nameEn')}>
                <Input {...form.register('nameEn')} className="rounded-[20px]" />
              </Field>
              <Field label={dictionary.admin.form.nameKa} error={errorFor('nameKa')}>
                <Input {...form.register('nameKa')} className="rounded-[20px]" />
              </Field>
              <Field label={dictionary.admin.form.slug} error={errorFor('slug')}>
                <Input {...form.register('slug')} className="rounded-[20px]" placeholder={dictionary.admin.form.autoGenerated} />
              </Field>
              <Field label={dictionary.admin.form.sku} error={errorFor('sku')}>
                <Input {...form.register('sku')} className="rounded-[20px]" placeholder={dictionary.admin.form.autoGenerated} />
              </Field>
              <Field label={dictionary.admin.form.category} error={errorFor('category')}>
                <Select {...form.register('category')} className="rounded-[20px]">
                  <option value="">{dictionary.misc.selectCategory}</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={String(category.slug)}>
                      {category.name[locale]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={dictionary.admin.form.gender} error={errorFor('gender')}>
                <Select {...form.register('gender')} className="rounded-[20px]">
                  <option value="women">{dictionary.gender.women}</option>
                  <option value="men">{dictionary.gender.men}</option>
                  <option value="unisex">{dictionary.gender.unisex}</option>
                </Select>
              </Field>
            </div>
          </FormSection>

          <FormSection title={dictionary.admin.formSections.pricingStock}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <Field label={dictionary.admin.form.price} error={errorFor('price')}>
                <Input {...form.register('price', { valueAsNumber: true })} type="number" className="rounded-[20px]" />
              </Field>
              <Field label={dictionary.admin.form.oldPrice} error={errorFor('oldPrice')}>
                <Input
                  {...form.register('oldPrice', {
                    setValueAs: (value) => (value === '' ? null : Number(value)),
                  })}
                  type="number"
                  className="rounded-[20px]"
                />
              </Field>
              <Field label={dictionary.admin.form.stock} error={errorFor('stock')}>
                <Input {...form.register('stock', { valueAsNumber: true })} type="number" className="rounded-[20px]" />
              </Field>
              <Field label={dictionary.admin.form.rating} error={errorFor('rating')}>
                <Input
                  {...form.register('rating', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="rounded-[20px]"
                />
              </Field>
              <Field label={dictionary.admin.form.reviewCount} error={errorFor('reviewCount')}>
                <Input
                  {...form.register('reviewCount', { valueAsNumber: true })}
                  type="number"
                  className="rounded-[20px]"
                />
              </Field>
              <Field label={dictionary.admin.form.popularity} error={errorFor('popularity')}>
                <Input
                  {...form.register('popularity', { valueAsNumber: true })}
                  type="number"
                  className="rounded-[20px]"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title={dictionary.admin.formSections.description}>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label={dictionary.admin.form.descriptionEn} error={errorFor('descriptionEn')}>
                <Textarea {...form.register('descriptionEn')} rows={5} />
              </Field>
              <Field label={dictionary.admin.form.descriptionKa} error={errorFor('descriptionKa')}>
                <Textarea {...form.register('descriptionKa')} rows={5} />
              </Field>
            </div>
          </FormSection>

          <FormSection title={dictionary.admin.formSections.materialCare}>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label={dictionary.admin.form.materialEn} error={errorFor('materialEn')}>
                <Textarea {...form.register('materialEn')} rows={3} />
              </Field>
              <Field label={dictionary.admin.form.materialKa} error={errorFor('materialKa')}>
                <Textarea {...form.register('materialKa')} rows={3} />
              </Field>
              <Field label={dictionary.admin.form.careEn} error={errorFor('careEn')}>
                <Textarea {...form.register('careEn')} rows={3} />
              </Field>
              <Field label={dictionary.admin.form.careKa} error={errorFor('careKa')}>
                <Textarea {...form.register('careKa')} rows={3} />
              </Field>
            </div>
          </FormSection>

          <FormSection title={dictionary.admin.formSections.optionsTags}>
            <div className="grid gap-4 lg:grid-cols-3">
              <Field label={dictionary.admin.form.sizes} error={errorFor('sizes')}>
                <Textarea {...form.register('sizes')} rows={4} />
              </Field>
              <Field label={dictionary.admin.form.colors} error={errorFor('colors')}>
                <Textarea {...form.register('colors')} rows={4} />
              </Field>
              <Field label={dictionary.admin.form.tags} error={errorFor('tags')}>
                <Textarea {...form.register('tags')} rows={4} />
              </Field>
            </div>
          </FormSection>

          <FormSection title={dictionary.admin.formSections.images}>
            <Field label={dictionary.admin.form.images} error={errorFor('images')}>
              <Textarea {...form.register('images')} rows={5} />
            </Field>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {imagePreviewUrls.length ? (
                imagePreviewUrls.map((image) => (
                  <img
                    key={image}
                    src={image}
                    alt=""
                    className="h-36 w-full rounded-[22px] object-cover"
                  />
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-neutral-300 p-6 text-sm text-neutral-500 sm:col-span-2 lg:col-span-4">
                  {dictionary.admin.form.imagePreviewEmpty}
                </div>
              )}
            </div>
          </FormSection>

          <FormSection title={dictionary.admin.formSections.storeFlags}>
            <div className="grid gap-3 sm:grid-cols-3">
              {flagFields.map((field) => (
                <label key={field.name} className="surface-panel flex items-center gap-3 p-4 text-sm font-semibold">
                  <input type="checkbox" className="h-4 w-4 accent-black" {...form.register(field.name)} />
                  {field.label}
                </label>
              ))}
            </div>
          </FormSection>

          <div className="sticky bottom-0 -mx-5 -mb-5 flex flex-col gap-3 border-t border-neutral-200 bg-white/95 p-5 backdrop-blur sm:-mx-7 sm:-mb-7 sm:flex-row sm:justify-end sm:p-7">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              {dictionary.common.cancel}
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {dictionary.common.save}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
