import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { Button } from '@/components/common/button';
import { Modal } from '@/components/common/modal';
import { useTranslation } from '@/hooks/use-translation';
import { createId } from '@/lib/storage';
import { useCommerceStore } from '@/store/commerce-store';
import type { Category } from '@/types';
import { toSlug } from '@/utils/format';

const categorySchema = z.object({
  nameEn: z.string().min(2),
  nameKa: z.string().min(2),
  descriptionEn: z.string().min(10),
  descriptionKa: z.string().min(10),
  image: z.string().url(),
  featured: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const defaultValues: CategoryFormValues = {
  nameEn: '',
  nameKa: '',
  descriptionEn: '',
  descriptionKa: '',
  image: '',
  featured: false,
};

export const AdminCategoriesPage = () => {
  const dictionary = useTranslation();
  const categories = useCommerceStore((state) => state.categories);
  const saveCategory = useCommerceStore((state) => state.saveCategory);
  const deleteCategory = useCommerceStore((state) => state.deleteCategory);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });

  const openCreate = () => {
    setEditingCategory(null);
    form.reset(defaultValues);
    setIsOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      nameEn: category.name.en,
      nameKa: category.name.ka,
      descriptionEn: category.description.en,
      descriptionKa: category.description.ka,
      image: category.image,
      featured: Boolean(category.featured),
    });
    setIsOpen(true);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const slug = editingCategory?.slug ?? toSlug(values.nameEn);
    try {
      await saveCategory({
        id: editingCategory?.id ?? createId(slug),
        slug,
        name: { en: values.nameEn, ka: values.nameKa },
        description: { en: values.descriptionEn, ka: values.descriptionKa },
        image: values.image,
        featured: values.featured,
      });
      toast.success(dictionary.misc.saved);
      setIsOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : dictionary.misc.saveFailed);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button className="w-full sm:w-auto" onClick={openCreate}>{dictionary.admin.addCategory}</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <div key={category.id} className="surface-panel overflow-hidden">
            <img src={category.image} alt={category.name.en} className="h-40 w-full object-cover sm:h-48" />
            <div className="space-y-4 p-4 sm:p-5">
              <div>
                <h3 className="break-words font-heading text-xl font-bold leading-tight sm:text-2xl">{category.name.en}</h3>
                <p className="mt-2 text-sm leading-7 text-neutral-600">
                  {category.description.en}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:flex">
                <Button variant="secondary" className="w-full sm:w-auto" onClick={() => openEdit(category)}>
                  {dictionary.common.edit}
                </Button>
                <Button
                  variant="danger"
                  className="w-full sm:w-auto"
                  onClick={async () => {
                    try {
                      await deleteCategory(String(category.slug));
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
          </div>
        ))}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingCategory ? dictionary.common.edit : dictionary.admin.addCategory}
      >
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <input {...form.register('nameEn')} placeholder={dictionary.admin.form.nameEn} className="min-h-12 rounded-[20px] border border-black/10 bg-transparent px-4 text-base outline-none sm:text-sm" />
            <input {...form.register('nameKa')} placeholder={dictionary.admin.form.nameKa} className="min-h-12 rounded-[20px] border border-black/10 bg-transparent px-4 text-base outline-none sm:text-sm" />
          </div>
          <textarea {...form.register('descriptionEn')} rows={4} placeholder={dictionary.admin.form.descriptionEn} className="rounded-[20px] border border-black/10 bg-transparent px-4 py-3 text-base outline-none sm:text-sm" />
          <textarea {...form.register('descriptionKa')} rows={4} placeholder={dictionary.admin.form.descriptionKa} className="rounded-[20px] border border-black/10 bg-transparent px-4 py-3 text-base outline-none sm:text-sm" />
          <input {...form.register('image')} placeholder={dictionary.admin.form.image} className="min-h-12 rounded-[20px] border border-black/10 bg-transparent px-4 text-base outline-none sm:text-sm" />
          <label className="surface-panel flex items-center gap-3 p-4 text-sm">
            <input type="checkbox" {...form.register('featured')} />
            {dictionary.admin.form.featured}
          </label>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
            <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setIsOpen(false)}>
              {dictionary.common.cancel}
            </Button>
            <Button type="submit" className="w-full sm:w-auto">{dictionary.common.save}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
