export const ProductCardSkeleton = () => (
  <div className="surface-panel overflow-hidden">
    <div className="aspect-[4/5] animate-pulse bg-neutral-200" />
    <div className="space-y-3 p-4 sm:p-5">
      <div className="h-3 w-24 animate-pulse rounded-full bg-neutral-200" />
      <div className="h-5 w-2/3 animate-pulse rounded-full bg-neutral-200" />
      <div className="h-4 w-1/3 animate-pulse rounded-full bg-neutral-200" />
    </div>
  </div>
);

export const PageSkeleton = () => (
  <div className="container-shell section-space space-y-8">
    <div className="h-10 w-52 animate-pulse rounded-full bg-neutral-200" />
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

export const LoadingScreen = ({ message }: { message: string }) => (
  <div className="flex min-h-screen items-center justify-center px-4 sm:px-6">
    <div className="glass-panel max-w-lg px-5 py-8 text-center sm:px-8 sm:py-10">
      <img
        src="/brand-logo.png"
        alt="ALEXANDRA LIMITED COLLECTION"
        className="mx-auto mb-6 h-16 w-16 animate-pulse rounded-full bg-black object-cover sm:h-20 sm:w-20"
      />
      <h2 className="font-heading text-2xl font-bold leading-tight">
        ALEXANDRA LIMITED COLLECTION
      </h2>
      <p className="mt-3 text-sm leading-7 text-neutral-600">{message}</p>
    </div>
  </div>
);
