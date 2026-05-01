import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { Badge } from '@/components/common/badge';
import { Button } from '@/components/common/button';
import { DropdownSelect } from '@/components/common/dropdown-select';
import { SEO } from '@/components/common/seo';
import { SectionHeading } from '@/components/common/section-heading';
import { EmptyState } from '@/components/common/empty-state';
import { ProductCard } from '@/components/product/product-card';
import { ProductQuickView } from '@/components/product/product-quick-view';
import { useLocale, useTranslation } from '@/hooks/use-translation';
import { useCommerceStore } from '@/store/commerce-store';
import type { Product, ProductGender } from '@/types';
import { getLocalizedText, unique } from '@/utils/format';

const PRODUCTS_PER_PAGE = 12;
const genderOptions: ProductGender[] = ['women', 'men', 'unisex'];

const parseGender = (value: string | null): ProductGender | '' =>
  genderOptions.includes(value as ProductGender) ? (value as ProductGender) : '';

const filterPillClass = (isActive: boolean) =>
  `rounded-full px-3.5 py-2 text-sm ring-1 transition duration-200 sm:px-4 ${
    isActive
      ? 'bg-ink text-white ring-ink shadow-soft'
      : 'ring-black/10 can-hover:hover:-translate-y-0.5 can-hover:hover:bg-neutral-950 can-hover:hover:text-white can-hover:hover:ring-neutral-950'
  }`;

