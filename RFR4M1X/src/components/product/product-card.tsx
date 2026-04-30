import { Eye, Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { Badge } from '@/components/common/badge';
import { useLocale, useTranslation } from '@/hooks/use-translation';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import type { Product } from '@/types';
import { formatCurrency, getLocalizedText } from '@/utils/format';

type ProductCardProps = {
  product: Product;
  onQuickView?: (product: Product) => void;
};

export const ProductCard = ({ product, onQuickView }: ProductCardProps) => {
  const dictionary = useTranslation();
  const locale = useLocale();
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product.id));

  const addDefaultVariant = () => {
    addItem(product, product.sizes[0] ?? 'One Size', product.colors[0] ?? 'Default', 1);
    toast.success(dictionary.common.addedToCart);
  };

  return (
    <article className="group surface-panel overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-glass">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={product.images[0]}
          alt={getLocalizedText(product.name, locale)}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/35 via-transparent to-transparent opacity-80" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.flags.isNew ? <Badge>{dictionary.common.new}</Badge> : null}
          {product.flags.isSale ? <Badge className="bg-black text-white">{dictionary.common.sale}</Badge> : null}
        </div>
        <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-100 transition duration-300 sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            className="rounded-full bg-white/90 p-3 text-neutral-900 shadow-soft transition hover:-translate-y-0.5 hover:bg-neutral-950 hover:text-white"
            aria-label={dictionary.common.addToWishlist}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => onQuickView?.(product)}
            className="rounded-full bg-white/90 p-3 text-neutral-900 shadow-soft transition hover:-translate-y-0.5 hover:bg-neutral-950 hover:text-white"
            aria-label={dictionary.common.quickView}
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            {product.category} / {dictionary.gender[product.gender]}
          </p>
          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="font-heading text-2xl font-bold leading-tight transition group-hover:text-neutral-950">
              {getLocalizedText(product.name, locale)}
            </h3>
          </Link>
          <p className="line-clamp-2 text-sm leading-7 text-neutral-600">
            {getLocalizedText(product.description, locale)}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{formatCurrency(product.price, locale)}</span>
            {product.oldPrice ? (
              <span className="text-sm text-neutral-400 line-through">
                {formatCurrency(product.oldPrice, locale)}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={addDefaultVariant}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/5 transition hover:bg-ink hover:text-white"
            aria-label={dictionary.common.addToCart}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
};
