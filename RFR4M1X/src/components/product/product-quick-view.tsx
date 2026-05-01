import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/common/button';
import { Modal } from '@/components/common/modal';
import { RatingStars } from '@/components/product/rating-stars';
import { useLocale, useTranslation } from '@/hooks/use-translation';
import { useCartStore } from '@/store/cart-store';
import type { Product } from '@/types';
import { formatCurrency, getLocalizedText } from '@/utils/format';

type ProductQuickViewProps = {
  product: Product | null;
  onClose: () => void;
};

export const ProductQuickView = ({ product, onClose }: ProductQuickViewProps) => {
  const locale = useLocale();

  if (!product) {
    return null;
  }

  return (
    <Modal isOpen={Boolean(product)} onClose={onClose} title={getLocalizedText(product.name, locale)}>
      <QuickViewContent key={product.id} product={product} onClose={onClose} />
    </Modal>
  );
};

const QuickViewContent = ({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) => {
  const dictionary = useTranslation();
  const locale = useLocale();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? '');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? '');

  const addToCart = () => {
    addItem(product, selectedSize, selectedColor, 1);
    toast.success(dictionary.common.addedToCart);
    onClose();
  };

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <img
        src={product.images[0]}
        alt={getLocalizedText(product.name, locale)}
        className="aspect-[4/5] max-h-[48svh] w-full rounded-[20px] object-cover sm:max-h-none sm:rounded-[28px]"
      />
      <div className="space-y-4 sm:space-y-5">
        <div className="space-y-3">
          <RatingStars value={product.rating} />
          <p className="text-sm leading-7 text-neutral-600">
            {getLocalizedText(product.description, locale)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold sm:text-2xl">{formatCurrency(product.price, locale)}</span>
          {product.oldPrice ? (
            <span className="text-sm text-neutral-400 line-through">
              {formatCurrency(product.oldPrice, locale)}
            </span>
          ) : null}
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">{dictionary.product.selectSize}</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`rounded-full px-3.5 py-2 text-sm ring-1 transition sm:px-4 ${
                  selectedSize === size
                    ? 'bg-ink text-white ring-ink'
                    : 'ring-black/10 hover:-translate-y-0.5 hover:bg-neutral-950 hover:text-white hover:ring-neutral-950'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">{dictionary.product.selectColor}</p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`rounded-full px-3.5 py-2 text-sm ring-1 transition sm:px-4 ${
                  selectedColor === color
                    ? 'bg-ink text-white ring-ink'
                    : 'ring-black/10 hover:-translate-y-0.5 hover:bg-neutral-950 hover:text-white hover:ring-neutral-950'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
        <div className="surface-panel p-4 text-sm leading-7 text-neutral-600">
          <p>
            <span className="font-semibold text-inherit">{dictionary.product.material}: </span>
            {getLocalizedText(product.material, locale)}
          </p>
        </div>
        <Button className="w-full" onClick={addToCart}>
          {dictionary.common.addToCart}
        </Button>
      </div>
    </div>
  );
};