export const ShopPage = () => {
  const dictionary = useTranslation();
  const locale = useLocale();
  const categories = useCommerceStore((state) => state.categories);
  const products = useCommerceStore((state) => state.products);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const selectedCategory = searchParams.get('category') ?? '';
  const selectedGender = parseGender(searchParams.get('gender'));
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>(
    searchParams.get('flag') === 'sale' ? 'price-asc' : 'newest',
  );
  const [maxPrice, setMaxPrice] = useState(400);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const deferredSearch = useDeferredValue(search);

  const updateFilterParam = (key: 'category' | 'gender', value: string) => {
    const nextParams = new URLSearchParams(searchParams);

    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }

    setSearchParams(nextParams, { replace: true });
  };

  const updateCategory = (category: string) => {
    updateFilterParam('category', category);
  };

  const updateGender = (gender: ProductGender | '') => {
    updateFilterParam('gender', gender);
  };

  const availableSizes = useMemo(() => unique(products.flatMap((product) => product.sizes)), [products]);
  const availableColors = useMemo(
    () => unique(products.flatMap((product) => product.colors)),
    [products],
  );
  const categoryOptions = useMemo(
    () => [
      { value: '', label: dictionary.common.all },
      ...categories.map((category) => ({
        value: String(category.slug),
        label: getLocalizedText(category.name, locale),
      })),
    ],
    [categories, dictionary.common.all, locale],
  );
  const genderDropdownOptions = useMemo(
    () => [
      { value: '', label: dictionary.gender.all },
      ...genderOptions.map((gender) => ({
        value: gender,
        label: dictionary.gender[gender],
      })),
    ],
    [dictionary.gender],
  );
  const sortOptions = useMemo(
    () => [
      { value: 'newest', label: dictionary.shop.sortOptions.newest },
      { value: 'price-asc', label: dictionary.shop.sortOptions['price-asc'] },
      { value: 'price-desc', label: dictionary.shop.sortOptions['price-desc'] },
      { value: 'popular', label: dictionary.shop.sortOptions.popular },
    ],
    [dictionary.shop.sortOptions],
  );

  const filteredProducts = useMemo(() => {
    const flag = searchParams.get('flag');
    const query = deferredSearch.trim().toLowerCase();
    let next = products.filter((product) => {
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
      const matchesGender = selectedGender ? product.gender === selectedGender : true;
      const matchesPrice = product.price <= maxPrice;
      const matchesSize =
        selectedSizes.length > 0 ? selectedSizes.some((size) => product.sizes.includes(size)) : true;
      const matchesColor =
        selectedColors.length > 0
          ? selectedColors.some((color) => product.colors.includes(color))
          : true;
      const matchesSearch = query
        ? [
            getLocalizedText(product.name, locale),
            getLocalizedText(product.description, locale),
            ...product.tags,
          ]
            .join(' ')
            .toLowerCase()
            .includes(query)
        : true;
      const matchesFlag =
        flag === 'sale'
          ? product.flags.isSale
          : flag === 'new'
            ? product.flags.isNew
            : true;

      return (
        matchesCategory &&
        matchesGender &&
        matchesPrice &&
        matchesSize &&
        matchesColor &&
        matchesSearch &&
        matchesFlag
      );
    });

    next = [...next].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'popular':
          return b.popularity - a.popularity;
        case 'newest':
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });

    return next;
  }, [products, selectedCategory, selectedGender, maxPrice, selectedSizes, selectedColors, deferredSearch, searchParams, locale, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);

  useEffect(() => {
    startTransition(() => setPage(1));
  }, [selectedCategory, selectedGender, maxPrice, selectedSizes, selectedColors, deferredSearch, sortBy]);

  return (
    <>
      <SEO title={`${dictionary.shop.title} | ALEXANDRA LIMITED COLLECTION`} description={dictionary.shop.description} />
      <div className="container-shell section-space">
        <SectionHeading
          eyebrow={dictionary.common.discover}
          title={dictionary.shop.title}
          description={dictionary.shop.description}
        />

        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
          <aside className="surface-panel h-fit">
            <div className="rounded-t-[20px] bg-neutral-950 p-4 text-white sm:rounded-t-2xl sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <h3 className="font-semibold">{dictionary.shop.filters}</h3>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setMaxPrice(400);
                    setSelectedSizes([]);
                    setSelectedColors([]);
                    setSearchParams({});
                  }}
                >
                  {dictionary.shop.clearFilters}
                </Button>
              </div>
            </div>

            <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
              <DropdownSelect
                label={dictionary.shop.category}
                value={selectedCategory}
                options={categoryOptions}
                onChange={updateCategory}
              />

              <DropdownSelect
                label={dictionary.shop.gender}
                value={selectedGender}
                options={genderDropdownOptions}
                onChange={(value) => updateGender(parseGender(value))}
              />

              <div className="space-y-3 rounded-[20px] border border-neutral-200 bg-neutral-50 p-3.5 sm:rounded-[24px] sm:p-4">
                <label className="flex items-center justify-between gap-3 text-sm font-semibold">
                  <span>{dictionary.shop.price}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs ring-1 ring-neutral-200">
                    0 - {maxPrice}
                  </span>
                </label>
                <input
                  type="range"
                  min={50}
                  max={400}
                  step={10}
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(Number(event.target.value))}
                  className="w-full accent-black"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold">{dictionary.shop.sizes}</label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() =>
                        setSelectedSizes((current) =>
                          current.includes(size)
                            ? current.filter((item) => item !== size)
                            : [...current, size],
                        )
                      }
                      className={filterPillClass(selectedSizes.includes(size))}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold">{dictionary.shop.colors}</label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.slice(0, 12).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setSelectedColors((current) =>
                          current.includes(color)
                            ? current.filter((item) => item !== color)
                            : [...current, color],
                        )
                      }
                      className={filterPillClass(selectedColors.includes(color))}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-[22px] border border-neutral-200 bg-neutral-50 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:rounded-[32px] sm:p-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={dictionary.shop.searchPlaceholder}
                  className="min-h-12 w-full rounded-full border border-neutral-300 bg-white pl-11 pr-4 text-base outline-none focus:border-neutral-950 sm:text-sm"
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Badge className="justify-center">
                  {dictionary.shop.showing} {filteredProducts.length} {dictionary.shop.results}
                </Badge>
                <DropdownSelect
                  label={dictionary.shop.sortBy}
                  value={sortBy}
                  options={sortOptions}
                  onChange={(value) =>
                    setSortBy(value as 'newest' | 'price-asc' | 'price-desc' | 'popular')
                  }
                  className="z-20 w-full sm:w-64"
                />
              </div>
            </div>

            {paginatedProducts.length ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                  ))}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-neutral-600">
                    {dictionary.shop.page} {page} {dictionary.shop.of} {totalPages}
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:flex">
                    <Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
                      {dictionary.common.previous}
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      {dictionary.common.next}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState
                title={dictionary.shop.noResults}
                description={dictionary.shop.description}
                actionHref="/shop"
                actionLabel={dictionary.shop.clearFilters}
              />
            )}
          </div>
        </div>
      </div>

      <ProductQuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
};
