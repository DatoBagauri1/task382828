import { Link } from 'react-router-dom';

import { Button } from '@/components/common/button';
import { EmptyState } from '@/components/common/empty-state';
import { SEO } from '@/components/common/seo';
import { ProductCard } from '@/components/product/product-card';
import { useTranslation } from '@/hooks/use-translation';
import { useCommerceStore } from '@/store/commerce-store';
import { useWishlistStore } from '@/store/wishlist-store';

export const WishlistPage = () => {
  const dictionary = useTranslation();
  const products = useCommerceStore((state) => state.products);
  const wishlistItems = useWishlistStore((state) => state.items);
  const wishlistedProducts = products.filter((product) =>
    wishlistItems.some((item) => item.productId === product.id),
  );

  return (
    <>
      <SEO title={`${dictionary.wishlist.title} | ALEXANDRA LIMITED COLLECTION`} description={dictionary.wishlist.description} />
      <div className="container-shell section-space">
        <div className="mb-8">
          <p className="eyebrow">{dictionary.nav.wishlist}</p>
          <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight">
            {dictionary.wishlist.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-neutral-600 sm:text-base">
            {dictionary.wishlist.description}
          </p>
        </div>

        {wishlistedProducts.length ? (
          <>
            <div className="mb-6">
              <Link to="/shop">
                <Button variant="secondary">{dictionary.common.continueShopping}</Button>
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {wishlistedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            title={dictionary.wishlist.emptyTitle}
            description={dictionary.wishlist.emptyDescription}
            actionHref="/shop"
            actionLabel={dictionary.common.shopNow}
          />
        )}
      </div>
    </>
  );
};
