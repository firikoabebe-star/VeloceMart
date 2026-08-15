import { Suspense } from "react";
import { getCategories, getProductListing, type ProductFilters } from "@/lib/api";
import {
  ProductCard,
  ProductCardSkeleton,
  FilterSidebar,
  MobileFilterDrawer,
  SortDropdown,
  Pagination,
  ActiveFilters,
  EmptyState,
} from "@/components/products";

interface ProductListingProps {
  title: string;
  description?: string;
  filters: ProductFilters;
  basePath: string;
}

export default async function ProductListing({
  title,
  description,
  filters,
  basePath,
}: ProductListingProps) {
  const [listing, categories] = await Promise.all([
    getProductListing(filters),
    getCategories(),
  ]);
  const { data: products, meta } = listing;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-text-secondary">{description}</p>
        )}
        <p className="mt-1 text-sm text-text-secondary">
          {meta.total} product{meta.total !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="flex gap-8">
        <div className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">
            <Suspense fallback={<SidebarSkeleton />}>
              <FilterSidebar categories={categories} basePath={basePath} />
            </Suspense>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <MobileFilterDrawer categories={categories} basePath={basePath} />
              <SortDropdown basePath={basePath} />
            </div>
            <ActiveFilters basePath={basePath} />
          </div>

          <Suspense fallback={<ProductGridSkeleton />}>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </Suspense>

          {meta.totalPages > 1 && (
            <div className="mt-8">
              <Pagination totalPages={meta.totalPages} basePath={basePath} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border-t border-border/40 pt-4">
          <div className="mb-3 h-3 w-16 animate-pulse rounded bg-surface-tertiary" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div
                key={j}
                className="h-8 animate-pulse rounded-lg bg-surface-tertiary"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}