import { motion } from 'framer-motion';
import { ArrowRight, Quote } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/common/badge';
import { Button } from '@/components/common/button';
import { SEO } from '@/components/common/seo';
import { SectionHeading } from '@/components/common/section-heading';
import { ProductCard } from '@/components/product/product-card';
import { ProductQuickView } from '@/components/product/product-quick-view';
import { heroStats, homeGallery, testimonials } from '@/lib/catalog';
import { useLocale, useTranslation } from '@/hooks/use-translation';
import { useCommerceStore } from '@/store/commerce-store';
import type { Product } from '@/types';
import { getLocalizedText } from '@/utils/format';

const heroImage =
  'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80';

export const HomePage = () => {
  const dictionary = useTranslation();
  const locale = useLocale();
  const categories = useCommerceStore((state) => state.categories);
  const products = useCommerceStore((state) => state.products);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [heroName, ...heroTailWords] = dictionary.home.heroTitle.split(' ');
  const heroTail = heroTailWords.join(' ');

  const featuredProducts = useMemo(
    () => products.filter((product) => product.flags.isFeatured).slice(0, 4),
    [products],
  );
  const trendingProducts = useMemo(
    () => [...products].sort((a, b) => b.popularity - a.popularity).slice(0, 8),
    [products],
  );
  const saleProducts = useMemo(
    () => products.filter((product) => product.flags.isSale).slice(0, 4),
    [products],
  );

  return (
    <>
      <SEO
        title={`${dictionary.brand} | Clothing store`}
        description={dictionary.home.heroDescription}
      />

      <section className="overflow-hidden">
        <div className="container-shell section-space">
          <div className="glass-panel grid gap-6 overflow-hidden p-4 sm:gap-10 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
            <div className="relative flex flex-col justify-between gap-6 sm:gap-8">
              <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-neutral-100 blur-3xl" />
              <div className="relative space-y-6">
                <p className="inline-flex rounded-full border border-neutral-300 bg-white/80 px-4 py-2 font-display text-base font-semibold italic leading-none text-neutral-950 shadow-soft sm:text-lg">
                  {dictionary.home.heroEyebrow}
                </p>
                <div className="space-y-4">
                  <h1 className="max-w-3xl text-balance font-display text-neutral-950">
                    <span className="block text-[clamp(2.35rem,14.5vw,5.65rem)] font-bold leading-[0.86] sm:leading-[0.82]">
                      {heroName}
                    </span>
                    <span className="mt-2 block max-w-[13ch] font-heading text-[clamp(1.05rem,6vw,2.25rem)] font-extrabold uppercase leading-none text-neutral-700 sm:max-w-none">
                      {heroTail}
                    </span>
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">
                    {dictionary.home.heroDescription}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to="/shop">
                    <Button size="lg">{dictionary.home.heroPrimary}</Button>
                  </Link>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                {heroStats.map((stat) => (
                  <div key={stat.value} className="surface-panel p-3.5 sm:p-4">
                    <p className="font-heading text-2xl font-bold sm:text-3xl">{stat.value}</p>
                    <p className="mt-2 text-sm text-neutral-600">
                      {getLocalizedText(stat.label, locale)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative min-h-[300px] overflow-hidden rounded-[24px] sm:min-h-[420px] sm:rounded-[36px]"
            >
              <img
                src={heroImage}
                alt={dictionary.brand}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/45 via-neutral-950/10 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 glass-panel p-4 sm:bottom-6 sm:left-6 sm:right-6 sm:p-5">
                <p className="eyebrow">{dictionary.common.featured}</p>
                <p className="mt-3 font-heading text-xl font-bold leading-tight sm:text-2xl">
                  {dictionary.misc.heroCardTitle}
                </p>
                <p className="mt-2 line-clamp-3 text-sm leading-7 text-neutral-600 sm:line-clamp-none">
                  {dictionary.misc.heroCardDescription}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container-shell">
          <SectionHeading
            eyebrow={dictionary.common.featured}
            title={dictionary.home.featuredTitle}
            description={dictionary.home.featuredDescription}
            action={
              <Link to="/shop">
                <Button variant="ghost">{dictionary.common.viewAll}</Button>
              </Link>
            }
          />
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container-shell">
          <SectionHeading
            eyebrow={dictionary.common.discover}
            title={dictionary.home.categoriesTitle}
            description={dictionary.home.categoriesDescription}
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/shop?category=${category.slug}`}
                className="group overflow-hidden rounded-[32px] bg-black/5"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={category.image}
                    alt={getLocalizedText(category.name, locale)}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/55 via-neutral-950/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-heading text-2xl font-bold leading-tight sm:text-3xl">
                          {getLocalizedText(category.name, locale)}
                        </h3>
                        <p className="mt-2 max-w-sm text-sm leading-7 text-white/80">
                          {getLocalizedText(category.description, locale)}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container-shell">
          <SectionHeading
            eyebrow={dictionary.common.popular}
            title={dictionary.home.trendingTitle}
            description={dictionary.home.trendingDescription}
          />
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {trendingProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container-shell">
          <div className="surface-panel grid gap-6 overflow-hidden p-4 sm:gap-8 sm:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
            <div className="space-y-5">
              <Badge className="bg-black text-white">{dictionary.common.sale}</Badge>
              <div>
                <h2 className="break-words font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  {dictionary.home.saleTitle}
                </h2>
                <p className="mt-4 text-sm leading-8 text-neutral-600 sm:text-base">
                  {dictionary.home.saleDescription}
                </p>
              </div>
              <Link to="/shop?flag=sale">
                <Button>{dictionary.common.shopNow}</Button>
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {saleProducts.map((product) => (
                <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container-shell">
          <SectionHeading
            eyebrow={dictionary.common.review}
            title={dictionary.home.testimonialsTitle}
            description={dictionary.home.testimonialsDescription}
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.id} className="surface-panel p-6">
                <Quote className="h-8 w-8 text-neutral-950" />
                <p className="mt-4 text-sm leading-8 text-neutral-600">
                  {getLocalizedText(item.quote, locale)}
                </p>
                <div className="mt-6">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-neutral-500">
                    {getLocalizedText(item.role, locale)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container-shell">
          <SectionHeading
            eyebrow={dictionary.misc.socialEdit}
            title={dictionary.home.galleryTitle}
            description={dictionary.home.galleryDescription}
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {homeGallery.map((image, index) => (
              <div
                key={image}
                className={`overflow-hidden rounded-[28px] ${
                  index === 0 || index === 5 ? 'md:row-span-2' : ''
                }`}
              >
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="h-full min-h-[160px] w-full object-cover transition duration-700 hover:scale-105 sm:min-h-[220px]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space pt-0">
        <div className="container-shell">
          <div className="glass-panel p-5 text-center sm:p-10">
            <p className="eyebrow">{dictionary.common.new}</p>
            <h2 className="mt-3 break-words font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {dictionary.home.newsletterTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-neutral-600 sm:text-base">
              {dictionary.home.newsletterDescription}
            </p>
            <form
              className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                toast.success(dictionary.home.newsletterButton);
              }}
            >
              <input
                type="email"
                required
                placeholder={dictionary.home.newsletterPlaceholder}
                className="min-h-12 flex-1 rounded-full border border-black/10 bg-white/80 px-5 text-base outline-none ring-0 transition focus:border-neutral-950 sm:text-sm"
              />
              <Button size="lg" className="sm:min-w-[180px]">
                {dictionary.home.newsletterButton}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <ProductQuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
};
