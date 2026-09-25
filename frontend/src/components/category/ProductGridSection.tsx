"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { type Product } from "@/lib/api";
import { fetchGroupProducts } from "@/lib/product-groups";
import { type CategoryGroup } from "@/lib/navigation";
import ProductCard from "@/components/products/ProductCard";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";
import EmptyState from "@/components/products/EmptyState";
import { useLanding } from "./landing-context";

type SortKey = "newest" | "price-asc" | "price-desc" | "name";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name A–Z" },
];

function minPrice(p: Product): number {
  return p.variants.length > 0
    ? Math.min(...p.variants.map((v) => v.price))
    : Number.POSITIVE_INFINITY;
}

export default function ProductGridSection({
  groups,
  initialProducts,
}: {
  groups: CategoryGroup[];
  initialProducts: Product[];
}) {
  const { activeGroup } = useLanding();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<SortKey>("newest");
  const cache = useRef<Map<string, Product[]>>(
    new Map([[groups[0].label, initialProducts]]),
  );

  useEffect(() => {
    const cached = cache.current.get(activeGroup);
    if (cached) {
      setProducts(cached);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchGroupProducts(groups.find((g) => g.label === activeGroup)!).then(
      (fetched) => {
        if (cancelled) return;
        cache.current.set(activeGroup, fetched);
        setProducts(fetched);
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [activeGroup, groups]);

  const sorted = useMemo(() => {
    const list = [...products];
    switch (sort) {
      case "price-asc":
        return list.sort((a, b) => minPrice(a) - minPrice(b));
      case "price-desc":
        return list.sort((a, b) => minPrice(b) - minPrice(a));
      case "name":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
  }, [products, sort]);

  const heading =
    activeGroup === "Kids by Age" ? "Shop by Age" : `Shop ${activeGroup}`;

  return (
    <section
      id="shop"
      aria-labelledby="shop-heading"
      className="mx-auto max-w-7xl scroll-mt-[120px] px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h2 id="shop-heading" className="text-2xl font-bold tracking-tight text-text-primary">
            {heading}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {loading ? "Loading…" : `${sorted.length} products`}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-text-secondary">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent-strong focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : sorted.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      {!loading && sorted.length === 0 && (
        <div className="py-10">
          <EmptyState />
        </div>
      )}
    </section>
  );
}
