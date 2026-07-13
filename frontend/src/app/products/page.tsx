import { Suspense } from "react";
import type { Metadata } from "next";
import {
  getCategories,
  getProductListing,
  type ProductFilters,
} from "@/lib/api";
import {
  ProductCard,
  ProductCardSkeleton,
  FilterSidebar,
  MobileFilterDrawer,
  SortDropdown,
  Pagination,
  ActiveFilters,
} from "@/components/products";

export const metadata: Metadata = {
  title: "Products — VeloceMart",
  description:
    "Browse our curated collection of premium fashion and accessories.",
};

/* ── Search params type (Next.js 16) ──────────────────────── */

interface SearchParams {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  size?: string | string[];
  color?: string | string[];
  search?: string;
}

/* ── Helpers ──────────────────────────────────────────────── */

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

/* ── Loading Skeletons ────────────────────────────────────── */

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

/* ── Page Component ───────────────────────────────────────── */

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  /* Parse filter params */
  const filters: ProductFilters = {
    page: sp.page ? parseInt(sp.page, 10) : 1,
    limit: sp.limit ? parseInt(sp.limit, 10) : 24,
    sortBy: sp.sortBy ?? "createdAt",
    sortOrder: (sp.sortOrder as "asc" | "desc") ?? "desc",
  };
  if (sp.categoryId) filters.categoryId = sp.categoryId;
  if (sp.minPrice) filters.minPrice = parseInt(sp.minPrice, 10);
  if (sp.maxPrice) filters.maxPrice = parseInt(sp.maxPrice, 10);
  if (sp.search) filters.search = sp.search;

  /* Array params: size, color — backend takes a single value,
     so pick the first for the query, but display all as active filters */
  const sizes = toArray(sp.size);
  const colors = toArray(sp.color);
  if (sizes.length > 0) filters.size = sizes[0];
  if (colors.length > 0) filters.color = colors[0];

  /* Fetch data */
  const [listing, categories] = await Promise.all([
    getProductListing(filters),
    getCategories(),
  ]);

  const { data: products, meta } = listing;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Products</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {meta.total} product{meta.total !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="flex gap-8">
        {/* ── Sidebar (desktop) ─────────────────────────── */}
        <div className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">
            <Suspense fallback={<SidebarSkeleton />}>
              <FilterSidebar categories={categories} />
            </Suspense>
          </div>
        </div>

        {/* ── Main content ──────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Sort bar + active filters */}
          <div className="mb-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <MobileFilterDrawer categories={categories} />
              <SortDropdown />
            </div>

            <ActiveFilters />
          </div>

          {/* Product grid */}
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

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="mt-8">
              <Pagination totalPages={meta.totalPages} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Empty state ──────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
      <svg
        className="mb-4 h-12 w-12 text-text-muted/50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-text-primary">
        No products found
      </h3>
      <p className="mt-1 max-w-sm text-sm text-text-secondary">
        Try adjusting your filters or search terms to find what you&apos;re
        looking for.
      </p>
    </div>
  );
}
