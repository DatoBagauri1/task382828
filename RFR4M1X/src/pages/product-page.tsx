import { Heart, ShoppingBag } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';

import { Badge } from '@/components/common/badge';
import { Button } from '@/components/common/button';
import { SEO } from '@/components/common/seo';
import { SectionHeading } from '@/components/common/section-heading';
import { ProductGallery } from '@/components/product/product-gallery';
import { ProductCard } from '@/components/product/product-card';
import { ProductQuickView } from '@/components/product/product-quick-view';
import { RatingStars } from '@/components/product/rating-stars';
import { reviewTemplates } from '@/lib/catalog';
import { useLocale, useTranslation } from '@/hooks/use-translation';
import { useCartStore } from '@/store/cart-store';
import { useCommerceStore } from '@/store/commerce-store';
import { useWishlistStore } from '@/store/wishlist-store';
import type { Product } from '@/types';
import { formatCurrency, getLocalizedText } from '@/utils/format';

export const ProductPage = () => {
  const { slug } = useParams();
  const dictionary = useTranslation();
  const locale = useLocale();
  const products = useCommerceStore((state) => state.products);
  const categories = useCommerceStore((state) => state.categories);
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const product = products.find((entry) => entry.slug === slug);

  const relatedProducts = useMemo(
    () =>
      products
        .filter((entry) => entry.category === product?.category && entry.id !== product?.id)
        .slice(0, 4),
    [product, products],
  );

  if (!product) {
    return (
      <div className="container-shell section-space">
        <SectionHeading
          title={dictionary.misc.productNotFoundTitle}
          description={dictionary.misc.productNotFoundDescription}
        />
      </div>
    );
  }

  const activeSize = selectedSize || product.sizes[0] || 'One Size';
  const activeColor = selectedColor || product.colors[0] || 'Default';
  const category = categories.find((entry) => entry.slug === product.category);
  const categoryLabel = category ? getLocalizedText(category.name, locale) : product.category.replace(/-/g, ' ');

  const addToCart = () => {
    addItem(product, activeSize, activeColor, 1);
    toast.success(dictionary.common.addedToCart);
  };

  return (
    <>
      <SEO
        title={`${getLocalizedText(product.name, locale)} | ALEXANDRA LIMITED COLLECTION`}
        description={getLocalizedText(product.description, locale)}
        image={product.images[0]}
      />
      <div className="container-shell section-space">
        <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <ProductGallery images={product.images} alt={getLocalizedText(product.name, locale)} />
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {product.flags.isFeatured ? <Badge>{dictionary.common.featured}</Badge> : null}
                {product.flags.isNew ? <Badge>{dictionary.common.new}</Badge> : null}
                {product.flags.isSale ? <Badge className="bg-black text-white">{dictionary.common.sale}</Badge> : null}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                  {categoryLabel} / {dictionary.gender[product.gender]}
                </p>
                <h1 className="mt-3 break-words font-heading text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                  {getLocalizedText(product.name, locale)}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <RatingStars value={product.rating} />
                <span className="text-sm text-neutral-500">
                  {product.reviewCount} {dictionary.common.reviews}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl font-bold sm:text-3xl">{formatCurrency(product.price, locale)}</span>
                {product.oldPrice ? (
                  <span className="text-base text-neutral-400 line-through">
                    {formatCurrency(product.oldPrice, locale)}
                  </span>
                ) : null}
              </div>
              <p className="text-sm leading-8 text-neutral-600 sm:text-base">
                {getLocalizedText(product.description, locale)}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
              <div>
                <p className="mb-3 text-sm font-semibold">{dictionary.product.selectSize}</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-full px-3.5 py-2 text-sm ring-1 transition sm:px-4 ${
                        activeSize === size
                          ? 'bg-ink text-white ring-ink'
                          : 'ring-black/10 can-hover:hover:-translate-y-0.5 can-hover:hover:bg-neutral-950 can-hover:hover:text-white can-hover:hover:ring-neutral-950'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-semibold">{dictionary.product.selectColor}</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`rounded-full px-3.5 py-2 text-sm ring-1 transition sm:px-4 ${
                        activeColor === color
                          ? 'bg-ink text-white ring-ink'
                          : 'ring-black/10 can-hover:hover:-translate-y-0.5 can-hover:hover:bg-neutral-950 can-hover:hover:text-white can-hover:hover:ring-neutral-950'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="surface-panel grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <div>
                <p className="text-sm font-semibold">{dictionary.product.material}</p>
                <p className="mt-2 text-sm leading-7 text-neutral-600">
                  {getLocalizedText(product.material, locale)}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold">{dictionary.product.care}</p>
                <p className="mt-2 text-sm leading-7 text-neutral-600">
                  {getLocalizedText(product.careInstructions, locale)}
                </p>
              </div>
            </div>

            <div className="surface-panel flex flex-wrap items-center gap-3 p-4 sm:p-5">
              <Badge className={product.stock <= 6 ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-900'}>
                {product.stock <= 6 ? dictionary.product.lowStock : dictionary.product.inStock}
              </Badge>
              <p className="text-sm text-neutral-600">
                {dictionary.common.stock}: {product.stock}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="flex-1" size="lg" onClick={addToCart}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                {dictionary.common.addToCart}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart className={`mr-2 h-4 w-4 ${isWishlisted(product.id) ? 'fill-current' : ''}`} />
                {isWishlisted(product.id)
                  ? dictionary.common.removeFromWishlist
                  : dictionary.common.addToWishlist}
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="surface-panel p-5 text-sm leading-7 text-neutral-600">
                {dictionary.product.shipping}
              </div>
              <div className="surface-panel p-5 text-sm leading-7 text-neutral-600">
                {dictionary.product.returns}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-20">
          <SectionHeading
            eyebrow={dictionary.common.review}
            title={dictionary.product.reviewSummary}
            description={`${product.reviewCount} ${dictionary.common.reviews}`}
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {reviewTemplates.map((review) => (
              <div key={review.id} className="surface-panel p-6">
                <RatingStars value={review.rating} />
                <h3 className="mt-4 break-words font-heading text-xl font-bold leading-tight sm:text-2xl">
                  {getLocalizedText(review.title, locale)}
                </h3>
                <p className="mt-3 text-sm leading-8 text-neutral-600">
                  {getLocalizedText(review.body, locale)}
                </p>
                <p className="mt-6 text-sm font-semibold text-neutral-500">
                  {review.author}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 sm:mt-20">
          <SectionHeading
            eyebrow={dictionary.common.discover}
            title={dictionary.product.related}
            action={
              <Link to="/shop">
                <Button variant="ghost">{dictionary.common.viewAll}</Button>
              </Link>
            }
          />
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        </div>
      </div>

      <ProductQuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
};
